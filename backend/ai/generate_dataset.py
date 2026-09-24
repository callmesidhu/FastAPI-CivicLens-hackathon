import os
import pandas as pd
import numpy as np

def generate_dataset(num_samples=2000):
    np.random.seed(42)
    
    # Features
    reports_count = np.random.poisson(lam=3, size=num_samples)
    upvotes = np.random.poisson(lam=10, size=num_samples)
    downvotes = np.random.poisson(lam=2, size=num_samples)
    
    # hours_since_update (exponential distribution, most are recent, some are very old)
    hours_since_update = np.random.exponential(scale=48, size=num_samples)
    
    # condition rating (1 to 5)
    condition_rating = np.random.randint(1, 6, size=num_samples)
    
    # distance in meters (from 10 to 10000)
    distance_m = np.random.uniform(10, 10000, size=num_samples)
    
    # Target 1: is_verified (Confidence Model)
    # A facility is more likely to be real/verified if it has high upvotes, low downvotes, recent updates, high reports
    confidence_logit = (
        0.5 * reports_count +
        0.2 * upvotes -
        0.5 * downvotes -
        0.05 * hours_since_update +
        0.2 * condition_rating
    )
    # Sigmoid to get probability, then threshold
    prob = 1 / (1 + np.exp(-confidence_logit))
    is_verified = (prob > 0.5).astype(int)
    
    # Target 2: recommendation_score (Recommendation Model)
    # We want to recommend facilities that are close, in good condition, and highly verified
    # Let's say utility is max 100
    # distance penalty: closer is better
    dist_penalty = distance_m / 10000.0 * 30 # max 30 points penalty
    
    # condition bonus: better condition is better
    cond_bonus = condition_rating * 10 # max 50 points
    
    # confidence bonus
    conf_bonus = prob * 20 # max 20 points
    
    # add some random noise
    noise = np.random.normal(0, 5, size=num_samples)
    
    recommendation_score = 100 - dist_penalty + cond_bonus + conf_bonus - 50 + noise
    recommendation_score = np.clip(recommendation_score, 0, 100)
    
    df = pd.DataFrame({
        'reports_count': reports_count,
        'upvotes': upvotes,
        'downvotes': downvotes,
        'hours_since_update': hours_since_update,
        'condition_rating': condition_rating,
        'distance_m': distance_m,
        'is_verified': is_verified,
        'recommendation_score': recommendation_score
    })
    
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'facility_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Dataset generated with {num_samples} samples at {csv_path}")

if __name__ == '__main__':
    generate_dataset()
