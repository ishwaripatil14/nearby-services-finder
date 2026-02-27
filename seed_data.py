import requests

API_URL = "http://localhost:8000"

# Sample Services in Mumbai area
services = [
    {"name": "Lilavati Hospital", "category": "hospital", "lat": 19.0514, "lng": 72.8300, "rating": 4.5},
    {"name": "ICICI Bank ATM", "category": "ATM", "lat": 19.0600, "lng": 72.8350, "rating": 4.0},
    {"name": "Phoenix Marketcity", "category": "shop", "lat": 19.0850, "lng": 72.8900, "rating": 4.8},
    {"name": "Nanavati Hospital", "category": "hospital", "lat": 19.0950, "lng": 72.8400, "rating": 4.3},
    {"name": "Starbucks BKC", "category": "others", "lat": 19.0600, "lng": 72.8600, "rating": 4.6},
    {"name": "D-Mart", "category": "shop", "lat": 19.1100, "lng": 72.8700, "rating": 4.2}
]

def login():
    res = requests.post(f"{API_URL}/auth/login", json={"username": "admin", "password": "admin123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    print("Login failed. Make sure backend is running and admin is seeded.")
    return None

def seed_data():
    token = login()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}
    for service in services:
        res = requests.post(f"{API_URL}/services", json=service, headers=headers)
        if res.status_code == 200:
            print(f"Added: {service['name']}")
        else:
            print(f"Failed to add {service['name']}: {res.text}")

if __name__ == "__main__":
    seed_data()
