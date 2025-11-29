# Backend API - FastAPI + PostgreSQL

## 🚀 Szybki Start

### Wymagania
- Python 3.12+ 
- Docker & Docker Compose (dla bazy danych)
- VS Code (zalecane)

### Krok po kroku

#### 1. Sklonuj repozytorium (jeśli jeszcze nie masz)
```bash
git clone <repo-url>
cd backend
```

#### 2. Uruchom bazę danych (PostgreSQL)
```bash
docker-compose up -d
```

#### 3. Utwórz środowisko wirtualne i zainstaluj zależności

**Opcja A - Automatycznie (zalecane):**
```bash
./setup.sh
```

**Opcja B - Ręcznie:**
```bash
# Utwórz venv
python3 -m venv .venv

# Aktywuj venv
source .venv/bin/activate  # macOS/Linux
# lub
.venv\Scripts\activate     # Windows

# Zainstaluj zależności
pip install --upgrade pip
pip install -r requirements.txt
```

#### 4. Skonfiguruj zmienne środowiskowe
```bash
# Skopiuj template
cp .env.example .env

# Edytuj .env jeśli potrzeba (domyślne wartości są OK dla local dev)
```

#### 5. Uruchom serwer

**Opcja A - Z VS Code (zalecane):**
- Naciśnij `Cmd+Shift+B` (macOS) lub `Ctrl+Shift+B` (Windows/Linux)
- Wybierz task: `Run FastAPI server`

**Opcja B - Z terminala:**
```bash
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 6. Gotowe! 🎉
- API: http://localhost:8000
- Dokumentacja (Swagger): http://localhost:8000/docs
- Alternatywna dokumentacja (ReDoc): http://localhost:8000/redoc

---

## 📁 Struktura Projektu

```
backend/
├── app/                    # Główna aplikacja
│   ├── __init__.py
│   ├── main.py            # Entry point FastAPI
│   └── config.py          # Konfiguracja (env vars)
├── models/                # SQLModel modele (tabele DB)
│   ├── __init__.py
│   └── user.py
├── routers/               # FastAPI routery (endpoints)
│   ├── __init__.py
│   ├── auth.py
│   └── users.py
├── services/              # Logika biznesowa & serwisy
│   ├── __init__.py
│   └── db.py             # Sesje DB, konfiguracja
├── scripts/               # Pomocnicze skrypty
│   └── test_db.py        # Test połączenia z DB
├── .vscode/              # Konfiguracja VS Code
│   ├── launch.json       # Debug configuration
│   ├── tasks.json        # Build tasks
│   └── settings.json     # Workspace settings
├── docker-compose.yaml   # PostgreSQL w Docker
├── requirements.txt      # Python dependencies
├── .env                  # Zmienne środowiskowe (NIE commitować!)
├── .env.example          # Template dla .env
├── setup.sh              # Automatyczny setup script
└── README.md             # Ten plik
```

---

## 🛠️ VS Code - Użyteczne Komendy

### Tasks (Cmd+Shift+B / Ctrl+Shift+B)
- **Run FastAPI server** - Uruchamia serwer z auto-reload
- **Docker: Start Postgres** - Uruchamia bazę danych
- **Docker: Stop Postgres** - Zatrzymuje bazę danych
- **Test DB connection** - Testuje połączenie z DB
- **Install dependencies** - Instaluje packages z requirements.txt
- **Setup: Create venv & Install dependencies** - Pełny setup od zera

### Debug (F5)
- **Python: FastAPI** - Debugowanie z breakpointami
- **Python: Current File** - Debug aktualnie otwartego pliku

---

## 🗄️ Baza Danych

### Zarządzanie PostgreSQL
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart

# Logi
docker-compose logs -f

# Usuń dane (UWAGA: kasuje wszystko!)
docker-compose down -v
```

### Połączenie
- **Host:** localhost
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Password:** postgres

### Testowanie połączenia
```bash
python scripts/test_db.py
```

---

## 📝 Dodawanie Nowych Features

### 1. Nowy Model (Tabela)
```python
# models/product.py
from sqlmodel import SQLModel, Field
from typing import Optional

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
```

### 2. Nowy Router (Endpoints)
```python
# routers/products.py
from fastapi import APIRouter, Depends
from sqlmodel import Session
from services.db import get_session

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/")
def list_products(session: Session = Depends(get_session)):
    # ...logic
    pass
```

### 3. Rejestracja Routera
```python
# main.py
from routers import products

app.include_router(products.router)
```

---

## 🐛 Troubleshooting

### Problem: `ModuleNotFoundError: No module named 'X'`
**Rozwiązanie:**
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### Problem: `docker-compose: command not found`
**Rozwiązanie:** Zainstaluj Docker Desktop z https://www.docker.com/products/docker-desktop

### Problem: Port 8000 zajęty
**Rozwiązanie:** Zmień port w komendzie uruchomieniowej:
```bash
uvicorn main:app --reload --port 8001
```

### Problem: Nie można połączyć z PostgreSQL
**Rozwiązanie:**
```bash
# Sprawdź czy kontener działa
docker ps

# Jeśli nie, uruchom
docker-compose up -d

# Sprawdź logi
docker-compose logs
```

---

## 📦 Dodawanie Nowych Pakietów

```bash
# Aktywuj venv
source .venv/bin/activate

# Zainstaluj pakiet
pip install nazwa-pakietu

# Zapisz do requirements.txt
pip freeze > requirements.txt
```

---

## 🔒 Zmienne Środowiskowe

Edytuj plik `.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# App Settings
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# CORS (jeśli frontend z innego portu)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 📚 Przydatne Linki

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## ✅ Checklist dla Nowych Developerów

- [ ] Python 3.12+ zainstalowany
- [ ] Docker Desktop zainstalowany i uruchomiony
- [ ] Repozytorium sklonowane
- [ ] `.venv` utworzone
- [ ] Dependencies zainstalowane (`pip install -r requirements.txt`)
- [ ] `.env` plik utworzony (z `.env.example`)
- [ ] PostgreSQL uruchomiony (`docker-compose up -d`)
- [ ] Serwer działa (`uvicorn main:app --reload`)
- [ ] Swagger UI otwarte (http://localhost:8000/docs)

---

**Potrzebujesz pomocy?** Otwórz issue w repozytorium lub zapytaj team! 🚀
