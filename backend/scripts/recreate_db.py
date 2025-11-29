"""
Skrypt do ponownego utworzenia tabel w bazie danych.
Usuwa wszystkie istniejące tabele i tworzy je od nowa.
UWAGA: Usuwa wszystkie dane!
"""
import sys
from pathlib import Path

# Dodaj katalog główny do PYTHONPATH
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import SQLModel

from models.activity import ActivityType, UserActivity
from models.user import User
from services.db import engine


def recreate_tables():
    """Usuń i utwórz wszystkie tabele od nowa."""
    print("⚠️  UWAGA: Wszystkie dane zostaną usunięte!")
    response = input("Czy na pewno chcesz kontynuować? (tak/nie): ")
    
    if response.lower() != "tak":
        print("Operacja anulowana.")
        return
    
    print("\n🗑️  Usuwanie wszystkich tabel...")
    SQLModel.metadata.drop_all(engine)
    print("✅ Tabele usunięte")
    
    print("\n🔨 Tworzenie nowych tabel...")
    SQLModel.metadata.create_all(engine)
    print("✅ Tabele utworzone")
    
    print("\n📋 Utworzone tabele:")
    print("  - user (użytkownicy)")
    print("  - user_activity (aktywności użytkowników)")
    print("\n💼 Dostępne aktywności:")
    print("  - FREELANCER")
    print("  - IDEA_CREATOR (Pomysłodawca)")
    print("  - FUNDATOR (Fundator projektu)")
    print("\n✨ Gotowe! Baza danych została zresetowana.")


if __name__ == "__main__":
    recreate_tables()
