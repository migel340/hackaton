# Copilot Instructions for Hackaton Project

## Architecture Overview

This is a full-stack monorepo with a **FastAPI backend** (`/backend`) and a **React + Vite frontend** (`/frontend`). They communicate via REST API with JWT authentication.

### Data Flow

1. Frontend (port 5173) → Vite proxy (`/local/*`) → Backend (port 4000) at `/api/v1/*`
2. JWT tokens stored in localStorage/sessionStorage, attached via Axios interceptor
3. PostgreSQL database via SQLModel ORM, managed through Docker Compose

## Backend (FastAPI + SQLModel)

### Key Patterns

- **Routers** in `routers/` handle HTTP endpoints, prefixed with `/api/v1`
- **Models** in `models/` use SQLModel (SQLAlchemy + Pydantic hybrid) for DB tables
- **Schemas** in `schemas/` are pure Pydantic models for request/response validation
- **Services** in `services/` contain business logic, DB sessions, and auth utilities

### Authentication Pattern

```python
# Protected routes use dependency injection:
from services.dependencies import get_current_user

@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"user": current_user}
```

### Database Conventions

- All models inherit from `SQLModel` with `table=True`
- Session dependency: `session: Session = Depends(get_session)`
- Tables auto-created on startup via `create_db_and_tables()` in lifespan

### Commands

```bash
# Start backend
cd backend && uvicorn main:app --reload --port 4000

# Start PostgreSQL
docker-compose up -d

# Test DB connection
python scripts/test_db.py
```

## Frontend (React 19 + Vite + TypeScript)

### Path Aliases (in `vite.config.ts`)

Use these aliases instead of relative paths:

- `@/` → `src/`
- `@layouts/` → `src/layouts/`
- `@components/` → `src/components/`
- `@api/` → `src/api/`
- `@pages/` → `src/pages/`

### Routing Pattern (React Router v7)

- Routes defined in `src/router/router.tsx`
- **Loaders** for auth guards: `requireAuth()`, `redirectIfAuthenticated()`
- **Actions** for form submissions in co-located `action.ts` files

### API Layer (`src/api/`)

- `api.ts`: Axios instance with token interceptor, base URL `/local/api/v1`
- `auth.ts`: Authentication functions (`login`, `logout`, `register`, `isAuthenticated`)
- Token management: `authToken.get()`, `authToken.set(token, remember)`

### UI Framework

- **Tailwind CSS 4** + **DaisyUI 5** for components
- Layout pattern: `MainLayout.tsx` with drawer navigation using DaisyUI classes

### Commands

```bash
cd frontend
npm run dev      # Start dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint check
```

## Adding New Features

### New API Endpoint

1. Create/update model in `backend/models/`
2. Create schema in `backend/schemas/`
3. Add router in `backend/routers/` with `APIRouter(prefix="/resource", tags=["Resource"])`
4. Register router in `backend/main.py`: `app.include_router(router, prefix="/api/v1")`

### New Frontend Page

1. Create page component in `src/pages/feature/PageName.tsx`
2. Add action file if form needed: `src/pages/feature/action.ts`
3. Register route in `src/router/router.tsx`
4. Use `@api/api.ts` for backend calls

## Environment Setup

- Backend: Copy `backend/.env.example` → `backend/.env`
- Required: `DATABASE_URL`, `SECRET_KEY` (for JWT)
- Frontend: API base configured via Vite proxy (no `.env` needed for local dev)
