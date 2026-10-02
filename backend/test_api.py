import sys
import os
from datetime import date, timedelta
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from main import app
from database import init_db

def run_tests():
    print("=== Starting CycleCare API Integration Tests ===")
    
    # 1. Initialize DB
    init_db()
    client = TestClient(app)

    # 2. Test root
    root_res = client.get("/")
    assert root_res.status_code == 200, f"Root failed: {root_res.text}"
    print("[PASS] Root endpoint (/) healthy")

    # 3. Test Cycle Settings (POST and GET)
    # Set last period date to 10 days ago (should be Follicular phase for 28-day cycle)
    ten_days_ago = (date.today() - timedelta(days=9)).isoformat()
    cycle_payload = {
        "last_period_date": ten_days_ago,
        "average_cycle_length": 28
    }
    cycle_post_res = client.post("/api/cycle", json=cycle_payload)
    assert cycle_post_res.status_code == 200, f"Cycle POST failed: {cycle_post_res.text}"
    cycle_data = cycle_post_res.json()
    assert cycle_data["current_cycle_day"] == 10
    assert cycle_data["current_phase"] == "Follicular"
    assert cycle_data["is_configured"] is True
    print(f"[PASS] Cycle POST /api/cycle: Day {cycle_data['current_cycle_day']}, Phase: {cycle_data['current_phase']}")

    cycle_get_res = client.get("/api/cycle")
    assert cycle_get_res.status_code == 200
    assert cycle_get_res.json()["current_phase"] == "Follicular"
    print("[PASS] Cycle GET /api/cycle")

    # 4. Test Daily Check-in (POST and GET)
    checkin_payload = {
        "symptoms": ["cramps", "fatigue", "bloating"],
        "mood": "Calm",
        "energy_level": 2,
        "notes": "Testing daily checkin note for hacktoberfest"
    }
    checkin_post_res = client.post("/api/checkin", json=checkin_payload)
    assert checkin_post_res.status_code == 200, f"Checkin POST failed: {checkin_post_res.text}"
    checkin_data = checkin_post_res.json()
    assert "cramps" in checkin_data["symptoms"]
    assert checkin_data["energy_level"] == 2
    print("[PASS] Checkin POST /api/checkin")

    checkin_get_res = client.get("/api/checkin")
    assert checkin_get_res.status_code == 200
    assert checkin_get_res.json()["mood"] == "Calm"
    print("[PASS] Checkin GET /api/checkin")

    history_res = client.get("/api/checkin/history")
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1
    print(f"[PASS] Checkin GET /api/checkin/history: {len(history_res.json())} record(s)")

    # 5. Test Preferences (POST and GET)
    pref_payload = {
        "dietary_preference": "Indian food",
        "dietary_restrictions": "Gluten-free",
        "wellness_goals": "Ease cramps and boost afternoon stamina"
    }
    pref_post_res = client.post("/api/preferences", json=pref_payload)
    assert pref_post_res.status_code == 200, f"Preferences POST failed: {pref_post_res.text}"
    pref_data = pref_post_res.json()
    assert pref_data["dietary_preference"] == "Indian food"
    print("[PASS] Preferences POST /api/preferences")

    pref_get_res = client.get("/api/preferences")
    assert pref_get_res.status_code == 200
    assert pref_get_res.json()["dietary_restrictions"] == "Gluten-free"
    print("[PASS] Preferences GET /api/preferences")

    # 6. Test AI Status
    ai_status_res = client.get("/api/ai/status")
    assert ai_status_res.status_code == 200
    status_data = ai_status_res.json()
    print(f"[PASS] AI Status GET /api/ai/status (Ollama Status: {status_data.get('status')})")

    # 7. Test AI Wellness Generation
    ai_gen_res = client.post("/api/ai/wellness", json={})
    assert ai_gen_res.status_code == 200, f"AI Wellness POST failed: {ai_gen_res.text}"
    ai_data = ai_gen_res.json()
    assert "wellness_suggestions" in ai_data
    assert "meal_suggestions" in ai_data
    assert len(ai_data["meal_suggestions"]) >= 2
    assert "gentle_guidance" in ai_data
    assert "disclaimer" in ai_data
    print(f"[PASS] AI Wellness POST /api/ai/wellness generated successfully (Source: {ai_data['source']})")
    print(f"       Guidance preview: {ai_data['gentle_guidance']}")
    print(f"       Meal 1: {ai_data['meal_suggestions'][0]['name']}")

    # 8. Test AI Latest Cache
    latest_ai_res = client.get("/api/ai/latest")
    assert latest_ai_res.status_code == 200
    assert latest_ai_res.json() is not None
    print("[PASS] AI Latest GET /api/ai/latest cache verified")

    print("\n=== All CycleCare API Integration Tests Passed Successfully! ===")

if __name__ == "__main__":
    run_tests()
