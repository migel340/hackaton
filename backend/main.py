from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import auth as auth_router
from routers import signals as signals_router
from routers import users as users_router
from services.db import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run startup actions
    if create_db_and_tables:
        create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

# Najbardziej permisywne CORS - akceptuje wszystko
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


@app.get("/api/v1")
def read_root():
    return {"message": "XD"}


@app.get("/api/v1/debug/cors")
def debug_cors():
    """Sprawdź aktualną konfigurację CORS."""
    return {
        "cors_origins": settings.CORS_ORIGINS,
        "message": "Jeśli widzisz to z frontendu, CORS działa!"
    }


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


# Register routers (mounted under /api/v1)
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(users_router.router, prefix="/api/v1")
app.include_router(signals_router.router, prefix="/api/v1")

