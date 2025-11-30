# Makefile for Signal Matching App

.PHONY: help up down build logs clean seed seed-demo reset shell

# Default target
help:
	@echo "Signal Matching App"
	@echo ""
	@echo "Docker:"
	@echo "  make up        - Start all (frontend + backend + db)"
	@echo "  make down      - Stop all"
	@echo "  make build     - Build all images"
	@echo "  make logs      - Show logs"
	@echo "  make shell     - Shell into backend container"
	@echo ""
	@echo "Database:"
	@echo "  make seed      - Seed test data"
	@echo "  make seed-demo - Seed demo data"
	@echo "  make reset     - Drop all + re-seed"
	@echo ""
	@echo "URLs:"
	@echo "  Frontend: http://localhost:5173"
	@echo "  Backend:  http://localhost:8000"
	@echo "  Swagger:  http://localhost:8000/docs"

# Docker
up:
	docker-compose up -d
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:8000"

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

shell:
	docker-compose exec backend /bin/bash

# Database
seed:
	docker-compose exec backend python scripts/seed_test_data.py

seed-demo:
	docker-compose exec backend python scripts/seed_presentation_data.py

reset:
	docker-compose exec backend python -c "from services.db import engine; from sqlmodel import SQLModel; SQLModel.metadata.drop_all(engine)"
	docker-compose exec backend python scripts/seed_test_data.py

