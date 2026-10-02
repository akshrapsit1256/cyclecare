from datetime import date, datetime, timedelta
from typing import Dict, Any

PHASE_DESCRIPTIONS = {
    "Menstrual": "Rest & Renew — Progesterone and estrogen are low. Focus on gentle rest, hydration, warmth, and nutrient-dense comfort.",
    "Follicular": "Rising Energy & Fresh Focus — Estrogen is rising. Your natural stamina and mental clarity are beginning to peak.",
    "Ovulation": "Peak Vitality & Connection — Estrogen reaches its highest level. You may feel more social, energetic, and confident.",
    "Luteal": "Nurture & Wind Down — Progesterone rises to support your body. Focus on warm nourishing foods, steady pacing, and restorative sleep."
}

def calculate_cycle_metrics(last_period_str: str, average_cycle_length: int = 28, target_date: date = None) -> Dict[str, Any]:
    """
    Computes current cycle day, estimated phase, progress, and next period date.
    All calculations are simple, transparent, and designed for non-medical general wellness.
    """
    if target_date is None:
        target_date = date.today()

    try:
        last_period = datetime.strptime(last_period_str, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        # Default fallback if parsing fails
        last_period = target_date

    days_since = (target_date - last_period).days
    cycle_length = max(21, min(45, average_cycle_length or 28))

    if days_since < 0:
        # Future date provided
        current_day = 1
        next_period = last_period
        progress = 0.0
    else:
        current_day = (days_since % cycle_length) + 1
        cycles_completed = days_since // cycle_length
        next_period = last_period + timedelta(days=(cycles_completed + 1) * cycle_length)
        progress = round((current_day / cycle_length) * 100, 1)

    # Estimate phase based on cycle day
    phase = determine_phase(current_day, cycle_length)

    return {
        "last_period_date": last_period.isoformat(),
        "average_cycle_length": cycle_length,
        "current_cycle_day": current_day,
        "current_phase": phase,
        "phase_description": PHASE_DESCRIPTIONS.get(phase, ""),
        "days_since_last_period": max(0, days_since),
        "estimated_next_period_date": next_period.isoformat(),
        "cycle_progress_percent": progress,
        "is_configured": True
    }

def determine_phase(day: int, cycle_length: int = 28) -> str:
    """
    Determines general phase based on day and cycle length.
    - Menstrual: Days 1 to 5
    - Follicular: Days 6 to (ovulation_day - 2)
    - Ovulation: (ovulation_day - 1) to (ovulation_day + 1)
    - Luteal: (ovulation_day + 2) to cycle_length
    """
    # Estimated ovulation is usually 14 days before the end of the cycle
    ovulation_day = max(7, cycle_length - 14)

    if day <= 5:
        return "Menstrual"
    elif day < (ovulation_day - 1):
        return "Follicular"
    elif day <= (ovulation_day + 1):
        return "Ovulation"
    else:
        return "Luteal"
