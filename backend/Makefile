# Makefile for Signal Matching Backend
# Usage: make <command>

.PHONY: help setup install run seed test-db clean docker-up docker-down reset

# Default target
help:
	@echo "╔══════════════════════════════════════════════════════════════════╗"
	@echo "║           🚀 Signal Matching Backend - Makefile                  ║"
	@echo "╠══════════════════════════════════════════════════════════════════╣"
	@echo "║                                                                  ║"
	@echo "║  Setup & Installation:                                          ║"
	@echo "║    make setup      - Create venv and install dependencies       ║"
	@echo "║    make install    - Install dependencies only                  ║"
	@echo "║                                                                  ║"
	@echo "║  Database:                                                       ║"
	@echo "║    make docker-up  - Start PostgreSQL in Docker                 ║"
	@echo "║    make docker-down- Stop PostgreSQL Docker                     ║"
	@echo "║    make test-db    - Test database connection                   ║"
	@echo "║    make seed       - Seed database with test data               ║"
	@echo "║    make reset      - Reset DB (drop all + re-seed)              ║"
	@echo "║                                                                  ║"
	@echo "║  Development:                                                    ║"
	@echo "║    make run        - Start FastAPI server (port 8000)           ║"
	@echo "║    make clean      - Remove __pycache__ and .pyc files          ║"
	@echo "║                                                                  ║"
	@echo "║  Quick Start:                                                    ║"
	@echo "║    make quickstart - docker-up + setup + seed + run             ║"
	@echo "║                                                                  ║"
	@echo "╚══════════════════════════════════════════════════════════════════╝"

# Python executable paths
PYTHON = .venv/bin/python
PIP = .venv/bin/pip
UVICORN = .venv/bin/uvicorn

# ============================================================================
# SETUP & INSTALLATION
# ============================================================================

setup:
	@echo "🔧 Creating virtual environment..."
	python3 -m venv .venv
	@echo "📦 Installing dependencies..."
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt
	@echo "✅ Setup complete!"

install:
	@echo "📦 Installing dependencies..."
	$(PIP) install -r requirements.txt
	@echo "✅ Dependencies installed!"

# ============================================================================
# DATABASE
# ============================================================================

docker-up:
	@echo "🐳 Starting PostgreSQL in Docker..."
	docker-compose up -d
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 3
	@echo "✅ PostgreSQL is running!"

docker-down:
	@echo "🐳 Stopping PostgreSQL Docker..."
	docker-compose down
	@echo "✅ PostgreSQL stopped!"

test-db:
	@echo "🔍 Testing database connection..."
	PYTHONPATH=$(PWD) $(PYTHON) scripts/test_db.py

seed:
	@echo "🌱 Seeding database with test data..."
	PYTHONPATH=$(PWD) $(PYTHON) scripts/seed_test_data.py

reset:
	@echo "🗑️  Resetting database..."
	@echo "⚠️  This will drop all tables and re-create them!"
	PYTHONPATH=$(PWD) $(PYTHON) -c "\
from services.db import engine; \
from sqlmodel import SQLModel; \
SQLModel.metadata.drop_all(engine); \
print('  ✅ All tables dropped!')"
	@echo "📦 Re-creating tables and seeding..."
	PYTHONPATH=$(PWD) $(PYTHON) scripts/seed_test_data.py
	@echo "✅ Database reset complete!"

# ============================================================================
# DEVELOPMENT
# ============================================================================

run:
	@echo "🚀 Starting FastAPI server..."
	@echo "📖 Swagger UI: http://localhost:8000/docs"
	@echo "📖 ReDoc: http://localhost:8000/redoc"
	PYTHONPATH=$(PWD) $(UVICORN) main:app --reload --host 0.0.0.0 --port 8000

clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	@echo "✅ Cleaned!"

# ============================================================================
# QUICK START
# ============================================================================

quickstart: docker-up setup seed run
	@echo "🎉 Quick start complete!"

# ============================================================================
# TESTING HELPERS (curl commands)
# ============================================================================

test-login:
	@echo "🔐 Testing login (jan@freelancer.pl)..."
	@curl -s -X POST http://localhost:8000/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email": "jan@freelancer.pl", "password": "Test1234!"}' | python3 -m json.tool

test-register:
	@echo "📝 Testing registration..."
	@curl -s -X POST http://localhost:8000/auth/register \
		-H "Content-Type: application/json" \
		-d '{"username": "test_user", "email": "test@test.com", "password": "Test1234!"}' | python3 -m json.tool
