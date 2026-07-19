import re
import phonenumbers
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from groq import Groq, RateLimitError
from app.database import get_db
from app.models.models import SiteSettings, Work, Experience, PersonalQuery
from app.schemas.schemas import ChatRequest, ChatResponse, GenerateDescriptionRequest, GenerateDescriptionResponse
from app.config import settings
from app.auth import get_current_admin
from app.utils.email_validator import is_valid_email

router = APIRouter(prefix="/api/ai", tags=["ai"])
client = Groq(api_key=settings.GROQ_API_KEY)

TEXT_MODEL = "llama-3.3-70b-versatile"
VISION_MODEL = "llama-3.2-90b-vision-preview"

EMAIL_REGEX = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_REGEX = re.compile(r"(\+?\d[\d\s-]{7,15}\d)")

CANNOT_ANSWER_MARKER = "[[NEED_CONTACT_INFO]]"

NO_CHEATING_REPLIES = [
    "Hmm, that doesn't look like a real number or email... No cheating! 😄 Give me your real contact info so Tareq can actually reach you.",
    "Nice try, but that looks fake 👀 I need a real email or phone number — no cheating!",
    "That one's not passing my checks 😅 Real email or real number, please — no fakes!",
]


def _is_valid_phone(phone: str) -> bool:
    try:
        parsed = phonenumbers.parse(phone, None)
        return phonenumbers.is_valid_number(parsed)
    except phonenumbers.NumberParseException:
        return False


def build_context(db: Session) -> str:
    site = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    works = db.query(Work).all()
    experiences = db.query(Experience).order_by(Experience.id.desc()).all()

    bio = site.bio if site and site.bio else "No bio set yet."

    works_text = "\n".join(
        f"- [{w.category.value}] {w.title}: {w.description} (Tech: {w.tech_stack or 'N/A'})"
        for w in works
    ) or "No projects added yet."

    exp_text = "\n".join(
        f"- {e.role} at {e.company} ({e.start_date} - {e.end_date or 'Present'}): {e.description or ''}"
        for e in experiences
    ) or "No experience added yet."

    return f"BIO:\n{bio}\n\nEXPERIENCE:\n{exp_text}\n\nPROJECTS & RESEARCH:\n{works_text}"


def build_system_prompt(context: str) -> str:
    return f"""You are "Talk with Tareq.ai" — the AI assistant embedded in Tareq's portfolio website.
Tareq is an AI Engineer specializing in AI + Security.

PERSONALITY:
- Humble, warm, casual — like Duck.ai. Keep answers concise and conversational.
- You CAN make small jokes and respond playfully to casual/funny messages.
- If the visitor writes in a language other than English, reply ONLY with:
  "Please talk with me in English 😊" — do not answer the actual question in that case.

WHAT YOU KNOW (use ONLY this to answer professional questions):
{context}

PERSONAL LIFE RULE (STRICT):
If asked about Tareq's personal life (marriage, relationships, family, religion, personal beliefs, home address, or anything NOT covered in the context above), do NOT guess or answer.
Instead reply with EXACTLY this pattern (keep it humble and natural):
"Hmm, I don't have that info with me. No worries though — I'll ask Tareq directly and get back to you! Could you share your email and phone number so he can reach you?"
Then append this exact marker at the very end of your reply on its own line: {CANNOT_ANSWER_MARKER}

Do not use the marker for any other type of question — only for genuine personal-life questions you cannot answer from context.
"""


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    context = build_context(db)

    # ---- Case 1: We previously asked for contact info ----
    if payload.pending_personal_question:
        email_match = EMAIL_REGEX.search(payload.message)
        phone_match = PHONE_REGEX.search(payload.message)

        email_ok = False
        phone_ok = False

        if email_match:
            email_ok, _ = is_valid_email(email_match.group(0))
        if phone_match:
            phone_ok = _is_valid_phone(phone_match.group(0))

        if not email_match and not phone_match:
            return ChatResponse(
                reply="I couldn't quite catch a valid email or phone number there — mind sharing again?",
                awaiting_contact_info=True,
            )

        if (email_match and not email_ok) or (phone_match and not phone_ok):
            import random
            return ChatResponse(
                reply=random.choice(NO_CHEATING_REPLIES),
                awaiting_contact_info=True,
            )

        # both present (or at least one valid) -> save
        pq = PersonalQuery(
            question=payload.pending_personal_question,
            visitor_email=email_match.group(0) if email_match and email_ok else None,
            visitor_phone=phone_match.group(0) if phone_match and phone_ok else None,
        )
        db.add(pq)
        db.commit()
        return ChatResponse(
            reply="Got it, thank you! I've noted your contact info and Tareq will personally reach out to you soon. 😊 Anything else I can help with?",
            awaiting_contact_info=False,
        )

    # ---- Case 2: Normal chat turn ----
    system_prompt = build_system_prompt(context)
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(payload.history[-10:])

    if payload.image_base64:
        model = VISION_MODEL
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": payload.message},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{payload.image_base64}"}},
            ],
        })
    else:
        model = TEXT_MODEL
        messages.append({"role": "user", "content": payload.message})

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.5,
            max_tokens=500,
        )
    except RateLimitError:
        return ChatResponse(
            reply="Temporarily limit reached, wait a bit...!",
            rate_limited=True,
        )

    reply = completion.choices[0].message.content
    awaiting = CANNOT_ANSWER_MARKER in reply
    if awaiting:
        reply = reply.replace(CANNOT_ANSWER_MARKER, "").strip()

    return ChatResponse(reply=reply, awaiting_contact_info=awaiting)


@router.post("/generate-description", response_model=GenerateDescriptionResponse)
def generate_description(payload: GenerateDescriptionRequest, admin: str = Depends(get_current_admin)):
    prompt = f"""Write a concise, professional 2-4 sentence project description for a portfolio.
Title: {payload.title}
Tech stack: {payload.tech_stack or "not specified"}
Extra context: {payload.context or "none"}

Only return the description text, no preamble."""

    try:
        completion = client.chat.completions.create(
            model=TEXT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=200,
        )
    except RateLimitError:
        return GenerateDescriptionResponse(description="Temporarily limit reached, wait a bit...!")

    description = completion.choices[0].message.content.strip()
    return GenerateDescriptionResponse(description=description)