import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger("cyclecare.ollama")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma2:2b")
OLLAMA_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT", "60.0"))

DISCLAIMER_TEXT = (
    "CycleCare is a wellness companion and is not intended to diagnose, treat, or prevent "
    "medical conditions. AI-generated suggestions are general wellness information and "
    "should not replace professional medical advice."
)

async def check_ollama_status() -> Dict[str, Any]:
    """
    Checks if local Ollama daemon is reachable and lists installed models.
    """
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{OLLAMA_HOST}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", [])]
                return {
                    "status": "online",
                    "host": OLLAMA_HOST,
                    "active_model": OLLAMA_MODEL,
                    "models_available": models,
                    "model_ready": any(OLLAMA_MODEL.split(":")[0] in m for m in models)
                }
    except Exception as e:
        logger.debug(f"Ollama status check failed: {e}")

    return {
        "status": "offline",
        "host": OLLAMA_HOST,
        "active_model": OLLAMA_MODEL,
        "models_available": [],
        "model_ready": False,
        "message": (
            "Ollama is not running locally. To enable local open-source AI inference, "
            f"install Ollama from https://ollama.com and run 'ollama run {OLLAMA_MODEL}'."
        )
    }

def build_system_prompt() -> str:
    return (
        "You are CycleCare, a compassionate, privacy-first personal menstrual wellness companion. "
        "Your role is to offer warm, supportive, evidence-based lifestyle, hydration, rest, gentle movement, "
        "and nourishing meal suggestions tailored to the user's menstrual cycle phase and current symptoms.\n\n"
        "STRICT SAFETY & ETHICAL RULES:\n"
        "1. DO NOT diagnose any condition or illness.\n"
        "2. DO NOT recommend medications, pharmaceuticals, supplements with dosages, or medical therapies.\n"
        "3. Provide ONLY general wellness, nutritional nourishment, self-compassion, and gentle movement ideas.\n"
        "4. Always respect the user's dietary preferences and restrictions.\n"
        "5. Output must be strictly valid JSON matching the requested structure without markdown wrapping.\n"
    )

def build_user_prompt(
    cycle_phase: str,
    cycle_day: int,
    symptoms: List[str],
    dietary_preference: str,
    dietary_restrictions: str,
    wellness_goals: str
) -> str:
    symptoms_str = ", ".join(symptoms) if symptoms else "None reported today"
    pref_str = dietary_preference if dietary_preference else "No specific preference"
    restr_str = dietary_restrictions if dietary_restrictions else "None"
    goal_str = wellness_goals if wellness_goals else "Maintain natural balance, hydration, and steady energy"

    return f"""
Please generate personalized wellness and meal suggestions for today based on these non-sensitive parameters:
- Menstrual Cycle Phase: {cycle_phase}
- Current Cycle Day: Day {cycle_day}
- Today's Symptoms: {symptoms_str}
- Dietary Preference: {pref_str}
- Dietary Restrictions: {restr_str}
- General Wellness Goal: {goal_str}

Return a valid JSON object matching this exact format:
{{
  "wellness_suggestions": {{
    "self_care": [
      "Short actionable tip 1",
      "Short actionable tip 2",
      "Short actionable tip 3"
    ],
    "hydration_reminder": "Gentle reminder highlighting a suitable tea, warm beverage, or water routine for this phase",
    "activity_suggestion": "Gentle movement or restorative rest tailored to current energy and phase",
    "sleep_suggestion": "Wind-down routine or sleep tip suitable for this phase"
  }},
  "meal_suggestions": [
    {{
      "name": "Meal or Snack Title",
      "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
      "why_it_helps": "Brief explanation of how the nutrients support this phase/symptoms"
    }},
    {{
      "name": "Second Meal Title",
      "ingredients": ["Ingredient 1", "Ingredient 2"],
      "why_it_helps": "Brief explanation"
    }}
  ],
  "gentle_guidance": "One encouraging, empathetic sentence connecting today's cycle phase and feelings to self-compassion."
}}
"""

