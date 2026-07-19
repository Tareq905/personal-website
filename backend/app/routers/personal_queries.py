from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import PersonalQuery
from app.schemas.schemas import PersonalQueryOut, PersonalQueryUpdate
from app.auth import get_current_admin

router = APIRouter(prefix="/api/personal-queries", tags=["personal-queries"])


@router.get("/", response_model=list[PersonalQueryOut])
def list_personal_queries(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    return db.query(PersonalQuery).order_by(desc(PersonalQuery.created_at)).all()


@router.put("/{pq_id}", response_model=PersonalQueryOut)
def update_personal_query(pq_id: int, payload: PersonalQueryUpdate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    pq = db.query(PersonalQuery).filter(PersonalQuery.id == pq_id).first()
    if not pq:
        raise HTTPException(status_code=404, detail="Not found")
    pq.is_resolved = payload.is_resolved
    db.commit()
    db.refresh(pq)
    return pq


@router.delete("/{pq_id}")
def delete_personal_query(pq_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    pq = db.query(PersonalQuery).filter(PersonalQuery.id == pq_id).first()
    if not pq:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(pq)
    db.commit()
    return {"detail": "Deleted successfully"}