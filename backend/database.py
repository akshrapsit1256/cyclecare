import sqlite3
import os
from pathlib import Path
from contextlib import contextmanager

# Default database location inside the backend directory
DB_PATH = Path(os.getenv("DATABASE_PATH", Path(__file__).parent / "cyclecare.db"))

def get_db_connection():
    """Returns a connection to the SQLite database with row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db():
    """Context manager for safe database transaction handling."""
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initializes the database schema if tables do not exist."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Cycle configuration (singleton record id=1)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cycle_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                last_period_date TEXT NOT NULL,
                average_cycle_length INTEGER NOT NULL DEFAULT 28,
                updated_at TEXT NOT NULL
            );
        """)

        # Daily symptom and wellness check-ins
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS checkins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                symptoms TEXT NOT NULL, -- JSON serialized list of strings
                mood TEXT,
                energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
                notes TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # User preferences and dietary restrictions (singleton record id=1)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS preferences (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                dietary_preference TEXT NOT NULL DEFAULT 'No preference',
                dietary_restrictions TEXT DEFAULT '',
                wellness_goals TEXT DEFAULT '',
                updated_at TEXT NOT NULL
            );
        """)

        # Cached or latest AI recommendations
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ai_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                cycle_phase TEXT NOT NULL,
                cycle_day INTEGER NOT NULL,
                recommendations_json TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'ollama',
                created_at TEXT NOT NULL
            );
        """)
