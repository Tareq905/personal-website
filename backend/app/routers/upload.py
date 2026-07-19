import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from supabase import create_client, Client
from app.config import settings
from app.auth import get_current_admin

router = APIRouter(prefix="/api/upload", tags=["upload"])

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
BUCKET = "portfolio-images"


@router.post("/image")
async def upload_image(file: UploadFile = File(...), admin: str = Depends(get_current_admin)):
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    content = await file.read()

    supabase.storage.from_(BUCKET).upload(
        filename, content, {"content-type": file.content_type}
    )
    public_url = supabase.storage.from_(BUCKET).get_public_url(filename)
    return {"url": public_url}
