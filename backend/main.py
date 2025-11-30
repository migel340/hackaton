from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth as auth_router
from routers import signals as signals_router
from routers import users as users_router
from services.db import create_db_and_tables

# Zezwalamy na komunikację z frontendem
origins = [
    "http://localhost:5173",      # Vite dev server
    "http://127.0.0.1:5173",      # Vite dev server (IP)
    "http://localhost:3000",      # Alternative frontend port
    "http://127.0.0.1:3000",      # Alternative frontend port (IP)
    "http://localhost:8080",      # Another common port
    "http://frontend:5173",       # Docker network (jeśli frontend w kontenerze)
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run startup actions
    if create_db_and_tables:
        create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1")
def read_root():
    return {"message": "XD"}


@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}


# Register routers (mounted under /api/v1)
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(users_router.router, prefix="/api/v1")
app.include_router(signals_router.router, prefix="/api/v1")

