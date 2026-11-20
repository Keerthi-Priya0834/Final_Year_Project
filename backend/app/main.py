from contextlib import asynccontextmanager
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_tables
from .routes.health import router as health_router
from .routes.scans import router as scans_router
from .storage import storage


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    for _ in range(20):
        try:
            storage.ensure_bucket()
            break
        except Exception:
            await asyncio.sleep(1)
    else:
        raise RuntimeError("Could not connect to MinIO during startup")
    yield


app = FastAPI(title="EyeQ API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost",
        "http://127.0.0.1",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scans_router)
app.include_router(health_router)
