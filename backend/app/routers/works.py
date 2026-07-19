from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app.database import get_db
from app.models.models import Work, WorkCategory
from app.schemas.schemas import WorkCreate, WorkUpdate, WorkOut
from app.auth import get_current_admin

router = APIRouter(prefix="/api/works", tags=["works"])


@router.get("/", response_model=list[WorkOut])
def list_works(category: Optional[WorkCategory] = None, db: Session = Depends(get_db)):
    query = db.query(Work)
    if category:
        query = query.filter(Work.category == category)
    return query.order_by(desc(Work.created_at)).all()


@router.get("/{work_id}", response_model=WorkOut)
def get_work(work_id: int, db: Session = Depends(get_db)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    return work


@router.post("/", response_model=WorkOut)
def create_work(payload: WorkCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    work = Work(**payload.model_dump())
    db.add(work)
    db.commit()
    db.refresh(work)
    return work


@router.put("/{work_id}", response_model=WorkOut)
def update_work(work_id: int, payload: WorkUpdate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(work, field, value)
    db.commit()
    db.refresh(work)
    return work


@router.delete("/{work_id}")
def delete_work(work_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    db.delete(work)
    db.commit()
    return {"detail": "Deleted successfully"}
