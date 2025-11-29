from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, Session

from backend.models.models import User
from backend.models.db import get_session

router = APIRouter()


@router.get("/")
def get_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return {"users": users}


@router.post("/")
def create_user(user: User, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.username == user.username)).first()
    if existing:
        raise HTTPException(status_code=400, detail="username already exists")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
