import os
import joblib
import pandas as pd
from datetime import datetime, timezone
from dateutil import parser

# Global model variables
_conf_model = None
_rec_model = None
_models_loaded = False

def load_models():
    global _conf_model, _rec_model, _models_loaded
    if _models_loaded:
        return
        
    base_dir = os.path.dirname(os.path.abspath(__file__))
    conf_path = os.path.join(base_dir, 'confidence_model.pkl')
    rec_path = os.path.join(base_dir, 'recommendation_model.pkl')
    
    if os.path.exists(conf_path) and os.path.exists(rec_path):
        try:
            _conf_model = joblib.load(conf_path)
            _rec_model = joblib.load(rec_path)
            _models_loaded = True
            print("Successfully loaded ML models.")
        except Exception as e:
            print(f"Error loading ML models: {e}")
    else:
        print("ML models not found. Please run train_models.py")

def _calculate_hours_since_update(last_updated_str: str) -> float:
    try:
        updated_date = parser.parse(last_updated_str)
        now = datetime.now(timezone.utc)
        diff = now - updated_date
        return max(0, diff.total_seconds() / 3600)
    except:
        return 48.0 # fallback

def _map_condition_to_rating(condition: str) -> int:
    condition = (condition or "").lower()
    if condition == "good":
        return 5
    elif condition == "fair":
        return 3
    elif condition == "poor":
        return 1
    return 3 # default

def predict_confidence(facility: dict) -> dict:
    """
    Predicts confidence score and level.
    Requires: reports_count, upvotes, downvotes, lastUpdated, condition
    """
    if not _models_loaded or not _conf_model:
        return {"confidenceScore": 0, "confidenceLevel": "unknown"}
        
    # Extract features safely
    # If the database doesn't have these fields natively yet, use defaults for inference
    reports_count = facility.get("reportsCount", 1)
    upvotes = facility.get("upvotes", 0)
    downvotes = facility.get("downvotes", 0)
    hours = _calculate_hours_since_update(facility.get("lastUpdated", ""))
    cond = _map_condition_to_rating(facility.get("condition", ""))
    
    df = pd.DataFrame([{
        'reports_count': reports_count,
        'upvotes': upvotes,
        'downvotes': downvotes,
        'hours_since_update': hours,
        'condition_rating': cond
    }])
    
    try:
        # Get probability of class 1 (verified)
        prob = _conf_model.predict_proba(df)[0][1]
        score = int(prob * 100)
        
        if score >= 80:
            level = "high"
        elif score >= 50:
            level = "moderate"
        else:
            level = "low"
            
        return {
            "confidenceScore": score,
            "confidenceLevel": level,
            "confidenceProb": prob
        }
    except Exception as e:
        print(f"Error predicting confidence: {e}")
        return {"confidenceScore": 0, "confidenceLevel": "error"}

def predict_recommendation_score(distance_m: float, condition: str, prob: float) -> float:
    """
    Predicts recommendation utility score (0-100).
    Requires distance, condition, and confidence probability.
    """
    if not _models_loaded or not _rec_model:
        return 0.0
        
    cond = _map_condition_to_rating(condition)
    
    df = pd.DataFrame([{
        'distance_m': distance_m,
        'condition_rating': cond,
        'pred_conf_prob': prob
    }])
    
    try:
        score = _rec_model.predict(df)[0]
        return float(max(0.0, min(100.0, score)))
    except Exception as e:
        print(f"Error predicting recommendation: {e}")
        return 0.0
