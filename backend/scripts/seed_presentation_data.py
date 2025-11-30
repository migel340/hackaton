#!/usr/bin/env python3
"""Seed realistic presentation data for the demo database."""
from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from sqlmodel import Session, select

# Ensure project root is on PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.message import Message
from models.signal import SignalCategory, UserSignal
from models.user import User
from services.auth import get_password_hash
from services.db import create_db_and_tables, engine


def seed_users(session: Session) -> dict[str, User]:
    """Create presentation-ready demo users."""
    users_data: list[dict[str, Any]] = [
        {
            "username": "lena_founder",
            "email": "lena@climatetech.app",
            "password": "DemoPass123",
            "first_name": "Lena",
            "last_name": "Kowalska",
            "bio": "Co-founder of a climate analytics startup focused on heavy industry decarbonisation.",
            "location": "Berlin, Germany",
            "linkedin_url": "https://www.linkedin.com/in/lena-kowalska",
            "website": "https://climatetech.app",
            "skills": ["Product Strategy", "Climate Tech", "B2B Sales"],
            "experience_years": 9,
        },
        {
            "username": "marek_ai",
            "email": "marek@skillmatch.io",
            "password": "DemoPass123",
            "first_name": "Marek",
            "last_name": "Nowak",
            "bio": "Serial founder building AI tools for the future of work.",
            "location": "Warsaw, Poland",
            "linkedin_url": "https://www.linkedin.com/in/marek-nowak",
            "skills": ["AI", "Product Discovery", "Hiring"],
            "experience_years": 11,
        },
        {
            "username": "agata_fintech",
            "email": "agata@payflow.ai",
            "password": "DemoPass123",
            "first_name": "Agata",
            "last_name": "Lis",
            "bio": "Ex-Rocket Internet PM launching a cross-border fintech product.",
            "location": "Gdansk, Poland",
            "linkedin_url": "https://www.linkedin.com/in/agata-lis",
            "skills": ["Fintech", "Compliance", "Growth"],
            "experience_years": 8,
        },
        {
            "username": "sofia_biotech",
            "email": "sofia@bio-sense.io",
            "password": "DemoPass123",
            "first_name": "Sofia",
            "last_name": "Meyer",
            "bio": "Bioengineer translating lab breakthroughs into diagnostic products.",
            "location": "Zurich, Switzerland",
            "linkedin_url": "https://www.linkedin.com/in/sofia-meyer",
            "skills": ["Biotech", "Regulatory", "Clinical Research"],
            "experience_years": 10,
        },
        {
            "username": "ravi_data",
            "email": "ravi@datawork.pro",
            "password": "DemoPass123",
            "first_name": "Ravi",
            "last_name": "Patel",
            "bio": "Lead data engineer delivering lakehouse architectures for scale-ups.",
            "location": "London, United Kingdom",
            "linkedin_url": "https://www.linkedin.com/in/ravi-patel",
            "github_url": "https://github.com/ravi-data",
            "skills": ["Python", "Delta Lake", "Airflow", "dbt"],
            "experience_years": 7,
        },
        {
            "username": "sara_frontend",
            "email": "sara@frontendcraft.dev",
            "password": "DemoPass123",
            "first_name": "Sara",
            "last_name": "Nilsson",
            "bio": "Frontend lead focused on accessible design systems.",
            "location": "Stockholm, Sweden",
            "linkedin_url": "https://www.linkedin.com/in/sara-nilsson",
            "github_url": "https://github.com/sara-frontend",
            "skills": ["React", "TypeScript", "Design Systems", "Accessibility"],
            "experience_years": 6,
        },
        {
            "username": "piotr_devops",
            "email": "piotr@cloudlab.dev",
            "password": "DemoPass123",
            "first_name": "Piotr",
            "last_name": "Grabowski",
            "bio": "DevOps architect helping teams ship reliably on Kubernetes.",
            "location": "Poznan, Poland",
            "linkedin_url": "https://www.linkedin.com/in/piotr-grabowski",
            "skills": ["Kubernetes", "Terraform", "AWS", "Observability"],
            "experience_years": 9,
        },
        {
            "username": "nina_ux",
            "email": "nina@uxstudio.design",
            "password": "DemoPass123",
            "first_name": "Nina",
            "last_name": "Lopez",
            "bio": "Product designer crafting experiences for complex B2B tools.",
            "location": "Barcelona, Spain",
            "linkedin_url": "https://www.linkedin.com/in/nina-lopez",
            "skills": ["UX Research", "Service Design", "Workshops"],
            "experience_years": 8,
        },
        {
            "username": "julia_angel",
            "email": "julia@brightcapital.com",
            "password": "DemoPass123",
            "first_name": "Julia",
            "last_name": "Reyes",
            "bio": "Operator turned angel backing future of work founders.",
            "location": "Madrid, Spain",
            "linkedin_url": "https://www.linkedin.com/in/julia-reyes",
            "skills": ["Angel Investing", "HR Tech", "B2B SaaS"],
            "experience_years": 12,
        },
        {
            "username": "tim_greenfund",
            "email": "tim@greenfund.vc",
            "password": "DemoPass123",
            "first_name": "Tim",
            "last_name": "Schmidt",
            "bio": "Partner at GreenFund supporting climate resilience startups.",
            "location": "Amsterdam, Netherlands",
            "linkedin_url": "https://www.linkedin.com/in/tim-schmidt",
            "skills": ["Venture Capital", "Climate Tech", "Corporate Partnerships"],
            "experience_years": 14,
        },
        {
            "username": "david_enterprise",
            "email": "david@atlasventures.com",
            "password": "DemoPass123",
            "first_name": "David",
            "last_name": "Chen",
            "bio": "Enterprise SaaS investor with a focus on dev tooling and security.",
            "location": "Paris, France",
            "linkedin_url": "https://www.linkedin.com/in/david-chen",
            "skills": ["Enterprise SaaS", "Security", "DevTools"],
            "experience_years": 13,
        },
        {
            "username": "ola_corporate",
            "email": "ola@metroventures.eu",
            "password": "DemoPass123",
            "first_name": "Ola",
            "last_name": "Maj",
            "bio": "Corporate innovation lead scouting fintech and mobility solutions.",
            "location": "Vienna, Austria",
            "linkedin_url": "https://www.linkedin.com/in/ola-maj",
            "skills": ["Corporate VC", "Mobility", "Fintech"],
            "experience_years": 10,
        },
    ]

    created_users: dict[str, User] = {}

    for user_data in users_data:
        existing = session.exec(select(User).where(User.email == user_data["email"])).first()
        if existing:
            print(f"  ⏭️  User '{user_data['username']}' already exists, skipping...")
            created_users[user_data["username"]] = existing
            continue

        password = user_data.pop("password")
        user = User(
            **user_data,
            hashed_password=get_password_hash(password),
            is_active=True,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        created_users[user.username] = user
        print(f"  ✅ Created user: {user.username} (ID: {user.id})")

    return created_users


def seed_signals(session: Session, users: dict[str, User]) -> list[UserSignal]:
    """Attach signal payloads to demo users."""
    signals_data: list[dict[str, Any]] = [
        # Freelancers
        {
            "user": "ravi_data",
            "signal_category_id": 1,
            "details": {
                "role": "Senior Data Engineer",
                "skills": ["Python", "Spark", "Airflow", "dbt", "Delta Lake"],
                "hourly_rate": "120 GBP",
                "availability": "4 days per week",
                "looking_for": "Series A startups building analytics platforms",
                "experience": "Delivered data mesh architectures for 3 scale-ups",
            },
        },
        {
            "user": "sara_frontend",
            "signal_category_id": 1,
            "details": {
                "role": "Staff Frontend Engineer",
                "skills": ["React", "TypeScript", "GraphQL", "Design Systems"],
                "hourly_rate": "95 EUR",
                "availability": "Immediate",
                "looking_for": "Teams needing accessibility-first product UI",
                "portfolio": "https://frontendcraft.dev/work",
            },
        },
        {
            "user": "piotr_devops",
            "signal_category_id": 1,
            "details": {
                "role": "DevOps Consultant",
                "skills": ["AWS", "Kubernetes", "Terraform", "Prometheus"],
                "hourly_rate": "110 EUR",
                "availability": "Consulting retainer",
                "looking_for": "High-growth teams scaling infrastructure and reliability",
                "certifications": ["CKA", "AWS Professional"],
            },
        },
        {
            "user": "nina_ux",
            "signal_category_id": 1,
            "details": {
                "role": "Lead Product Designer",
                "skills": ["UX Research", "Service Design", "Facilitation"],
                "hourly_rate": "80 EUR",
                "availability": "Project-based",
                "looking_for": "Complex B2B platforms that need streamlined workflows",
                "process": "Discovery led, with measurable outcome tracking",
            },
        },
        # Startup ideas
        {
            "user": "lena_founder",
            "signal_category_id": 2,
            "details": {
                "name": "SteelSense",
                "description": "Carbon intelligence platform helping steel plants monitor emissions in real time.",
                "stage": "Pilot with first customer",
                "looking_for": ["CTO", "Data Scientist", "Series Seed investor"],
                "funding_needed": "1.2M EUR",
                "market": "Industrial decarbonisation",
                "traction": "Signed LOI with two EU manufacturers",
                "tech_stack": ["Python", "Edge IoT", "Time-series analytics"],
            },
        },
        {
            "user": "marek_ai",
            "signal_category_id": 2,
            "details": {
                "name": "SkillMatch",
                "description": "AI copilot for internal mobility mapping skills to open roles.",
                "stage": "MVP live with design partners",
                "looking_for": ["Backend Lead", "Product Designer"],
                "funding_needed": "750k EUR",
                "market": "HR Tech",
                "customers": "3 enterprise pilots with 10k+ employees",
                "tech": ["LangChain", "FastAPI", "Next.js"],
            },
        },
        {
            "user": "agata_fintech",
            "signal_category_id": 2,
            "details": {
                "name": "PayFlow",
                "description": "API-first treasury automation for marketplaces operating across the EU.",
                "stage": "Beta",
                "looking_for": ["Senior Backend Engineer", "Compliance advisor"],
                "funding_needed": "900k EUR",
                "market": "Fintech B2B",
                "regulatory": "PSD2 compliant, sandbox approved by KNF",
                "tech_stack": ["Go", "Kafka", "React"],
            },
        },
        {
            "user": "sofia_biotech",
            "signal_category_id": 2,
            "details": {
                "name": "BioSense",
                "description": "Point-of-care device predicting sepsis risk within 30 minutes.",
                "stage": "Clinical validation",
                "looking_for": ["MedTech hardware lead", "Grant co-investors"],
                "funding_needed": "2.5M EUR",
                "market": "Healthcare diagnostics",
                "partners": "University Hospital Zurich pilot starting Q1",
                "regulatory_path": "CE mark targeted for 2026",
            },
        },
        # Investor mandates
        {
            "user": "julia_angel",
            "signal_category_id": 3,
            "details": {
                "type": "Angel",
                "focus_areas": ["Future of Work", "Creator Economy"],
                "ticket_size": "25k-100k EUR",
                "stage": ["Pre-seed", "Seed"],
                "looking_for": "Founders with prior operator experience",
                "value_add": ["Hiring playbooks", "GTMS for B2B"],
                "portfolio": ["Workly", "ShiftOS", "CreatorStack"],
            },
        },
        {
            "user": "tim_greenfund",
            "signal_category_id": 3,
            "details": {
                "type": "VC Fund",
                "focus_areas": ["Climate Resilience", "Industrial Efficiency"],
                "ticket_size": "500k-3M EUR",
                "stage": ["Seed", "Series A"],
                "looking_for": "Hardware-software plays with measurable climate impact",
                "value_add": ["Industrial partners", "Supply chain experts"],
                "fund_size": "150M EUR",
            },
        },
        {
            "user": "david_enterprise",
            "signal_category_id": 3,
            "details": {
                "type": "VC Fund",
                "focus_areas": ["DevTools", "Security", "Data Infrastructure"],
                "ticket_size": "400k-1.5M EUR",
                "stage": ["Seed"],
                "looking_for": "Technical founding teams with PLG motion",
                "value_add": ["CISO network", "Enterprise sales playbook"],
                "portfolio": ["SecureHub", "FlowCode"],
            },
        },
        {
            "user": "ola_corporate",
            "signal_category_id": 3,
            "details": {
                "type": "Corporate VC",
                "focus_areas": ["Mobility", "Payments", "Urban Logistics"],
                "ticket_size": "300k-2M EUR",
                "stage": ["Late Seed", "Series A"],
                "looking_for": "Solutions ready to pilot with metro operators",
                "value_add": ["Regulatory support", "Distribution partnerships"],
                "strategic_fit": "Integrations with MetroGroup transit systems",
            },
        },
    ]

    created_signals: list[UserSignal] = []

    for signal_data in signals_data:
        user = users.get(signal_data["user"])
        if not user:
            print(f"  ⚠️  User '{signal_data['user']}' not found, skipping signal...")
            continue

        existing = session.exec(
            select(UserSignal).where(
                UserSignal.user_id == user.id,
                UserSignal.signal_category_id == signal_data["signal_category_id"],
            )
        ).all()

        duplicate = any(
            isinstance(item.details, dict)
            and isinstance(signal_data["details"], dict)
            and item.details.get("name") == signal_data["details"].get("name")
            and item.details.get("role") == signal_data["details"].get("role")
            for item in existing
        )
        if duplicate:
            print(f"  ⏭️  Signal for '{signal_data['user']}' already exists, skipping...")
            continue

        signal = UserSignal(
            user_id=user.id,
            signal_category_id=signal_data["signal_category_id"],
            details=signal_data["details"],
            is_active=True,
        )
        session.add(signal)
        session.commit()
        session.refresh(signal)
        created_signals.append(signal)

        category_label = {1: "FREELANCER", 2: "STARTUP_IDEA", 3: "INVESTOR"}
        print(
            "  ✅ Created signal: "
            f"{category_label.get(signal_data['signal_category_id'], 'UNKNOWN')}"
            f" for {signal_data['user']} (ID: {signal.id})"
        )

    return created_signals


def seed_messages(session: Session, users: dict[str, User]) -> list[Message]:
    """Insert curated conversations between demo users."""
    interactions = [
        {
            "sender": "lena_founder",
            "receiver": "ravi_data",
            "content": "Ravi, could we schedule 30 minutes to review our data ingestion pipeline prototype?",
        },
        {
            "sender": "ravi_data",
            "receiver": "lena_founder",
            "content": "Happy to help. How about Wednesday morning CET? I can share a checklist beforehand.",
        },
        {
            "sender": "marek_ai",
            "receiver": "sara_frontend",
            "content": "Sara, we loved your accessibility case study. We are redesigning our admin console next month.",
        },
        {
            "sender": "sara_frontend",
            "receiver": "marek_ai",
            "content": "Thanks! Send over the design files and I will draft a scope for you by Friday.",
        },
        {
            "sender": "agata_fintech",
            "receiver": "julia_angel",
            "content": "Julia, we are opening a seed round in January and would value your feedback on our deck.",
        },
        {
            "sender": "julia_angel",
            "receiver": "agata_fintech",
            "content": "Please share it. I can loop in two angels who scaled payment operations in Europe.",
        },
        {
            "sender": "sofia_biotech",
            "receiver": "tim_greenfund",
            "content": "Tim, BioSense is ready for field pilots. Are you still evaluating diagnostic hardware?",
        },
        {
            "sender": "tim_greenfund",
            "receiver": "sofia_biotech",
            "content": "Yes, let's set up diligence next week. We partner with two hospital networks you could leverage.",
        },
    ]

    created_messages: list[Message] = []

    for payload in interactions:
        sender = users.get(payload["sender"])
        receiver = users.get(payload["receiver"])
        if not sender or not receiver:
            print(
                "  ⚠️  Skipping message because sender or receiver is missing: "
                f"{payload['sender']} -> {payload['receiver']}"
            )
            continue

        existing = session.exec(
            select(Message).where(
                Message.sender_id == sender.id,
                Message.receiver_id == receiver.id,
                Message.content == payload["content"],
            )
        ).first()
        if existing:
            print(
                "  ⏭️  Message already present: "
                f"{payload['sender']} -> {payload['receiver']}"
            )
            continue

        message = Message(
            sender_id=sender.id,
            receiver_id=receiver.id,
            content=payload["content"],
            is_read=False,
        )
        session.add(message)
        session.commit()
        session.refresh(message)
        created_messages.append(message)
        print(
            "  💬 Seeded message "
            f"{payload['sender']} -> {payload['receiver']} (ID: {message.id})"
        )

    return created_messages


def main() -> None:
    print("\n🌱 Starting presentation database seeding...\n")
    create_db_and_tables()

    with Session(engine) as session:
        categories = session.exec(select(SignalCategory)).all()
        print(f"📦 Signal categories available: {[c.name for c in categories]}\n")

        print("👥 Seeding demo users...")
        users = seed_users(session)
        print(f"Total users available: {len(users)}\n")

        print("📡 Seeding demo signals...")
        signals = seed_signals(session, users)
        print(f"Total signals created: {len(signals)}\n")

        print("💬 Seeding conversation samples...")
        messages = seed_messages(session, users)
        print(f"Total messages created: {len(messages)}\n")

    print("✨ Presentation data ready! Run the app and log in with any demo account.")


if __name__ == "__main__":
    main()
