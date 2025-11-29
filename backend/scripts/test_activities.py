"""
Skrypt testowy do sprawdzenia API aktywności.
"""
import sys
from pathlib import Path

# Dodaj katalog główny do PYTHONPATH
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

import requests

BASE_URL = "http://localhost:8000/api/v1"


def test_activities():
    """Test pełnego flow aktywności."""
    print("🧪 Test API aktywności\n")
    
    # 1. Rejestracja nowego użytkownika
    print("1️⃣ Rejestracja użytkownika...")
    register_data = {
        "username": "testuser_activities",
        "email": "activities@test.pl",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 201:
        print(f"✅ Użytkownik zarejestrowany: {response.json()}")
    else:
        print(f"❌ Błąd rejestracji: {response.status_code} - {response.text}")
        return
    
    # 2. Logowanie przez email
    print("\n2️⃣ Logowanie przez email...")
    login_data = {
        "email": "activities@test.pl",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token_data = response.json()
        token = token_data["access_token"]
        print(f"✅ Zalogowano, token: {token[:20]}...")
    else:
        print(f"❌ Błąd logowania: {response.status_code} - {response.text}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Sprawdź dostępne typy aktywności
    print("\n3️⃣ Sprawdzanie dostępnych typów aktywności...")
    response = requests.get(f"{BASE_URL}/activities/types")
    if response.status_code == 200:
        activity_types = response.json()
        print(f"✅ Dostępne typy: {activity_types}")
    else:
        print(f"❌ Błąd: {response.status_code} - {response.text}")
    
    # 4. Dodaj aktywność FREELANCER
    print("\n4️⃣ Dodawanie aktywności FREELANCER...")
    activity_data = {"activity_type": "FREELANCER"}
    response = requests.post(f"{BASE_URL}/activities/", json=activity_data, headers=headers)
    if response.status_code == 201:
        activity = response.json()
        print(f"✅ Aktywność dodana: {activity}")
        freelancer_id = activity["id"]
    else:
        print(f"❌ Błąd: {response.status_code} - {response.text}")
        return
    
    # 5. Dodaj aktywność IDEA_CREATOR
    print("\n5️⃣ Dodawanie aktywności IDEA_CREATOR...")
    activity_data = {"activity_type": "IDEA_CREATOR"}
    response = requests.post(f"{BASE_URL}/activities/", json=activity_data, headers=headers)
    if response.status_code == 201:
        activity = response.json()
        print(f"✅ Aktywność dodana: {activity}")
    else:
        print(f"❌ Błąd: {response.status_code} - {response.text}")
    
    # 6. Dodaj aktywność FUNDATOR
    print("\n6️⃣ Dodawanie aktywności FUNDATOR...")
    activity_data = {"activity_type": "FUNDATOR"}
    response = requests.post(f"{BASE_URL}/activities/", json=activity_data, headers=headers)
    if response.status_code == 201:
        activity = response.json()
        print(f"✅ Aktywność dodana: {activity}")
    else:
        print(f"❌ Błąd: {response.status_code} - {response.text}")
    
    # 7. Pobierz swoje aktywności
    print("\n7️⃣ Pobieranie moich aktywności...")
    response = requests.get(f"{BASE_URL}/activities/me", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Użytkownik: {data['username']}")
        print(f"✅ Liczba aktywności: {len(data['activities'])}")
        for act in data['activities']:
            print(f"   - {act['activity_type']} (ID: {act['id']})")
    else:
        print(f"❌ Błąd: {response.status_code} - {response.text}")
    
    # 8. Próba dodania duplikatu
    print("\n8️⃣ Próba dodania duplikatu FREELANCER...")
    activity_data = {"activity_type": "FREELANCER"}
    response = requests.post(f"{BASE_URL}/activities/", json=activity_data, headers=headers)
    if response.status_code == 400:
        print(f"✅ Poprawnie odrzucono duplikat: {response.json()['detail']}")
    else:
        print(f"⚠️  Nieoczekiwany status: {response.status_code}")
    
    # 9. Usuń aktywność FREELANCER
    print(f"\n9️⃣ Usuwanie aktywności FREELANCER (ID: {freelancer_id})...")
    response = requests.delete(f"{BASE_URL}/activities/{freelancer_id}", headers=headers)
    if response.status_code == 204:
        print("✅ Aktywność usunięta")
    else:
        print(f"❌ Błąd: {response.status_code} - {response.text}")
    
    # 10. Sprawdź aktywności po usunięciu
    print("\n🔟 Sprawdzanie aktywności po usunięciu...")
    response = requests.get(f"{BASE_URL}/activities/me", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Pozostałe aktywności:")
        for act in data['activities']:
            print(f"   - {act['activity_type']} (ID: {act['id']})")
    else:
        print(f"❌ Błąd: {response.status_code} - {response.text}")
    
    print("\n✨ Test zakończony!")


if __name__ == "__main__":
    test_activities()
