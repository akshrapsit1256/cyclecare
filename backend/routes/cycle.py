from fastapi import APIRouter, HTTPException
from datetime import datetime, date
from database import get_db
from models import CycleSettingsCreate, CycleStatusResponse
from services.cycle_service import calculate_cycle_metrics

router = APIRouter(prefix="/api/cycle", tags=["Cycle"])

@router.get("", response_model=CycleStatusResponse)
def get_cycle_status():
    """Returns current cycle phase, cycle day, days since last period, and progress."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT last_period_date, average_cycle_length FROM cycle_settings WHERE id = 1")
        row = cursor.fetchone()

        if not row:
            # Unconfigured default
            today_str = date.today().isoformat()
            metrics = calculate_cycle_metrics(today_str, 28)
            metrics["is_configured"] = False
            return CycleStatusResponse(**metrics)

        metrics = calculate_cycle_metrics(row["last_period_date"], row["average_cycle_length"])
        metrics["is_configured"] = True
        return CycleStatusResponse(**metrics)

@router.post("", response_model=CycleStatusResponse)
def update_cycle_settings(payload: CycleSettingsCreate):
    """Sets or updates the first day of last period and average cycle length."""
    # Basic validation
    try:
        parsed_date = datetime.strptime(payload.last_period_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Please use YYYY-MM-DD.")

    now_iso = datetime.now().isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO cycle_settings (id, last_period_date, average_cycle_length, updated_at)
            VALUES (1, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                last_period_date = excluded.last_period_date,
                average_cycle_length = excluded.average_cycle_length,
                updated_at = excluded.updated_at
        """, (payload.last_period_date, payload.average_cycle_length, now_iso))

    metrics = calculate_cycle_metrics(payload.last_period_date, payload.average_cycle_length)
    metrics["is_configured"] = True
    return CycleStatusResponse(**metrics)
