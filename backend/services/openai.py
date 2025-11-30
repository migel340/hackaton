import json
from typing import Any

from openai import OpenAI

from config import settings

client = OpenAI(api_key=settings.OPENAI_KEY)


def get_embedding(text):
    # Model 'text-embedding-3-small' jest najlepszy cena/jakość na hackathon
    response = client.embeddings.create(
        input=text,
        model="gpt-4o-mini"
    )
    return response.data[0].embedding


# Mapowanie jakie sygnały do siebie pasują
# FREELANCER (1) szuka STARTUP_IDEA (2)
# STARTUP_IDEA (2) szuka FREELANCER (1) i INVESTOR (3)
# INVESTOR (3) szuka STARTUP_IDEA (2)
SIGNAL_MATCHING = {
    1: [2],      # FREELANCER -> STARTUP_IDEA
    2: [1, 3],   # STARTUP_IDEA -> FREELANCER, INVESTOR
    3: [2],      # INVESTOR -> STARTUP_IDEA
}


def get_matching_category_ids(signal_category_id: int) -> list[int]:
    """Zwraca listę ID kategorii które pasują do danej kategorii."""
    return SIGNAL_MATCHING.get(signal_category_id, [])


def calculate_signal_match(
    source_signal_id: int,
    source_details: Any,
    target_signal_id: int,
    target_details: Any,
) -> dict:
    """
    Oblicza współczynnik dopasowania między dwoma sygnałami używając OpenAI.
    
    Returns:
        dict: {"signal_id": target_signal_id, "accurate": float 0-100, "details": details}
    """
    prompt = f"""Jesteś ekspertem od matchowania ludzi w ekosystemie startupowym.

Oceń dopasowanie między dwoma sygnałami w skali 0-100, gdzie:
- 0 = brak dopasowania
- 100 = idealne dopasowanie

SYGNAŁ ŹRÓDŁOWY (ID: {source_signal_id}):
{json.dumps(source_details, ensure_ascii=False, indent=2) if source_details else "Brak szczegółów"}

SYGNAŁ DOCELOWY (ID: {target_signal_id}):
{json.dumps(target_details, ensure_ascii=False, indent=2) if target_details else "Brak szczegółów"}

Oceń na podstawie:
- Zgodności umiejętności/wymagań
- Komplementarności ofert
- Potencjału współpracy

Odpowiedz TYLKO w formacie JSON. Pole "accurate" zwracaj jako liczbę z dokładnością co najmniej do jednego miejsca po przecinku (np. 87.3, 64.8), unikaj wartości zaokrąglonych do pełnych dziesiątek:
{{"signal_id": {target_signal_id}, "accurate": <liczba 0-100 z miejscami po przecinku>}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Odpowiadasz tylko w formacie JSON. Nie dodawaj żadnego tekstu przed ani po JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=100
    )
    
    content = response.choices[0].message.content
    if content is None:
        return {
            "signal_id": target_signal_id,
            "accurate": 0.0,
            "details": None
        }
    result_text = content.strip()
    
    # Parsuj JSON z odpowiedzi
    try:
        # Usuń markdown code block jeśli istnieje
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result = json.loads(result_text)
        return {
            "signal_id": result.get("signal_id", target_signal_id),
            "accurate": float(result.get("accurate", 0)),
            "details": result.get("details", None)
        }
    except (json.JSONDecodeError, ValueError):
        return {
            "signal_id": target_signal_id,
            "accurate": 0.0,
            "details": None
        }


def calculate_bulk_signal_matches(
    source_signal_id: int,
    source_details: Any,
    target_signals: list[dict],  # [{"id": int, "details": Any}, ...]
) -> list[dict]:
    """
    Oblicza współczynniki dopasowania dla wielu sygnałów naraz.
    
    Returns:
        list[dict]: [{"signal_id": int, "accurate": float, "details": dict}, ...]
    """
    if not target_signals:
        return []
    
    # Przygotuj listę sygnałów do oceny
    targets_text = "\n\n".join([
        f"SYGNAŁ ID {sig['id']}:\n{json.dumps(sig['details'], ensure_ascii=False, indent=2) if sig['details'] else 'Brak szczegółów'}"
        for sig in target_signals
    ])
    
    signal_ids = [sig['id'] for sig in target_signals]
    
    prompt = f"""Jesteś ekspertem od matchowania ludzi w ekosystemie startupowym.

Oceń dopasowanie sygnału źródłowego do każdego z sygnałów docelowych w skali 0-100.

SYGNAŁ ŹRÓDŁOWY (ID: {source_signal_id}):
{json.dumps(source_details, ensure_ascii=False, indent=2) if source_details else "Brak szczegółów"}

SYGNAŁY DOCELOWE:
{targets_text}

Oceń każdy sygnał na podstawie:
- Zgodności umiejętności/wymagań
- Komplementarności ofert
- Potencjału współpracy

Odpowiedz TYLKO w formacie JSON (tablica). Każde pole "accurate" musi mieć co najmniej jedno miejsce po przecinku (np. 82.4, 71.9) i nie powinno być zaokrąglane do pełnych dziesiątek, jeśli nie jest to konieczne:
[{{"signal_id": <id>, "accurate": <liczba 0-100 z miejscami po przecinku>}}, ...]

Zwróć wyniki dla wszystkich sygnałów: {signal_ids}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Odpowiadasz tylko w formacie JSON. Nie dodawaj żadnego tekstu przed ani po JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=500
    )
    
    content = response.choices[0].message.content
    if content is None:
        return [{"signal_id": sig_id, "accurate": 0.0, "details": None} for sig_id in signal_ids]
    result_text = content.strip()
    
    try:
        # Usuń markdown code block jeśli istnieje
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        results = json.loads(result_text)
        
        # Upewnij się że mamy listę
        if isinstance(results, dict):
            results = [results]
            
        return [
            {
                "signal_id": r.get("signal_id"),
                "accurate": float(r.get("accurate", 0)),
                "details": r.get("details", None)
            }
            for r in results
        ]
    except (json.JSONDecodeError, ValueError):
        # Fallback - zwróć 0 dla wszystkich
        return [{"signal_id": sig_id, "accurate": 0.0, "details": None} for sig_id in signal_ids]


__all__ = [
    "get_embedding",
    "calculate_signal_match",
    "calculate_bulk_signal_matches",
    "get_matching_category_ids",
    "SIGNAL_MATCHING",
]