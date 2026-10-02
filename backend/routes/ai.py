from fastapi import APIRouter
from datetime import date, datetime
import json
from typing import Optional
from database import get_db
from models import AIWellnessRequest, AIWellnessResponse
from services.cycle_service import calculate_cycle_metrics
from services.ollama_service import check_ollama_status, generate_wellness_plan

router = APIRouter(prefix="/api/ai", tags=["AI Wellness"])

@router.get("/status")
async def get_ai_status():
    """Checks the health and availability of the local Ollama instance and model."""
    status = await check_ollama_status()
    return status

@router.get("/latest", response_model=Optional[AIWellnessResponse])
def get_latest_recommendation():
    """Retrieves the most recent AI wellness recommendation from local database."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT cycle_phase, cycle_day, recommendations_json, source, created_at
            FROM ai_recommendations
            ORDER BY id DESC
            LIMIT 1
        """)
        row = cursor.fetchone()
        if not row:
            return None

        try:
            data = json.loads(row["recommendations_json"])
            return AIWellnessResponse(**data)
        except Exception:
            return None

@router.post("/wellness", response_model=AIWellnessResponse)
async def generate_wellness_recommendations(payload: Optional[AIWellnessRequest] = None):
    """
    Collects current cycle phase, today's symptoms, and dietary preferences
    from the database (or request overrides), calls local Ollama, and returns structured suggestions.
    """
    today_str = date.today().isoformat()

    # 1. Resolve Cycle Phase & Day
    cycle_phase = payload.cycle_phase if payload and payload.cycle_phase else None
    cycle_day = payload.cycle_day if payload and payload.cycle_day else None

    # 2. Resolve Symptoms
    symptoms = payload.symptoms if payload and payload.symptoms is not None else None

    # 3. Resolve Preferences
    dietary_pref = payload.dietary_preference if payload and payload.dietary_preference else None
    dietary_restr = payload.dietary_restrictions if payload and payload.dietary_restrictions is not None else None
    wellness_goals = payload.wellness_goals if payload and payload.wellness_goals is not None else None

    # Query local SQLite for missing fields
    with get_db() as conn:
        cursor = conn.cursor()

        # Fetch cycle if needed
        if not cycle_phase or not cycle_day:
            cursor.execute("SELECT last_period_date, average_cycle_length FROM cycle_settings WHERE id = 1")
            cycle_row = cursor.fetchone()
            if cycle_row:
                metrics = calculate_cycle_metrics(cycle_row["last_period_date"], cycle_row["average_cycle_length"])
                cycle_phase = cycle_phase or metrics["current_phase"]
                cycle_day = cycle_day or metrics["current_cycle_day"]
            else:
                cycle_phase = cycle_phase or "Menstrual"
                cycle_day = cycle_day or 1

        # Fetch today's symptoms if needed
        if symptoms is None:
            cursor.execute("SELECT symptoms FROM checkins WHERE date = ?", (today_str,))
            checkin_row = cursor.fetchone()
            if checkin_row:
                try:
                    symptoms = json.loads(checkin_row["symptoms"])
                except Exception:
                    symptoms = []
            else:
                symptoms = []

        # Fetch preferences if needed
        if dietary_pref is None or dietary_restr is None or wellness_goals is None:
            cursor.execute("SELECT dietary_preference, dietary_restrictions, wellness_goals FROM preferences WHERE id = 1")
            pref_row = cursor.fetchone()
            if pref_row:
                dietary_pref = dietary_pref or pref_row["dietary_preference"]
                dietary_restr = dietary_restr if dietary_restr is not None else (pref_row["dietary_restrictions"] or "")
                wellness_goals = wellness_goals if wellness_goals is not None else (pref_row["wellness_goals"] or "")
            else:
                dietary_pref = dietary_pref or "No preference"
                dietary_restr = dietary_restr or ""
                wellness_goals = wellness_goals or ""

    # Call Ollama service
    result = await generate_wellness_plan(
        cycle_phase=cycle_phase,
        cycle_day=cycle_day,
        symptoms=symptoms,
        dietary_preference=dietary_pref,
        dietary_restrictions=dietary_restr,
        wellness_goals=wellness_goals
    )

    # Save to local database cache
    try:
        now_iso = datetime.now().isoformat()
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO ai_recommendations (date, cycle_phase, cycle_day, recommendations_json, source, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                today_str,
                cycle_phase,
                cycle_day,
                json.dumps(result),
                result.get("source", "ollama"),
                now_iso
            ))
    except Exception:
        pass

    return AIWellnessResponse(**result)
