import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routes import cycle, checkin, preferences, ai

# Setup basic logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("cyclecare")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    logger.info("Initializing CycleCare SQLite database...")
    init_db()
    logger.info("CycleCare database initialized successfully.")
    yield

app = FastAPI(
    title="CycleCare API",
    description="Personal Menstrual Wellness Companion — Privacy-first, local AI-powered wellness insights",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(cycle.router)
app.include_router(checkin.router)
app.include_router(preferences.router)
app.include_router(ai.router)

@app.get("/")
def read_root():
    return {
        "app": "CycleCare — Personal Menstrual Wellness Companion",
        "status": "healthy",
        "disclaimer": "Wellness companion only. Not intended for medical diagnosis or treatment."
    }

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
