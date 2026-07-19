from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models.models import Blog
from app.schemas.schemas import BlogCreate, BlogUpdate, BlogOut
from app.auth import get_current_admin

router = APIRouter(prefix="/api/blogs", tags=["blogs"])


@router.get("/", response_model=list[BlogOut])
def list_blogs(published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Blog)
    if published_only:
        query = query.filter(Blog.published == True)
    return query.order_by(desc(Blog.created_at)).all()


@router.get("/{slug}", response_model=BlogOut)
def get_blog(slug: str, db: Session = Depends(get_db)):
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return blog


@router.post("/", response_model=BlogOut)
def create_blog(payload: BlogCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    blog = Blog(**payload.model_dump())
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog


@router.put("/{blog_id}", response_model=BlogOut)
def update_blog(blog_id: int, payload: BlogUpdate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(blog, field, value)
    db.commit()
    db.refresh(blog)
    return blog


@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return {"detail": "Deleted successfully"}
