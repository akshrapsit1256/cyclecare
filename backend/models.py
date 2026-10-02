from pydantic import BaseModel, Field
from typing import List, Optional

class CycleSettingsCreate(BaseModel):
    last_period_date: str = Field(..., description="Date of first day of last period in YYYY-MM-DD")
    average_cycle_length: int = Field(28, ge=21, le=45, description="Average menstrual cycle length in days (typically 21-45)")

class CycleStatusResponse(BaseModel):
    last_period_date: Optional[str] = None
    average_cycle_length: int = 28
    current_cycle_day: int = 1
    current_phase: str = "Menstrual"
    phase_description: str = ""
    days_since_last_period: int = 0
    estimated_next_period_date: Optional[str] = None
    cycle_progress_percent: float = 0.0
    is_configured: bool = False

class CheckInCreate(BaseModel):
    date: Optional[str] = Field(None, description="Check-in date in YYYY-MM-DD format (defaults to today)")
    symptoms: List[str] = Field(default_factory=list, description="List of recorded symptoms")
    mood: Optional[str] = Field(None, description="User's current mood")
    energy_level: Optional[int] = Field(3, ge=1, le=5, description="Energy rating 1 (lowest) to 5 (highest)")
    notes: Optional[str] = Field(None, description="Personal thoughts or notes")

class CheckInResponse(BaseModel):
    id: int
    date: str
    symptoms: List[str]
    mood: Optional[str] = None
    energy_level: Optional[int] = 3
    notes: Optional[str] = None
    created_at: str

class PreferencesCreate(BaseModel):
    dietary_preference: str = Field("No preference", description="e.g., Vegetarian, Vegan, High-protein, Indian food, etc.")
    dietary_restrictions: Optional[str] = Field("", description="e.g. Gluten-free, lactose intolerant, no nuts")
    wellness_goals: Optional[str] = Field("", description="e.g. Ease cramps, stay energized, stress reduction")

class PreferencesResponse(BaseModel):
    dietary_preference: str = "No preference"
    dietary_restrictions: str = ""
    wellness_goals: str = ""
    updated_at: str

class MealItem(BaseModel):
    name: str
    ingredients: List[str]
    why_it_helps: str

class WellnessSuggestions(BaseModel):
    self_care: List[str]
    hydration_reminder: str
    activity_suggestion: str
    sleep_suggestion: str

class AIWellnessRequest(BaseModel):
    cycle_phase: Optional[str] = None
    cycle_day: Optional[int] = None
    symptoms: Optional[List[str]] = None
    dietary_preference: Optional[str] = None
    dietary_restrictions: Optional[str] = None
    wellness_goals: Optional[str] = None

class AIWellnessResponse(BaseModel):
    wellness_suggestions: WellnessSuggestions
    meal_suggestions: List[MealItem]
    gentle_guidance: str
    disclaimer: str
    source: str = "ollama"  # 'ollama' or 'offline_knowledge_base'
    model_used: Optional[str] = None
