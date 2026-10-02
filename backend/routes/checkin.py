from fastapi import APIRouter, HTTPException, Query
from datetime import date, datetime
import json
from typing import List, Optional
from database import get_db
from models import CheckInCreate, CheckInResponse

router = APIRouter(prefix="/api/checkin", tags=["Check-in"])

@router.get("", response_model=Optional[CheckInResponse])
def get_checkin(target_date: Optional[str] = Query(None, alias="date")):
    """Retrieves check-in for a given date (defaults to today)."""
    lookup_date = target_date or date.today().isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, date, symptoms, mood, energy_level, notes, created_at
            FROM checkins
            WHERE date = ?
        """, (lookup_date,))
        row = cursor.fetchone()

        if not row:
            return None

        try:
            symptoms_list = json.loads(row["symptoms"])
        except Exception:
            symptoms_list = []

        return CheckInResponse(
            id=row["id"],
            date=row["date"],
            symptoms=symptoms_list,
            mood=row["mood"],
            energy_level=row["energy_level"],
            notes=row["notes"],
            created_at=row["created_at"]
        )

@router.get("/history", response_model=List[CheckInResponse])
def get_checkin_history(limit: int = 14):
    """Retrieves recent check-ins ordered by date descending."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, date, symptoms, mood, energy_level, notes, created_at
            FROM checkins
            ORDER BY date DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()

        results = []
        for row in rows:
            try:
                symptoms_list = json.loads(row["symptoms"])
            except Exception:
                symptoms_list = []

            results.append(CheckInResponse(
                id=row["id"],
                date=row["date"],
                symptoms=symptoms_list,
                mood=row["mood"],
                energy_level=row["energy_level"],
                notes=row["notes"],
                created_at=row["created_at"]
            ))
        return results

@router.post("", response_model=CheckInResponse)
def save_checkin(payload: CheckInCreate):
    """Saves or updates symptom check-in for today or a chosen date."""
    entry_date = payload.date or date.today().isoformat()
    symptoms_json = json.dumps(payload.symptoms)
    now_iso = datetime.now().isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO checkins (date, symptoms, mood, energy_level, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(date) DO UPDATE SET
                symptoms = excluded.symptoms,
                mood = excluded.mood,
                energy_level = excluded.energy_level,
                notes = excluded.notes,
                created_at = excluded.created_at
        """, (entry_date, symptoms_json, payload.mood, payload.energy_level, payload.notes, now_iso))

        cursor.execute("SELECT id FROM checkins WHERE date = ?", (entry_date,))
        row = cursor.fetchone()
        inserted_id = row["id"] if row else 1

    return CheckInResponse(
        id=inserted_id,
        date=entry_date,
        symptoms=payload.symptoms,
        mood=payload.mood,
        energy_level=payload.energy_level,
        notes=payload.notes,
        created_at=now_iso
    )
