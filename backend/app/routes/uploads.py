from fastapi import APIRouter, UploadFile, File, HTTPException
import aiofiles
import uuid
import os
from pathlib import Path
from app.core.config import settings

router = APIRouter()

# Ensure storage directory exists
STORAGE_DIR = Path("storage")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = STORAGE_DIR / unique_filename

    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # In production, this would be a proper CDN or fully qualified domain URL
    # For hackathon purposes, returning the relative path assuming the frontend knows the base URL
    file_url = f"/storage/{unique_filename}"
    
    return {"imageUrl": file_url}
