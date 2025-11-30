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
            "username": "admin",
            "email": "admin@gmail.com",
            "password": "12345678",
            "first_name": "Admin",
            "last_name": "Testowy",
            "bio": "Senior Python/JS Developer z 8-letnim doświadczeniem. Specjalizuję się w FastAPI, React i AI.",
            "location": "Warszawa, Polska",
            "linkedin_url": "https://linkedin.com/in/admin-testowy",
            "github_url": "https://github.com/admin-dev",
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
        # Dodatkowi freelancerzy
        {
            "username": "tomek_mobile",
            "email": "tomek@mobile.dev",
            "password": "Test1234!",
            "first_name": "Tomasz",
            "last_name": "Kaczmarek",
            "bio": "Mobile developer iOS/Android. Flutter enthusiast. Buduję aplikacje, które kochają użytkownicy.",
            "location": "Łódź, Polska",
            "linkedin_url": "https://linkedin.com/in/tomek-kaczmarek",
            "github_url": "https://github.com/tomek-mobile",
            "skills": ["Flutter", "Dart", "Swift", "Kotlin", "Firebase", "React Native"],
            "experience_years": 6,
        },
        {
            "username": "ewa_devops",
            "email": "ewa@cloudops.pl",
            "password": "Test1234!",
            "first_name": "Ewa",
            "last_name": "Mazur",
            "bio": "DevOps Engineer & Cloud Architect. AWS Certified. Automatyzuję wszystko co się da.",
            "location": "Katowice, Polska",
            "linkedin_url": "https://linkedin.com/in/ewa-mazur-devops",
            "skills": ["AWS", "Kubernetes", "Terraform", "Docker", "CI/CD", "Python", "Go"],
            "experience_years": 7,
        },
        {
            "username": "michal_data",
            "email": "michal@dataeng.io",
            "password": "Test1234!",
            "first_name": "Michał",
            "last_name": "Pawlak",
            "bio": "Data Engineer & Analytics. Budowanie pipeline'ów danych i dashboardów. Ex-Spotify.",
            "location": "Warszawa, Polska",
            "linkedin_url": "https://linkedin.com/in/michal-pawlak-data",
            "github_url": "https://github.com/michal-data",
            "skills": ["Python", "Spark", "Airflow", "dbt", "Snowflake", "BigQuery", "Tableau"],
            "experience_years": 5,
        },
        {
            "username": "kasia_marketing",
            "email": "kasia@growth.pl",
            "password": "Test1234!",
            "first_name": "Katarzyna",
            "last_name": "Lewandowska",
            "bio": "Growth Hacker & Digital Marketing Expert. Pomagam startupom skalować acquisition.",
            "location": "Warszawa, Polska",
            "linkedin_url": "https://linkedin.com/in/kasia-growth",
            "website": "https://kasia-growth.pl",
            "skills": ["SEO", "Google Ads", "Facebook Ads", "Analytics", "CRO", "Content Marketing"],
            "experience_years": 8,
        },
        # Dodatkowi founderzy startupów
        {
            "username": "bartek_health",
            "email": "bartek@healthapp.pl",
            "password": "Test1234!",
            "first_name": "Bartosz",
            "last_name": "Sikora",
            "bio": "Lekarz i founder. Buduję aplikację do zdalnego monitoringu pacjentów.",
            "location": "Kraków, Polska",
            "linkedin_url": "https://linkedin.com/in/bartek-sikora-md",
            "skills": ["Medicine", "Healthcare", "Product Vision", "Clinical Research"],
            "experience_years": 12,
        },
        {
            "username": "ola_ecommerce",
            "email": "ola@shopify.expert",
            "password": "Test1234!",
            "first_name": "Aleksandra",
            "last_name": "Wójcik",
            "bio": "Ex-Allegro PM. Buduję platformę dla małych sklepów e-commerce z AI rekomendacjami.",
            "location": "Poznań, Polska",
            "linkedin_url": "https://linkedin.com/in/ola-wojcik",
            "skills": ["E-commerce", "Product Management", "Marketplace", "AI/ML"],
            "experience_years": 9,
        },
        {
            "username": "krzysztof_green",
            "email": "krzysztof@greentech.eco",
            "password": "Test1234!",
            "first_name": "Krzysztof",
            "last_name": "Jankowski",
            "bio": "CleanTech enthusiast. Rozwijam platformę do śledzenia śladu węglowego dla firm.",
            "location": "Gdynia, Polska",
            "linkedin_url": "https://linkedin.com/in/krzysztof-green",
            "skills": ["Sustainability", "Carbon Accounting", "ESG", "Business Development"],
            "experience_years": 6,
        },
        # Dodatkowi inwestorzy
        {
            "username": "marcin_cv",
            "email": "marcin@corpventures.pl",
            "password": "Test1234!",
            "first_name": "Marcin",
            "last_name": "Kowalczyk",
            "bio": "Corporate Venture Capital. Inwestuję w startupy dla dużej grupy energetycznej.",
            "location": "Warszawa, Polska",
            "linkedin_url": "https://linkedin.com/in/marcin-cvc",
            "skills": ["Corporate VC", "Energy", "CleanTech", "IoT", "Strategic Partnerships"],
            "experience_years": 14,
        },
        {
            "username": "magda_impact",
            "email": "magda@impact-fund.org",
            "password": "Test1234!",
            "first_name": "Magdalena",
            "last_name": "Nowicka",
            "bio": "Impact investor. Szukam startupów rozwiązujących problemy społeczne i środowiskowe.",
            "location": "Kraków, Polska",
            "linkedin_url": "https://linkedin.com/in/magda-impact",
            "skills": ["Impact Investing", "ESG", "Social Enterprise", "Grant Writing"],
            "experience_years": 11,
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
            "user": "admin",
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
        # Admin ma też drugi sygnał jako freelancer
        {
            "user": "admin",
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
        # Dodatkowe sygnały freelancerów
        {
            "user": "tomek_mobile",
            "signal_category_id": 1,
            "details": {
                "role": "Mobile Developer",
                "skills": ["Flutter", "Dart", "Swift", "Kotlin", "Firebase"],
                "hourly_rate": "120-180 PLN",
                "availability": "full-time",
                "looking_for": "Startupy potrzebujące aplikacji mobilnej iOS/Android",
                "experience": "6 lat, 15+ opublikowanych aplikacji w App Store i Google Play",
                "portfolio": "https://play.google.com/store/apps/developer?id=TomekApps",
            },
        },
        {
            "user": "ewa_devops",
            "signal_category_id": 1,
            "details": {
                "role": "DevOps Engineer / Cloud Architect",
                "skills": ["AWS", "Kubernetes", "Terraform", "Docker", "CI/CD", "Python"],
                "hourly_rate": "150-220 PLN",
                "availability": "part-time (15h/tydzień)",
                "looking_for": "Startupy potrzebujące skalowalnej infrastruktury cloud",
                "certifications": ["AWS Solutions Architect Professional", "CKA", "CKS"],
                "experience": "7 lat, infrastructure dla 50+ projektów",
            },
        },
        {
            "user": "michal_data",
            "signal_category_id": 1,
            "details": {
                "role": "Data Engineer",
                "skills": ["Python", "Spark", "Airflow", "dbt", "Snowflake", "BigQuery"],
                "hourly_rate": "140-200 PLN",
                "availability": "full-time lub kontrakt",
                "looking_for": "Firmy potrzebujące data pipeline'ów i analytics",
                "experience": "Ex-Spotify, budowałem pipelines dla 100M+ eventów dziennie",
                "specialization": "Real-time analytics, Data Warehousing, ML pipelines",
            },
        },
        {
            "user": "kasia_marketing",
            "signal_category_id": 1,
            "details": {
                "role": "Growth Marketing Consultant",
                "skills": ["SEO", "Google Ads", "Facebook Ads", "Analytics", "CRO"],
                "hourly_rate": "100-150 PLN",
                "availability": "projekty + retainer",
                "looking_for": "Startupy B2C i B2B potrzebujące growth hackingu",
                "results": "Średnio 3x wzrost acquisition dla klientów w 6 miesięcy",
                "industries": ["SaaS", "E-commerce", "Mobile Apps", "FinTech"],
            },
        },
        # Dodatkowe pomysły na startup
        {
            "user": "bartek_health",
            "signal_category_id": 2,
            "details": {
                "name": "MediMonitor",
                "description": "Aplikacja do zdalnego monitoringu pacjentów z chorobami przewlekłymi. Integracja z urządzeniami IoT (ciśnieniomierze, glukometry).",
                "stage": "Prototyp + 50 pacjentów w pilotażu",
                "looking_for": ["CTO - Mobile/IoT", "Backend Developer", "Inwestor seed"],
                "funding_needed": "1M PLN",
                "market": "HealthTech, B2B2C (przez przychodnie)",
                "traction": "3 przychodnie w pilotażu, LOI od 2 sieci medycznych",
                "tech_requirements": ["Flutter", "Python", "IoT", "HIPAA compliance"],
                "competitive_advantage": "Jestem lekarzem, znam bolączki systemu od środka",
            },
        },
        {
            "user": "ola_ecommerce",
            "signal_category_id": 2,
            "details": {
                "name": "SmartShop AI",
                "description": "Platforma dla małych e-commerce z AI rekomendacjami produktów, automatycznym pricingiem i prognozowaniem popytu.",
                "stage": "MVP w budowie",
                "looking_for": ["ML Engineer", "Frontend Developer", "Inwestor pre-seed"],
                "funding_needed": "400k PLN",
                "market": "E-commerce Tools, B2B SaaS",
                "problem": "Małe sklepy nie mają dostępu do zaawansowanej analityki jak duzi gracze",
                "tech_stack": ["Python", "FastAPI", "React", "TensorFlow"],
                "traction": "20 sklepów na liście oczekujących",
            },
        },
        {
            "user": "krzysztof_green",
            "signal_category_id": 2,
            "details": {
                "name": "CarbonTrack",
                "description": "Platforma SaaS do automatycznego śledzenia i raportowania śladu węglowego dla firm MŚP. Zgodność z CSRD.",
                "stage": "Wczesne MVP",
                "looking_for": ["Fullstack Developer", "Sales/BD", "Inwestor seed"],
                "funding_needed": "600k PLN",
                "market": "CleanTech, RegTech, B2B",
                "problem": "Od 2025 firmy muszą raportować ESG, a nie mają narzędzi",
                "tech_requirements": ["Python", "React", "Data Integration", "Reporting"],
                "competitive_advantage": "Partnerstwo z firmą audytorską Big4",
            },
        },
        {
            "user": "startup_adam",
            "signal_category_id": 2,
            "details": {
                "name": "AIRecruiter",
                "description": "Platforma do automatyzacji rekrutacji IT. AI analizuje CV, prowadzi wstępne rozmowy i ocenia dopasowanie kulturowe.",
                "stage": "Idea validated",
                "looking_for": ["Co-founder z doświadczeniem HR-Tech", "ML Engineer"],
                "funding_needed": "250k PLN na MVP",
                "market": "HR-Tech, B2B",
                "problem": "Rekruterzy tracą 80% czasu na niewłaściwych kandydatów",
                "tech_requirements": ["Python", "LLM", "NLP", "React"],
            },
        },
        # Dodatkowe sygnały inwestorów
        {
            "user": "marcin_cv",
            "signal_category_id": 3,
            "details": {
                "type": "Corporate VC",
                "focus_areas": ["Energy", "CleanTech", "IoT", "Smart Grid"],
                "ticket_size": "1M - 5M PLN",
                "stage": ["seed", "Series A"],
                "looking_for": "Startupy z technologią dla sektora energetycznego",
                "value_add": ["Dostęp do klientów enterprise", "Pilotaże w grupie", "Regulatory support"],
                "criteria": ["Working product", "B2B model", "Możliwość integracji z naszymi systemami"],
                "sweet_spot": "Smart metering, energy storage, grid optimization",
            },
        },
        {
            "user": "magda_impact",
            "signal_category_id": 3,
            "details": {
                "type": "Impact Fund",
                "focus_areas": ["Climate", "Social Impact", "Accessibility", "Education"],
                "ticket_size": "200k - 800k PLN",
                "stage": ["pre-seed", "seed"],
                "looking_for": "Startupy mierzące swój impact (SDG aligned)",
                "value_add": ["Impact measurement framework", "ESG reporting", "Grant co-funding"],
                "criteria": ["Clear theory of change", "Measurable outcomes", "Sustainable business model"],
                "portfolio_examples": ["EdTech for underprivileged", "Circular economy", "Mental health"],
            },
        },
        # Admin szukający co-foundera
        {
            "user": "admin",
            "signal_category_id": 2,
            "details": {
                "name": "DevMentor",
                "description": "Platforma łącząca junior developerów z seniorami na sesje mentorskie 1:1. Subscription model.",
                "stage": "Walidacja pomysłu",
                "looking_for": ["Co-founder biznesowy", "Marketing/Growth"],
                "funding_needed": "Bootstrapped + ewentualnie 100k PLN",
                "market": "EdTech, B2C + B2B (firmy)",
                "my_role": "Zbuduję platformę sam, szukam kogoś od biznesu",
                "validation": "50 osób na landing page, 30% conversion na waiting list",
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
  - admin@gmail.com       (Admin - Python/AI Developer + pomysł DevMentor, hasło: 12345678)
  - anna@freelancer.pl    (Anna Nowak - UX/UI + Frontend)
  - tomek@mobile.dev      (Tomasz Kaczmarek - Mobile iOS/Android/Flutter)
  - ewa@cloudops.pl       (Ewa Mazur - DevOps/Cloud AWS/K8s)
  - michal@dataeng.io     (Michał Pawlak - Data Engineer, ex-Spotify)
  - kasia@growth.pl       (Katarzyna Lewandowska - Growth Marketing)

STARTUPY:
  - adam@startup.io       (Adam Wiśniewski - EduAI, RemoteTeams, AIRecruiter)
  - maria@fintech.pl      (Maria Zielińska - FinBot)
  - bartek@healthapp.pl   (Bartosz Sikora - MediMonitor, lekarz-founder)
  - ola@shopify.expert    (Aleksandra Wójcik - SmartShop AI, ex-Allegro)
  - krzysztof@greentech.eco (Krzysztof Jankowski - CarbonTrack)

INWESTORZY:
  - piotr@vc-fund.pl      (Piotr Malinowski - VC Partner AI/SaaS + advisor)
  - katarzyna@angel.pl    (Katarzyna Dąbrowska - Angel HealthTech/EdTech)
  - marcin@corpventures.pl (Marcin Kowalczyk - Corporate VC Energy/CleanTech)
  - magda@impact-fund.org (Magdalena Nowicka - Impact Fund Climate/Social)

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

🎯 SCENARIUSZE MATCHOWANIA:

FREELANCER → STARTUP (szukają się nawzajem):
  - Jan (Python/AI) → EduAI, FinBot, AIRecruiter (high match)
  - Anna (UX/Frontend) → RemoteTeams, SmartShop AI (high match)
  - Tomek (Mobile) → MediMonitor (perfect match - szukają Flutter!)
  - Ewa (DevOps) → wszystkie startupy potrzebujące infra
  - Michał (Data) → SmartShop AI (ML), CarbonTrack (Data)
  - Kasia (Marketing) → wszystkie startupy B2C

STARTUP → INVESTOR (szukają się nawzajem):
  - EduAI → Katarzyna (EdTech angel - perfect!), Piotr (AI VC)
  - MediMonitor → Katarzyna (HealthTech), Magda (Impact)
  - CarbonTrack → Marcin (CleanTech CVC), Magda (Climate Impact)
  - SmartShop AI → Piotr (SaaS VC)
  - FinBot → Piotr (AI/B2B VC)

INVESTOR → STARTUP (aktywne szukanie):
  - Marcin (CVC Energy) → CarbonTrack (perfect match!)
  - Magda (Impact) → CarbonTrack, MediMonitor, EduAI
  - Katarzyna (Angel) → EduAI, MediMonitor

CIEKAWE PRZYPADKI:
  - Admin ma 3 sygnały: 2x freelancer + 1x startup (DevMentor)
  - Adam ma 4 pomysły na startup - różne potrzeby

MAPOWANIE SYGNAŁÓW:
  - FREELANCER (1) szuka → STARTUP_IDEA (2)
  - STARTUP_IDEA (2) szuka → FREELANCER (1) i INVESTOR (3)
  - INVESTOR (3) szuka → STARTUP_IDEA (2)
""")
    print("=" * 70)
    print("🚀 Swagger UI: http://localhost:8000/docs")
    print("=" * 70)


if __name__ == "__main__":
    main()
