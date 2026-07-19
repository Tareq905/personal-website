import sys
import os
from pathlib import Path

# Load .env from project root
from dotenv import load_dotenv
ROOT_ENV = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ROOT_ENV)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

migrations = [
    "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS youtube_url VARCHAR;",
    "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS twitter_url VARCHAR;",
    "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS email VARCHAR;",
    "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS phone VARCHAR;",
    "ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS location VARCHAR;",
]

with engine.connect() as conn:
    for sql in migrations:
        conn.execute(text(sql))
        print("OK:", sql[:60])
    conn.commit()

print("All migrations done!")