async def generate_wellness_plan(
    cycle_phase: str = "Menstrual",
    cycle_day: int = 1,
    symptoms: Optional[List[str]] = None,
    dietary_preference: str = "No preference",
    dietary_restrictions: str = "",
    wellness_goals: str = ""
) -> Dict[str, Any]:
    """
    Sends request to local Ollama API. If Ollama is offline or fails, falls back seamlessly
    to an evidence-based offline knowledge-base without crashing.
    """
    symptoms = symptoms or []
    prompt = build_user_prompt(
        cycle_phase, cycle_day, symptoms, dietary_preference, dietary_restrictions, wellness_goals
    )
    system_prompt = build_system_prompt()

    timeout_config = httpx.Timeout(connect=2.0, read=OLLAMA_TIMEOUT, write=10.0, pool=5.0)
    try:
        async with httpx.AsyncClient(timeout=timeout_config) as client:
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.4,
                    "top_p": 0.9
                }
            }
            logger.info(f"Querying Ollama at {OLLAMA_HOST}/api/generate with model {OLLAMA_MODEL}")
            response = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload)

            if response.status_code == 200:
                result_raw = response.json().get("response", "")
                parsed = parse_ai_json(result_raw)
                if parsed:
                    return {
                        "wellness_suggestions": parsed.get("wellness_suggestions", {}),
                        "meal_suggestions": parsed.get("meal_suggestions", []),
                        "gentle_guidance": parsed.get("gentle_guidance", "Listen to your body today and honor its rhythms."),
                        "disclaimer": DISCLAIMER_TEXT,
                        "source": "ollama",
                        "model_used": OLLAMA_MODEL
                    }
    except Exception as e:
        logger.warning(f"Ollama generation unavailable ({e}). Activating offline fallback knowledge base.")

    # Graceful fallback: high quality evidence-informed offline recommendations
    fallback_data = generate_offline_fallback(
        cycle_phase, cycle_day, symptoms, dietary_preference, dietary_restrictions, wellness_goals
    )
    fallback_data["disclaimer"] = DISCLAIMER_TEXT
    fallback_data["source"] = "offline_knowledge_base"
    fallback_data["model_used"] = f"{OLLAMA_MODEL} (Offline Fallback)"
    return fallback_data

def parse_ai_json(text: str) -> Optional[Dict[str, Any]]:
    """Strips Markdown ticks if present and parses JSON response."""
    clean = text.strip()
    if clean.startswith("```json"):
        clean = clean[7:]
    elif clean.startswith("```"):
        clean = clean[3:]
    if clean.endswith("```"):
        clean = clean[:-3]
    clean = clean.strip()
    try:
        return json.loads(clean)
    except Exception:
        return None

