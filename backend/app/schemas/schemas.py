from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
from app.models.models import WorkCategory
import phonenumbers


# ---- Auth ----
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- Work (Project / Research) ----
class WorkBase(BaseModel):
    category: WorkCategory
    title: str
    description: str
    tech_stack: Optional[str] = None
    image_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    featured: bool = False


class WorkCreate(WorkBase):
    pass


class WorkUpdate(BaseModel):
    category: Optional[WorkCategory] = None
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    image_url: Optional[str] = None
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    featured: Optional[bool] = None


class WorkOut(WorkBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Experience ----
class ExperienceBase(BaseModel):
    role: str
    company: str
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ExperienceOut(ExperienceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Blog ----
class BlogBase(BaseModel):
    title: str
    slug: str
    content: str
    cover_image: Optional[str] = None
    published: bool = False


class BlogCreate(BlogBase):
    pass


class BlogUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    published: Optional[bool] = None


class BlogOut(BlogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Message (Contact form) ----
class MessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    message: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        try:
            parsed = phonenumbers.parse(v, None)  # requires country code e.g. +8801...
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("Invalid phone number")
        except phonenumbers.NumberParseException:
            raise ValueError("Phone number must include country code, e.g. +8801XXXXXXXXX")
        return v


class MessageOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---- Personal Query (chatbot leads) ----
class PersonalQueryOut(BaseModel):
    id: int
    question: str
    visitor_email: Optional[str] = None
    visitor_phone: Optional[str] = None
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PersonalQueryUpdate(BaseModel):
    is_resolved: bool


# ---- Settings ----
class SiteSettingsUpdate(BaseModel):
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    youtube_url: Optional[str] = None
    twitter_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class SiteSettingsOut(SiteSettingsUpdate):
    id: int

    class Config:
        from_attributes = True


# ---- AI Chat ----
class ChatRequest(BaseModel):
    message: str
    history: Optional[list[dict]] = []
    image_base64: Optional[str] = None          # optional image attachment
    pending_personal_question: Optional[str] = None  # set by frontend when bot asked for contact info


class ChatResponse(BaseModel):
    reply: str
    awaiting_contact_info: bool = False   # tells frontend: next msg should be email/phone
    rate_limited: bool = False


class GenerateDescriptionRequest(BaseModel):
    title: str
    tech_stack: Optional[str] = None
    context: Optional[str] = None


class GenerateDescriptionResponse(BaseModel):
    description: str