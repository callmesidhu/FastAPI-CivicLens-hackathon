import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import joblib

def train_and_save_models():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, 'facility_data.csv')
    
    if not os.path.exists(csv_path):
        print("Dataset not found. Run generate_dataset.py first.")
        return
        
    df = pd.read_csv(csv_path)
    
    # 1. Train Confidence Model (Classifier)
    # Features: reports_count, upvotes, downvotes, hours_since_update, condition_rating
    X_conf = df[['reports_count', 'upvotes', 'downvotes', 'hours_since_update', 'condition_rating']]
    y_conf = df['is_verified']
    
    X_train, X_test, y_train, y_test = train_test_split(X_conf, y_conf, test_size=0.2, random_state=42)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Confidence Model Accuracy: {acc:.4f}")
    
    conf_model_path = os.path.join(base_dir, 'confidence_model.pkl')
    joblib.dump(clf, conf_model_path)
    print(f"Saved confidence model to {conf_model_path}")
    
    # 2. Train Recommendation Model (Regressor)
    # Features: distance_m, condition_rating, predicted_confidence_prob
    # We will use the true probability from the logic for training, or we can use the model's predictions.
    # To keep it simple and robust, we use the model's predict_proba to simulate real world pipeline.
    df['pred_conf_prob'] = clf.predict_proba(X_conf)[:, 1]
    
    X_rec = df[['distance_m', 'condition_rating', 'pred_conf_prob']]
    y_rec = df['recommendation_score']
    
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_rec, y_rec, test_size=0.2, random_state=42)
    
    reg = RandomForestRegressor(n_estimators=100, random_state=42)
    reg.fit(X_train_r, y_train_r)
    
    import numpy as np
    y_pred_r = reg.predict(X_test_r)
    rmse = np.sqrt(mean_squared_error(y_test_r, y_pred_r))
    print(f"Recommendation Model RMSE: {rmse:.4f}")
    
    rec_model_path = os.path.join(base_dir, 'recommendation_model.pkl')
    joblib.dump(reg, rec_model_path)
    print(f"Saved recommendation model to {rec_model_path}")

if __name__ == '__main__':
    train_and_save_models()
