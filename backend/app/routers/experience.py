from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import Experience
from app.schemas.schemas import ExperienceCreate, ExperienceUpdate, ExperienceOut
from app.auth import get_current_admin

router = APIRouter(prefix="/api/experience", tags=["experience"])


@router.get("/", response_model=list[ExperienceOut])
def list_experience(db: Session = Depends(get_db)):
    # last added shows first
    return db.query(Experience).order_by(desc(Experience.id)).all()


@router.post("/", response_model=ExperienceOut)
def create_experience(payload: ExperienceCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    exp = Experience(**payload.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@router.put("/{exp_id}", response_model=ExperienceOut)
def update_experience(exp_id: int, payload: ExperienceUpdate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(exp, field, value)
    db.commit()
    db.refresh(exp)
    return exp


@router.delete("/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"detail": "Deleted successfully"}
