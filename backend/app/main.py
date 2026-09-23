from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection
from app.routes import facilities, reports, tickets, uploads
from contextlib import asynccontextmanager
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure storage dir exists
    os.makedirs("storage", exist_ok=True)
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

app.include_router(facilities.router, prefix="/api/v1/facilities", tags=["facilities"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(tickets.router, prefix="/api/v1/tickets", tags=["tickets"])
app.include_router(uploads.router, prefix="/api/v1/uploads", tags=["uploads"])

@app.get("/")
async def root():
    return {"message": "Welcome to CivicLens API"}
