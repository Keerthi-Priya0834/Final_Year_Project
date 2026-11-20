import httpx
from fastapi import APIRouter
from sqlalchemy import text

from ..config import settings
from ..database import SessionLocal
from ..storage import storage


router = APIRouter(tags=["health"])


@router.get("/api/v1/health")
async def health() -> dict:
    database_status = "disconnected"
    storage_status = "disconnected"
    inference_status = "disconnected"

    try:
        async with SessionLocal() as session:
            await session.execute(text("SELECT 1"))
        database_status = "connected"
    except Exception:
        database_status = "disconnected"

    try:
        storage.ensure_bucket()
        storage_status = "connected"
    except Exception:
        storage_status = "disconnected"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.inference_url}/health")
            response.raise_for_status()
        inference_status = "connected"
    except Exception:
        inference_status = "disconnected"

    overall = "ok"
    if "disconnected" in [database_status, storage_status, inference_status]:
        overall = "degraded"

    return {
        "status": overall,
        "database": database_status,
        "storage": storage_status,
        "inference": inference_status,
        "version": "1.0.0",
    }
