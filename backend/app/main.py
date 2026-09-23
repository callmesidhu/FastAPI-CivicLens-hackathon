from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection
from app.routes import facilities, reports, tickets, uploads, auth, location, ratings
from contextlib import asynccontextmanager
import os
import sys

# Add backend directory to sys.path if not present (to allow importing ai module easily)
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from ai.inference import load_models
except ImportError:
    pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage dir exists
    os.makedirs("storage", exist_ok=True)
    try:
        load_models()
    except NameError:
        pass
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/storage", StaticFiles(directory="storage"), name="storage")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(facilities.router, prefix="/api/facilities", tags=["facilities"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["tickets"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(location.router, prefix="/api/location", tags=["location"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["ratings"])
@app.get("/")
async def root():
    return {"message": "Welcome to CivicLens API"}
