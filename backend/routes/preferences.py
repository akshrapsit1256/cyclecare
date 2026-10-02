from fastapi import APIRouter
from datetime import datetime
from database import get_db
from models import PreferencesCreate, PreferencesResponse

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])

@router.get("", response_model=PreferencesResponse)
def get_preferences():
    """Retrieves stored dietary preferences and wellness goals."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT dietary_preference, dietary_restrictions, wellness_goals, updated_at
            FROM preferences
            WHERE id = 1
        """)
        row = cursor.fetchone()

        if not row:
            return PreferencesResponse(
                dietary_preference="No preference",
                dietary_restrictions="",
                wellness_goals="Feel energized and balanced throughout my cycle",
                updated_at=datetime.now().isoformat()
            )

        return PreferencesResponse(
            dietary_preference=row["dietary_preference"],
            dietary_restrictions=row["dietary_restrictions"] or "",
            wellness_goals=row["wellness_goals"] or "",
            updated_at=row["updated_at"]
        )

@router.post("", response_model=PreferencesResponse)
def update_preferences(payload: PreferencesCreate):
    """Updates food preferences, dietary restrictions, and wellness goals."""
    now_iso = datetime.now().isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO preferences (id, dietary_preference, dietary_restrictions, wellness_goals, updated_at)
            VALUES (1, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                dietary_preference = excluded.dietary_preference,
                dietary_restrictions = excluded.dietary_restrictions,
                wellness_goals = excluded.wellness_goals,
                updated_at = excluded.updated_at
        """, (payload.dietary_preference, payload.dietary_restrictions, payload.wellness_goals, now_iso))

    return PreferencesResponse(
        dietary_preference=payload.dietary_preference,
        dietary_restrictions=payload.dietary_restrictions or "",
        wellness_goals=payload.wellness_goals or "",
        updated_at=now_iso
    )
