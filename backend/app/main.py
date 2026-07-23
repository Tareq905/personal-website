import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_ENV = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=ROOT_ENV)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.config import settings
from app.routers import (
    auth, works, experience, blogs, messages,
    settings as settings_router, upload, chat, personal_queries
)

app = FastAPI(title="Tareq Portfolio API")

# Explicit known origins (production + local dev)
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "https://tareqshahalam.is-a.dev",
    "https://tareqshahalam.com",
    "https://www.tareqshahalam.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(works.router)
app.include_router(experience.router)
app.include_router(blogs.router)
app.include_router(messages.router)
app.include_router(settings_router.router)
app.include_router(upload.router)
app.include_router(chat.router)
app.include_router(personal_queries.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Portfolio API is running"}
