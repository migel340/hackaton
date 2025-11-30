# Makefile for Full Stack Signal Matching App
# Usage: make <command>

.PHONY: help start stop backend frontend db seed reset install clean logs

# Colors
GREEN = \033[0;32m
YELLOW = \033[1;33m
CYAN = \033[0;36m
NC = \033[0m

# Default target
help:
	@echo "╔══════════════════════════════════════════════════════════════════╗"
	@echo "║        🚀 Signal Matching App - Full Stack Makefile              ║"
	@echo "╠══════════════════════════════════════════════════════════════════╣"
	@echo "║                                                                  ║"
	@echo "║  🔥 Quick Start:                                                 ║"
	@echo "║    make start       - Start everything (db + backend + frontend)║"
	@echo "║    make stop        - Stop all services                         ║"
	@echo "║                                                                  ║"
	@echo "║  🛠️  Individual Services:                                        ║"
	@echo "║    make db          - Start PostgreSQL (Docker)                 ║"
	@echo "║    make backend     - Start FastAPI backend (port 8000)         ║"
	@echo "║    make frontend    - Start Vite frontend (port 5174)           ║"
	@echo "║                                                                  ║"
	@echo "║  📦 Setup:                                                       ║"
	@echo "║    make install     - Install all dependencies (backend+frontend)║"
	@echo "║    make seed        - Seed database with test data              ║"
	@echo "║    make reset       - Reset database and re-seed                ║"
	@echo "║                                                                  ║"
	@echo "║  🧹 Utilities:                                                   ║"
	@echo "║    make clean       - Clean cache files                         ║"
	@echo "║    make logs        - Show backend logs                         ║"
	@echo "║                                                                  ║"
	@echo "║  🔗 URLs:                                                        ║"
	@echo "║    Frontend: http://localhost:5174                              ║"
	@echo "║    Backend:  http://localhost:8000                              ║"
	@echo "║    Swagger:  http://localhost:8000/docs                         ║"
	@echo "║                                                                  ║"
	@echo "╚══════════════════════════════════════════════════════════════════╝"

# ============================================================================
# QUICK START - All in one
# ============================================================================

start: db
	@echo "$(GREEN)🚀 Starting Full Stack...$(NC)"
	@echo "$(CYAN)Starting backend...$(NC)"
	@cd backend && make run &
	@sleep 3
	@echo "$(CYAN)Starting frontend...$(NC)"
	@cd frontend && npm run dev &
	@sleep 2
	@echo ""
	@echo "$(GREEN)✅ All services started!$(NC)"
	@echo "$(YELLOW)📱 Frontend: http://localhost:5174$(NC)"
	@echo "$(YELLOW)🔧 Backend:  http://localhost:8000$(NC)"
	@echo "$(YELLOW)📖 Swagger:  http://localhost:8000/docs$(NC)"
	@echo ""
	@echo "$(CYAN)Press Ctrl+C to stop all services$(NC)"
	@wait

stop:
	@echo "🛑 Stopping all services..."
	@pkill -f "uvicorn main:app" 2>/dev/null || true
	@pkill -f "vite" 2>/dev/null || true
	@echo "✅ Services stopped!"

# ============================================================================
# INDIVIDUAL SERVICES
# ============================================================================

db:
	@echo "🐳 Starting PostgreSQL..."
	@cd backend && docker-compose up -d
	@sleep 2
	@echo "✅ PostgreSQL running on port 5432"

backend:
	@echo "🔧 Starting FastAPI backend..."
	@echo "📖 Swagger UI: http://localhost:8000/docs"
	@cd backend && PYTHONPATH=$(PWD)/backend .venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@echo "📱 Starting Vite frontend..."
	@echo "🌐 URL: http://localhost:5174"
	@cd frontend && npm run dev

# ============================================================================
# SETUP
# ============================================================================

install:
	@echo "📦 Installing all dependencies..."
	@echo ""
	@echo "$(CYAN)Backend dependencies...$(NC)"
	@cd backend && python3 -m venv .venv && .venv/bin/pip install --upgrade pip && .venv/bin/pip install -r requirements.txt
	@echo ""
	@echo "$(CYAN)Frontend dependencies...$(NC)"
	@cd frontend && npm install
	@echo ""
	@echo "$(GREEN)✅ All dependencies installed!$(NC)"

install-backend:
	@echo "📦 Installing backend dependencies..."
	@cd backend && python3 -m venv .venv && .venv/bin/pip install --upgrade pip && .venv/bin/pip install -r requirements.txt
	@echo "✅ Backend dependencies installed!"

install-frontend:
	@echo "📦 Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ Frontend dependencies installed!"

seed:
	@echo "🌱 Seeding database..."
	@cd backend && PYTHONPATH=$(PWD)/backend .venv/bin/python scripts/seed_test_data.py

reset:
	@echo "🗑️  Resetting database..."
	@cd backend && PYTHONPATH=$(PWD)/backend .venv/bin/python -c "\
from services.db import engine; \
from sqlmodel import SQLModel; \
SQLModel.metadata.drop_all(engine); \
print('  ✅ All tables dropped!')"
	@echo "📦 Re-seeding..."
	@cd backend && PYTHONPATH=$(PWD)/backend .venv/bin/python scripts/seed_test_data.py
	@echo "✅ Database reset complete!"

# ============================================================================
# UTILITIES
# ============================================================================

clean:
	@echo "🧹 Cleaning cache files..."
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@find . -type d -name "node_modules/.cache" -exec rm -rf {} + 2>/dev/null || true
	@echo "✅ Cleaned!"

logs:
	@echo "📋 Backend logs:"
	@cd backend && docker-compose logs -f

# ============================================================================
# DEV - Run both in separate terminals (recommended)
# ============================================================================

dev:
	@echo "$(GREEN)🚀 Starting development environment...$(NC)"
	@echo ""
	@echo "Run these commands in separate terminals:"
	@echo ""
	@echo "  $(CYAN)Terminal 1 (Backend):$(NC)"
	@echo "    cd backend && make run"
	@echo ""
	@echo "  $(CYAN)Terminal 2 (Frontend):$(NC)"
	@echo "    cd frontend && npm run dev"
	@echo ""
	@echo "Or use: make start (runs both in background)"
