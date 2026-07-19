from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import SiteSettings
from app.schemas.schemas import SiteSettingsUpdate, SiteSettingsOut
from app.auth import get_current_admin

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create(db: Session) -> SiteSettings:
    settings_row = db.query(SiteSettings).filter(SiteSettings.id == 1).first()
    if not settings_row:
        settings_row = SiteSettings(id=1)
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


@router.get("/", response_model=SiteSettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return _get_or_create(db)


@router.put("/", response_model=SiteSettingsOut)
def update_settings(payload: SiteSettingsUpdate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    settings_row = _get_or_create(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings_row, field, value)
    db.commit()
    db.refresh(settings_row)
    return settings_row
