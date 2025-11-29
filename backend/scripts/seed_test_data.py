#!/usr/bin/env python3
"""
Skrypt do seedowania bazy danych testowymi danymi.
Uruchom: python scripts/seed_test_data.py
"""
import sys
from pathlib import Path

# Dodaj główny katalog do PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, select

from models.signal import SignalCategory, UserSignal
from models.user import User
from services.auth import get_password_hash
from services.db import create_db_and_tables, engine


def seed_test_users(session: Session) -> dict[str, User]:
    """Dodaje testowych użytkowników."""
    users_data = [
        {
            "username": "jan_freelancer",
            "email": "jan@freelancer.pl",
            "password": "Test1234!",
            "first_name": "Jan",
            "last_name": "Kowalski",
            "bio": "Senior Python/JS Developer z 8-letnim doświadczeniem. Specjalizuję się w FastAPI, React i AI.",
            "location": "Warszawa, Polska",
            "linkedin_url": "https://linkedin.com/in/jan-kowalski",
            "github_url": "https://github.com/jan-kowalski",
            "skills": ["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker", "AI/ML"],
            "experience_years": 8,
        },
        {
            "username": "anna_freelancer",
            "email": "anna@freelancer.pl",
            "password": "Test1234!",
            "first_name": "Anna",
            "last_name": "Nowak",
            "bio": "UX/UI Designer i Frontend Developer. Tworzę piękne i funkcjonalne interfejsy.",
            "location": "Kraków, Polska",
            "linkedin_url": "https://linkedin.com/in/anna-nowak",
            "skills": ["Figma", "React", "CSS", "UX Research", "Design Systems", "Vue.js"],
            "experience_years": 5,
        },
        {
            "username": "startup_adam",
            "email": "adam@startup.io",
            "password": "Test1234!",
            "first_name": "Adam",
            "last_name": "Wiśniewski",
            "bio": "Founder kilku startupów. Obecnie buduję platformę edtech z AI.",
            "location": "Gdańsk, Polska",
            "linkedin_url": "https://linkedin.com/in/adam-wisniewski",
            "website": "https://adam-startups.io",
            "skills": ["Product Management", "Business Development", "AI Strategy"],
            "experience_years": 12,
        },
        {
            "username": "startup_maria",
            "email": "maria@fintech.pl",
            "password": "Test1234!",
            "first_name": "Maria",
            "last_name": "Zielińska",
            "bio": "Ex-banker, teraz tworzę rozwiązania fintech. Szukam CTO i inwestorów.",
            "location": "Poznań, Polska",
            "linkedin_url": "https://linkedin.com/in/maria-zielinska",
            "skills": ["Finance", "Banking", "Compliance", "Product Strategy"],
            "experience_years": 10,
        },
        {
            "username": "investor_piotr",
            "email": "piotr@vc-fund.pl",
            "password": "Test1234!",
            "first_name": "Piotr",
            "last_name": "Malinowski",
            "bio": "Partner w VC Fund. Inwestuję w early-stage startupy z obszaru AI i SaaS.",
            "location": "Warszawa, Polska",
            "linkedin_url": "https://linkedin.com/in/piotr-malinowski-vc",
            "website": "https://vc-fund.pl",
            "skills": ["Venture Capital", "Due Diligence", "M&A", "Board Advisory"],
            "experience_years": 15,
        },
        {
            "username": "investor_katarzyna",
            "email": "katarzyna@angel.pl",
            "password": "Test1234!",
            "first_name": "Katarzyna",
            "last_name": "Dąbrowska",
            "bio": "Angel investor. Interesują mnie startupy health-tech i edu-tech.",
            "location": "Wrocław, Polska",
            "linkedin_url": "https://linkedin.com/in/katarzyna-dabrowska",
            "skills": ["Angel Investing", "Healthcare", "EdTech", "Mentoring"],
            "experience_years": 20,
        },
    ]
    
    created_users = {}
    
    for user_data in users_data:
        # Sprawdź czy użytkownik już istnieje
        existing = session.exec(
            select(User).where(User.email == user_data["email"])
        ).first()
        
        if existing:
            print(f"  ⏭️  User '{user_data['username']}' already exists, skipping...")
            created_users[user_data["username"]] = existing
            continue
        
        password = user_data.pop("password")
        new_user = User(
            **user_data,
            hashed_password=get_password_hash(password),
            is_active=True,
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        created_users[user_data["username"]] = new_user
        print(f"  ✅ Created user: {user_data['username']} (ID: {new_user.id})")
    
    return created_users


def seed_test_signals(session: Session, users: dict[str, User]) -> list[UserSignal]:
    """Dodaje testowe sygnały dla użytkowników."""
    signals_data = [
        # Freelancerzy (category_id=1)
        {
            "user": "jan_freelancer",
            "signal_category_id": 1,
            "details": {
                "role": "Backend Developer",
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AI/ML"],
                "hourly_rate": "100-150 PLN",
                "availability": "20h/tydzień",
                "looking_for": "Startupy z ciekawymi projektami AI/ML",
                "experience": "8 lat doświadczenia, pracowałem dla Google, Allegro",
            },
        },
        {
            "user": "anna_freelancer",
            "signal_category_id": 1,
            "details": {
                "role": "UX/UI Designer + Frontend",
                "skills": ["Figma", "React", "Vue.js", "CSS", "Design Systems"],
                "hourly_rate": "80-120 PLN",
                "availability": "full-time",
                "looking_for": "Startup szukający kogoś kto zaprojektuje i zakoduje frontend",
                "portfolio": "https://dribbble.com/anna-nowak",
            },
        },
        # Jan ma też drugi sygnał jako freelancer
        {
            "user": "jan_freelancer",
            "signal_category_id": 1,
            "details": {
                "role": "AI/ML Consultant",
                "skills": ["Python", "TensorFlow", "PyTorch", "LLM", "RAG"],
                "hourly_rate": "200-300 PLN",
                "availability": "10h/tydzień",
                "looking_for": "Projekty wymagające integracji z AI/LLM",
                "specialization": "RAG, Fine-tuning, Prompt Engineering",
            },
        },
        
        # Pomysły na startup (category_id=2)
        {
            "user": "startup_adam",
            "signal_category_id": 2,
            "details": {
                "name": "EduAI Platform",
                "description": "Platforma edukacyjna wykorzystująca AI do personalizacji nauki. Uczeń otrzymuje spersonalizowane materiały i ćwiczenia.",
                "stage": "MVP gotowe",
                "looking_for": ["CTO/Tech Lead", "Frontend Developer", "Inwestor seed"],
                "funding_needed": "500k PLN",
                "market": "EdTech, B2C + B2B (szkoły)",
                "traction": "200 beta userów, 30% retention",
                "tech_stack": ["Python", "React", "OpenAI API"],
            },
        },
        {
            "user": "startup_maria",
            "signal_category_id": 2,
            "details": {
                "name": "FinBot",
                "description": "Chatbot AI dla banków i firm ubezpieczeniowych. Automatyzacja obsługi klienta zgodna z regulacjami.",
                "stage": "Idea + wireframes",
                "looking_for": ["CTO - Python/AI", "Inwestor pre-seed"],
                "funding_needed": "200k PLN na MVP",
                "market": "FinTech, B2B",
                "competitive_advantage": "10 lat doświadczenia w bankach, znajomość regulacji",
                "tech_requirements": ["Python", "FastAPI", "LLM", "Compliance AI"],
            },
        },
        {
            "user": "startup_adam",
            "signal_category_id": 2,
            "details": {
                "name": "RemoteTeams",
                "description": "Platforma do zarządzania rozproszonymi zespołami. AI-powered stand-upy, automatyczne podsumowania spotkań.",
                "stage": "Concept",
                "looking_for": ["Co-founder techniczny", "UX Designer"],
                "funding_needed": "300k PLN",
                "market": "HR-Tech, B2B SaaS",
                "problem": "Zespoły remote tracą czas na zbędne spotkania i komunikację",
            },
        },
        
        # Inwestorzy (category_id=3)
        {
            "user": "investor_piotr",
            "signal_category_id": 3,
            "details": {
                "type": "VC Fund Partner",
                "focus_areas": ["AI/ML", "SaaS", "B2B"],
                "ticket_size": "500k - 2M PLN",
                "stage": ["pre-seed", "seed"],
                "looking_for": "Startupy z MVP i pierwszymi klientami",
                "value_add": ["Sieć kontaktów", "Wsparcie w rekrutacji", "Go-to-market strategy"],
                "portfolio": ["3 exits", "12 active investments"],
            },
        },
        {
            "user": "investor_katarzyna",
            "signal_category_id": 3,
            "details": {
                "type": "Angel Investor",
                "focus_areas": ["HealthTech", "EdTech", "Impact"],
                "ticket_size": "50k - 200k PLN",
                "stage": ["pre-seed"],
                "looking_for": "Passionate founders, solving real problems",
                "value_add": ["Mentoring", "Healthcare industry connections", "Product strategy"],
                "criteria": ["Strong team", "Clear problem-solution fit", "Scalable model"],
            },
        },
    ]
    
    created_signals = []
    
    for signal_data in signals_data:
        user = users.get(signal_data["user"])
        if not user:
            print(f"  ⚠️  User '{signal_data['user']}' not found, skipping signal...")
            continue
        
        # Sprawdź czy taki sygnał już istnieje (po user_id i details)
        existing = session.exec(
            select(UserSignal).where(
                UserSignal.user_id == user.id,
                UserSignal.signal_category_id == signal_data["signal_category_id"],
            )
        ).all()
        
        # Prosta heurystyka - jeśli jest już sygnał z takim samym pierwszym kluczem w details
        signal_exists = False
        for ex in existing:
            if ex.details and signal_data["details"]:
                # Porównaj pierwsze klucze
                ex_keys = list(ex.details.keys()) if isinstance(ex.details, dict) else []
                new_keys = list(signal_data["details"].keys()) if isinstance(signal_data["details"], dict) else []
                if ex_keys and new_keys and ex_keys[0] == new_keys[0]:
                    ex_first_val = ex.details.get(ex_keys[0]) if isinstance(ex.details, dict) else None
                    new_first_val = signal_data["details"].get(new_keys[0]) if isinstance(signal_data["details"], dict) else None
                    if ex_first_val == new_first_val:
                        signal_exists = True
                        break
        
        if signal_exists:
            print(f"  ⏭️  Signal for '{signal_data['user']}' (cat {signal_data['signal_category_id']}) already exists, skipping...")
            continue
        
        if user.id is None:
            print(f"  ⚠️  User '{signal_data['user']}' has no ID, skipping signal...")
            continue
        
        new_signal = UserSignal(
            user_id=user.id,
            signal_category_id=signal_data["signal_category_id"],
            details=signal_data["details"],
            is_active=True,
        )
        session.add(new_signal)
        session.commit()
        session.refresh(new_signal)
        created_signals.append(new_signal)
        
        category_names = {1: "FREELANCER", 2: "STARTUP_IDEA", 3: "INVESTOR"}
        print(f"  ✅ Created signal: {category_names[signal_data['signal_category_id']]} for {signal_data['user']} (ID: {new_signal.id})")
    
    return created_signals


def main():
    print("\n🌱 Starting database seeding...\n")
    
    # Upewnij się że tabele istnieją
    print("📦 Creating tables and seeding categories...")
    create_db_and_tables()
    
    with Session(engine) as session:
        # Sprawdź kategorie
        categories = session.exec(select(SignalCategory)).all()
        print(f"  ✅ Signal categories: {[c.name for c in categories]}\n")
        
        # Seeduj użytkowników
        print("👥 Seeding test users...")
        users = seed_test_users(session)
        print(f"  Total users: {len(users)}\n")
        
        # Seeduj sygnały
        print("📡 Seeding test signals...")
        signals = seed_test_signals(session, users)
        print(f"  Total new signals: {len(signals)}\n")
    
    print("✨ Database seeding completed!\n")
    print_test_instructions()


def print_test_instructions():
    """Wyświetla instrukcje testowania."""
    print("=" * 70)
    print("📋 INSTRUKCJE TESTOWANIA")
    print("=" * 70)
    print("""
🔐 TESTOWE KONTA (hasło dla wszystkich: Test1234!)

FREELANCERZY:
  - jan@freelancer.pl   (Jan Kowalski - Python/AI Developer)
  - anna@freelancer.pl  (Anna Nowak - UX/UI + Frontend)

STARTUPY:
  - adam@startup.io     (Adam Wiśniewski - EduAI, RemoteTeams)
  - maria@fintech.pl    (Maria Zielińska - FinBot)

INWESTORZY:
  - piotr@vc-fund.pl    (Piotr Malinowski - VC Partner)
  - katarzyna@angel.pl  (Katarzyna Dąbrowska - Angel)

📡 TESTOWANIE ENDPOINTÓW:

1️⃣  Logowanie (POST /auth/login):
    Body: {"email": "jan@freelancer.pl", "password": "Test1234!"}
    → Otrzymasz access_token do użycia w innych requestach

2️⃣  Pobierz swoje sygnały (GET /signals/me):
    Header: Authorization: Bearer <token>
    → Lista sygnałów zalogowanego użytkownika

3️⃣  Dopasuj pojedynczy sygnał (GET /signals/match/{signal_id}):
    Header: Authorization: Bearer <token>
    → Lista pasujących sygnałów z accurate 0-100

4️⃣  Dopasuj wszystkie sygnały (GET /signals/match-all):
    Header: Authorization: Bearer <token>
    Query: ?min_accurate=50 (opcjonalnie)
    → Wszystkie dopasowania dla wszystkich sygnałów użytkownika

🎯 OCZEKIWANE WYNIKI MATCHOWANIA:

FREELANCER Jan (sygnały Python/AI):
  → Powinien matchować z: EduAI (Adam), FinBot (Maria), RemoteTeams (Adam)
  → Oczekiwany accurate:
     - EduAI: 70-90% (Python, AI, React)
     - FinBot: 80-95% (Python, FastAPI, LLM)
     - RemoteTeams: 40-60% (potrzebuje głównie UX)

FREELANCER Anna (UX/UI + Frontend):
  → Powinien matchować z: EduAI, RemoteTeams
  → Oczekiwany accurate:
     - EduAI: 60-80% (React frontend)
     - RemoteTeams: 80-95% (szuka UX Designer)
     - FinBot: 30-50% (potrzebuje backend)

STARTUP Adam (EduAI, RemoteTeams):
  → Powinien matchować z: Jan, Anna (freelancerzy) + Piotr, Katarzyna (inwestorzy)
  → Oczekiwany accurate:
     - EduAI + Piotr: 70-85% (AI, SaaS focus)
     - EduAI + Katarzyna: 85-95% (EdTech focus!)
     - EduAI + Jan: 80-95% (Python, AI skills)
     - RemoteTeams + Anna: 75-90% (UX needed)

INVESTOR Piotr (VC - AI/SaaS):
  → Powinien matchować z: EduAI, FinBot, RemoteTeams
  → Oczekiwany accurate:
     - EduAI: 80-95% (AI, SaaS, seed stage)
     - FinBot: 60-75% (pre-seed, B2B)
     - RemoteTeams: 50-70% (concept stage)

INVESTOR Katarzyna (Angel - HealthTech/EdTech):
  → Powinien matchować z: EduAI (idealne!), FinBot
  → Oczekiwany accurate:
     - EduAI: 90-100% (EdTech - perfect match!)
     - FinBot: 40-60% (FinTech nie jest focus)
     - RemoteTeams: 30-50% (HR-Tech nie jest focus)
""")
    print("=" * 70)
    print("🚀 Swagger UI: http://localhost:8000/docs")
    print("=" * 70)


if __name__ == "__main__":
    main()
