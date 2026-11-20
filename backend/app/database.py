from collections.abc import AsyncGenerator

from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from .config import settings


engine = create_async_engine(settings.database_url, future=True)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(_add_missing_scan_columns)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session


def _add_missing_scan_columns(sync_conn) -> None:
    inspector = inspect(sync_conn)
    if "scans" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("scans")}
    required_columns = {
        "amd_normal": "FLOAT NOT NULL DEFAULT 0.0",
        "amd_drusen": "FLOAT NOT NULL DEFAULT 0.0",
        "amd_dme": "FLOAT NOT NULL DEFAULT 0.0",
        "amd_cnv": "FLOAT NOT NULL DEFAULT 0.0",
        "stage_beginner": "FLOAT NOT NULL DEFAULT 0.0",
        "stage_intermediate": "FLOAT NOT NULL DEFAULT 0.0",
        "stage_advanced": "FLOAT NOT NULL DEFAULT 0.0",
        "visibility": "FLOAT NOT NULL DEFAULT 0.0",
        "llm_diagnosis": "TEXT",
        "llm_treatment": "TEXT",
        "llm_summary": "TEXT",
    }

    for column, definition in required_columns.items():
        if column in existing_columns:
            continue
        sync_conn.execute(text(f"ALTER TABLE scans ADD COLUMN {column} {definition}"))
