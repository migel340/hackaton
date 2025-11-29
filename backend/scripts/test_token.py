#!/usr/bin/env python3
"""Test dekodowania JWT tokenu"""

import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import settings
from services.auth import decode_access_token

# Token z błędu
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE3NjQ1MTcxMzJ9.RvKAEyMeQL0wdBtcw7A9KbwlvXDco0RzSeh6d8kLy8w"

print("🔍 Sprawdzam token...\n")
print(f"Token: {token[:50]}...\n")
print(f"SECRET_KEY: {settings.SECRET_KEY}\n")

# Test dekodowania
from jose import JWTError, jwt

try:
    # Próbuj zdekodować bez weryfikacji
    unverified = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"], options={"verify_signature": False, "verify_exp": False})
    print("📋 Token payload (bez weryfikacji):")
    print(f"   - sub (user_id): {unverified.get('sub')}")
    print(f"   - username: {unverified.get('username')}")
    print(f"   - exp (expires): {unverified.get('exp')}")
    
    exp_timestamp = unverified.get('exp')
    if exp_timestamp:
        exp_date = datetime.fromtimestamp(exp_timestamp)
        now = datetime.now()
        print(f"   - Wygasa: {exp_date}")
        print(f"   - Teraz: {now}")
        if exp_date < now:
            print("   ⚠️  TOKEN WYGASŁ!")
        else:
            print(f"   ✅ Token ważny jeszcze {exp_date - now}")
    
    print("\n🔐 Weryfikacja podpisu...")
    # Teraz z weryfikacją
    payload = decode_access_token(token)
    
    if payload:
        print("✅ Token jest poprawny i podpis się zgadza!")
        print(f"Payload: {payload}")
    else:
        print("❌ Token ma NIEPRAWIDŁOWY PODPIS")
        print("   Możliwe przyczyny:")
        print("   1. Token był utworzony z innym SECRET_KEY")
        print("   2. Token został zmodyfikowany")
        
except JWTError as e:
    print(f"❌ Błąd JWT: {e}")

