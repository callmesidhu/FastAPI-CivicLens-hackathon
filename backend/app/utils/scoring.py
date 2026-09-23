from datetime import datetime, timezone
from dateutil import parser

def calculate_freshness_and_confidence(last_updated_str: str) -> dict:
    try:
        updated_date = parser.parse(last_updated_str)
        now = datetime.now(timezone.utc)
        diff = now - updated_date
        hours = diff.total_seconds() / 3600
        
        score = 100
        if hours <= 1:
            score = 95
        elif hours <= 24:
            score = 85
        elif hours <= 72:
            score = 65
        else:
            score = max(0, 50 - (hours / 24))

        if score >= 80:
            level = "high"
        elif score >= 50:
            level = "moderate"
        else:
            level = "low"
            
        return {
            "confidenceScore": int(score),
            "confidenceLevel": level
        }
    except Exception:
        return {
            "confidenceScore": 0,
            "confidenceLevel": "low"
        }
