from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Any
import json

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicLens API"
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "civiclens"
    CORS_ORIGINS: Any = ["http://localhost:3000"]

    def get_cors_origins(self) -> List[str]:
        val = self.CORS_ORIGINS
        if isinstance(val, list):
            return val
        if isinstance(val, str):
            val = val.strip()
            if val.startswith("[") and val.endswith("]"):
                try:
                    return json.loads(val)
                except Exception:
                    pass
            return [origin.strip() for origin in val.split(",") if origin.strip()]
        return ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
