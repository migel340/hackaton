from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.routers import users as users_router
from backend.routers import auth as auth_router
from backend.services.db import create_db_and_tables
# Import DB helpers and models from the separated modules:

# Zezwalamy na komunikację z frontendem
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
app.include_router(users_router.router, prefix="/api/v1/users", tags=["users"])
app.include_router(auth_router.router, prefix="/api/v1/auth", tags=["auth"])