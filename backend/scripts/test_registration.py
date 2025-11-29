#!/usr/bin/env python3
"""Test rejestracji użytkownika"""

import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session

from models.user import User
from services.auth import get_password_hash
from services.db import create_db_and_tables, get_engine


def test_registration():
    print("🧪 Test rejestracji użytkownika\n")
    
    # 1. Utwórz tabele
    print("1. Tworzenie tabel...")
    create_db_and_tables()
    print("   ✓ Tabele utworzone\n")
    
    # 2. Test hashowania hasła
    print("2. Test hashowania hasła...")
    password = "Mihsa@dasdwa"
    hashed = get_password_hash(password)
    print(f"   ✓ Hasło zahashowane: {hashed[:50]}...\n")
    
    # 3. Dodaj użytkownika do bazy
    print("3. Dodawanie użytkownika do bazy...")
    engine = get_engine()
    
    with Session(engine) as session:
        # Sprawdź czy user już istnieje
        from sqlmodel import select
        existing = session.exec(
            select(User).where(User.username == "Lolol")
        ).first()
        
        if existing:
            print(f"   ⚠ Użytkownik 'Lolol' już istnieje (id={existing.id})")
            print(f"   Usuwam starego użytkownika...")
            session.delete(existing)
            session.commit()
        
        # Utwórz nowego
        new_user = User(
            username="Lolol",
            email="user@example.com",
            hashed_password=hashed,
            is_active=True
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        print(f"   ✓ Użytkownik utworzony:")
        print(f"     - ID: {new_user.id}")
        print(f"     - Username: {new_user.username}")
        print(f"     - Email: {new_user.email}")
        print(f"     - Active: {new_user.is_active}")
        print(f"     - Created: {new_user.created_at}\n")
    
    print("✅ Test zakończony pomyślnie!")

if __name__ == "__main__":
    try:
        test_registration()
    except Exception as e:
        print(f"❌ Błąd: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
