
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Zezwalamy na komunikację z frontendem
origins = [
    "http://localhost:5173",  # Domyślny port Vite
    "http://127.0.0.1:5173",
    # Tutaj później dodasz adres z deployu, np. "https://twoj-projekt.vercel.app"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Działa!"}

@app.get("/api/data")
def get_data():