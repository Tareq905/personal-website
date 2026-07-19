from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import Message
from app.schemas.schemas import MessageCreate, MessageOut
from app.auth import get_current_admin
from app.utils.email_validator import is_valid_email

router = APIRouter(prefix="/api/messages", tags=["messages"])


@router.post("/", response_model=MessageOut)
def send_message(payload: MessageCreate, db: Session = Depends(get_db)):
    is_valid, reason = is_valid_email(payload.email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=reason)

    msg = Message(**payload.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/", response_model=list[MessageOut])
def list_messages(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    return db.query(Message).order_by(desc(Message.created_at)).all()


@router.put("/{msg_id}/read", response_model=MessageOut)
def mark_read(msg_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    msg = db.query(Message).filter(Message.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg


@router.delete("/{msg_id}")
def delete_message(msg_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    msg = db.query(Message).filter(Message.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"detail": "Deleted successfully"}