def generate_offline_fallback(
    phase: str,
    day: int,
    symptoms: List[str],
    diet: str,
    restrictions: str,
    goals: str
) -> Dict[str, Any]:
    """
    Intelligent evidence-informed fallback for when Ollama is offline or downloading models.
    Guarantees the user always receives practical, safe, comforting guidance.
    """
    has_cramps = any("cramp" in s.lower() for s in symptoms)
    has_fatigue = any("fatigue" in s.lower() or "energy" in s.lower() for s in symptoms)
    has_bloating = any("bloat" in s.lower() for s in symptoms)
    is_veg = "veg" in diet.lower() or "vegan" in diet.lower()
    is_indian = "indian" in diet.lower()

    if phase == "Menstrual":
        self_care = [
            "Keep a warm heating pad or warm water bottle close to your abdomen for gentle comfort.",
            "Schedule micro-pauses throughout your day to avoid pushing through physical exhaustion.",
            "Wear loose, breathable clothing to minimize abdominal constriction."
        ]
        hydration = "Sip warm ginger-cinnamon infusion or soothing chamomile tea with a squeeze of lemon."
        activity = "Gentle supine stretches, child's pose, or a quiet 15-minute nature walk."
        sleep = "Prioritize an early bedtime with dim lighting 45 minutes prior to sleep."
        
        if is_indian:
            meals = [
                {
                    "name": "Warm Moong Dal Khichdi with Ghee & Cumin",
                    "ingredients": ["Yellow moong dal", "White rice", "Asefetida (hing)", "Cumin seeds", "A spoonful of warm A2 ghee"],
                    "why_it_helps": "Extremely easy to digest, warm and soothing for cramps and digestive sensitivity during menstruation."
                },
                {
                    "name": "Spiced Spinach & Paneer/Tofu with Warm Roti",
                    "ingredients": ["Fresh baby spinach", "Paneer or firm tofu", "Garlic", "Turmeric", "Whole wheat roti"],
                    "why_it_helps": "Packed with iron, magnesium, and gentle warmth to replenish vital energy."
                }
            ]
        elif is_veg:
            meals = [
                {
                    "name": "Nourishing Lentil & Sweet Potato Stew",
                    "ingredients": ["Red lentils", "Diced sweet potato", "Ginger", "Coconut milk", "Fresh spinach"],
                    "why_it_helps": "Provides bioavailable plant iron, magnesium to soothe muscle contractions, and warming complex carbs."
                },
                {
                    "name": "Golden Turmeric Oatmeal with Pumpkin Seeds",
                    "ingredients": ["Rolled oats", "Almond milk", "Ground turmeric & cinnamon", "Raw pumpkin seeds"],
                    "why_it_helps": "Anti-inflammatory turmeric paired with zinc-rich pumpkin seeds supports gentle comfort."
                }
            ]
        else:
            meals = [
                {
                    "name": "Slow-Simmered Chicken Bone Broth with Ginger & Greens",
                    "ingredients": ["Free-range bone broth", "Shredded chicken", "Fresh ginger slices", "Baby bok choy"],
                    "why_it_helps": "Rich in collagen, glycine, and iron to replenish lost minerals and ease cramp intensity."
                },
                {
                    "name": "Wild Salmon with Roasted Butternut Squash",
                    "ingredients": ["Wild salmon fillet", "Cubed butternut squash", "Olive oil", "Steamed broccolini"],
                    "why_it_helps": "High in Omega-3 fatty acids to help calm prostaglandins and muscle soreness."
                }
            ]
        guidance = "Your body is doing hard, restorative work today. Treat yourself with deep patience and unhurried grace."

    elif phase == "Follicular":
        self_care = [
            "Use this rising energy window to organize ideas or try a new creative project.",
            "Get bright natural morning sunlight to reinforce healthy circadian rhythm.",
            "Incorporate probiotic-rich foods to support a thriving gut microbiome."
        ]
        hydration = "Infused room-temperature water with cucumber, fresh mint, and a pinch of pink salt."
        activity = "Brisk walking, vinyasa flow yoga, light jogging, or bodyweight strength."
        sleep = "Consistent 7.5 to 8 hours; your sleep architecture is naturally deep during this phase."
        
        meals = [
            {
                "name": "Zesty Sprouted Lentil & Avocado Rainbow Salad",
                "ingredients": ["Sprouted moong or chickpeas", "Avocado", "Cherry tomatoes", "Lemon-tahini dressing"],
                "why_it_helps": "Fresh, raw enzymes and healthy monounsaturated fats support estrogen metabolization."
            },
            {
                "name": "Bright Quinoa Grain Bowl with Steamed Edamame",
                "ingredients": ["Fluffy quinoa", "Edamame", "Grated carrots", "Sesame ginger drizzle"],
                "why_it_helps": "Clean complete plant protein that maintains steady, focused daytime stamina."
            }
        ]
        guidance = "Your natural curiosity and energy are blossoming. Lean into positive momentum at a joyful pace."

    elif phase == "Ovulation":
        self_care = [
            "Hydrate proactively, as metabolic temperature is slightly higher around ovulation.",
            "Great time for collaborative meetings or meaningful social connections.",
            "Support natural hormone clearance with cruciferous vegetables."
        ]
        hydration = "Electrolyte-rich coconut water or cold-brewed hibiscus iced tea."
        activity = "HIIT session, spin class, strength training, or a dynamic dance workout."
        sleep = "Keep your sleeping room cool and comfortable to offset a slight rise in body temperature."
        
        meals = [
            {
                "name": "Grilled Lemon-Herb Salmon or Tempeh with Asparagus",
                "ingredients": ["Salmon or organic tempeh", "Asparagus spears", "Olive oil", "Lemon zest"],
                "why_it_helps": "Glutathione-rich asparagus and anti-inflammatory fats support liver filtration and vibrant energy."
            },
            {
                "name": "Cruciferous Slaw with Pumpkin Seeds & Berries",
                "ingredients": ["Shredded purple cabbage", "Kale", "Blueberries", "Toasted sunflower & pumpkin seeds"],
                "why_it_helps": "Rich in DIM (diindolylmethane) and fiber to help balance peak estrogen levels."
            }
        ]
        guidance = "You are in your phase of peak radiance and vitality. Channel your focus into whatever lights you up."

    else:  # Luteal
        self_care = [
            "Wind down stimulation 1 hour before bed; progesterone can affect evening relaxation.",
            "Keep healthy complex carbohydrates on hand to prevent sudden afternoon energy dips.",
            "Set healthy personal boundaries to protect your emotional and mental reserves."
        ]
        hydration = "Warm peppermint tea or magnesium-infused warm water with a dash of lime."
        activity = "Pilates, restorative yin yoga, steady incline walks, or leisurely swimming."
        sleep = "A warm bath 90 minutes before bed promotes relaxation and deeper sleep."
        
        if is_indian:
            meals = [
                {
                    "name": "Roasted Sweet Potato Chaat with Mint Chutney",
                    "ingredients": ["Sweet potatoes", "Boiled chickpeas", "Cumin", "Fresh coriander mint dressing"],
                    "why_it_helps": "Steady complex carbs curb luteal cravings while keeping blood sugar remarkably even."
                },
                {
                    "name": "Methi Thepla with Warm Spiced Curd",
                    "ingredients": ["Fenugreek (methi) leaves", "Whole wheat flour", "Turmeric", "Light fresh yogurt"],
                    "why_it_helps": "Fenugreek supports hormonal balance and digestive lightness before your next period."
                }
            ]
        else:
            meals = [
                {
                    "name": "Baked Salmon or Tofu with Roasted Root Vegetables",
                    "ingredients": ["Wild salmon or firm tofu", "Carrots & beets", "Rosemary", "Extra virgin olive oil"],
                    "why_it_helps": "B6 and magnesium in root veggies foster natural serotonin synthesis to buffer mood changes."
                },
                {
                    "name": "Warm Berry & Chia Seed Quinoa Porridge",
                    "ingredients": ["Quinoa flakes or oats", "Chia seeds", "Cinnamon", "Warm stewed blackberries"],
                    "why_it_helps": "Chia seeds provide soluble fiber to prevent bloating and stabilize serotonin."
                }
            ]
        guidance = "It is completely natural to crave quiet and steady nourishment now. Give yourself permission to slow down."

    # Dynamic adjustment based on symptoms
    if has_cramps:
        self_care.insert(0, "Apply targeted heat to your lower back and abdomen to ease pelvic blood flow.")
    if has_bloating:
        hydration = "Sip warm fennel and ginger tea to naturally disperse trapped gas and ease bloating."
    if has_fatigue:
        activity = "Honor your tiredness with zero-guilt horizontal rest, legs-up-the-wall pose, or a cozy nap."

    return {
        "wellness_suggestions": {
            "self_care": self_care[:3],
            "hydration_reminder": hydration,
            "activity_suggestion": activity,
            "sleep_suggestion": sleep
        },
        "meal_suggestions": meals,
        "gentle_guidance": guidance
    }
