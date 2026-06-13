import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

def generate_training_data():
    np.random.seed(42)
    n_samples = 2000
    median_income = np.random.uniform(20000, 160000, n_samples)
    poverty_rate = np.random.uniform(0.02, 0.45, n_samples)
    old_housing_pct = np.random.uniform(0.1, 0.9, n_samples)
    temp_f = np.random.uniform(5, 105, n_samples)
    is_winter = (temp_f < 35).astype(float)
    is_extreme_heat = (temp_f > 90).astype(float)
    is_extreme_cold = (temp_f < 20).astype(float)
    income_risk = np.clip(1 - (median_income - 20000) / 140000, 0, 1) * 35
    poverty_risk = poverty_rate * 30
    housing_risk = old_housing_pct * 20
    weather_risk = (is_winter * 8 + is_extreme_heat * 6 + is_extreme_cold * 15)
    interaction = poverty_rate * is_winter * 10 + (median_income < 40000) * is_extreme_cold * 8
    noise = np.random.normal(0, 3, n_samples)
    risk = np.clip(income_risk + poverty_risk + housing_risk + weather_risk + interaction + noise, 0, 100)
    X = np.column_stack([median_income, poverty_rate, old_housing_pct, temp_f, is_winter, is_extreme_heat, is_extreme_cold])
    return X, risk

def train_model():
    print("Training GradientBoosting risk model...")
    X, y = generate_training_data()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.05, max_depth=4, min_samples_split=10, random_state=42)
    model.fit(X_scaled, y)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    features = ["median_income", "poverty_rate", "old_housing_pct", "temp_f", "is_winter", "is_extreme_heat", "is_extreme_cold"]
    importances = model.feature_importances_
    print("Feature importances:")
    for f, i in sorted(zip(features, importances), key=lambda x: -x[1]):
        print(f"  {f}: {i:.3f}")
    print(f"Model trained. R2 on training data: {model.score(X_scaled, y):.3f}")
    return model, scaler

def load_or_train():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        return model, scaler
    return train_model()

def compute_weather_factor(temp_f):
    """Compute weather risk factor honestly based on actual temperature."""
    if temp_f < 20:
        return round(1.0 * 15, 1)   # 15.0
    elif temp_f < 32:
        return round(0.8 * 15, 1)   # 12.0
    elif temp_f < 45:
        return round(0.5 * 15, 1)   # 7.5
    elif temp_f > 100:
        return round(0.9 * 15, 1)   # 13.5
    elif temp_f > 90:
        return round(0.7 * 15, 1)   # 10.5
    elif temp_f > 85:
        return round(0.5 * 15, 1)   # 7.5
    else:
        return round(0.1 * 15, 1)   # 1.5

def ml_predict(neighborhood, temp_f, subsidy_boost=0.0, moratorium=False):
    model, scaler = load_or_train()
    is_winter = 1.0 if temp_f < 35 else 0.0
    is_extreme_heat = 1.0 if temp_f > 90 else 0.0
    is_extreme_cold = 1.0 if temp_f < 20 else 0.0
    X = np.array([[
        neighborhood["median_income"],
        neighborhood["poverty_rate"],
        neighborhood["old_housing_pct"],
        temp_f, is_winter, is_extreme_heat, is_extreme_cold
    ]])
    X_scaled = scaler.transform(X)
    raw_score = float(model.predict(X_scaled)[0])
    if moratorium:
        raw_score *= 0.65
    raw_score -= subsidy_boost * 15
    final_score = max(0, min(100, raw_score))
    if final_score >= 70:
        level, color = "Critical", "#d32f2f"
    elif final_score >= 50:
        level, color = "High", "#f57c00"
    elif final_score >= 30:
        level, color = "Moderate", "#fbc02d"
    else:
        level, color = "Low", "#388e3c"

    income_score = max(0, min(1, 1 - (neighborhood["median_income"] - 20000) / 140000))
    poverty_score = neighborhood["poverty_rate"]
    housing_score = neighborhood["old_housing_pct"]
    weather_factor = compute_weather_factor(temp_f)

    return {
        "risk_score": round(final_score, 1),
        "risk_level": level,
        "color": color,
        "model": "GradientBoostingRegressor",
        "breakdown": {
            "income_factor": round(income_score * 35, 1),
            "poverty_factor": round(poverty_score * 30, 1),
            "housing_factor": round(housing_score * 20, 1),
            "weather_factor": weather_factor,
        }
    }

def ml_forecast(neighborhood, base_temp, subsidy_boost=0.0, moratorium=False):
    forecast = []
    for day in range(1, 31):
        temp_variation = np.random.normal(0, 4)
        projected_temp = base_temp + temp_variation + (day * 0.2)
        risk = ml_predict(neighborhood, projected_temp, subsidy_boost, moratorium)
        forecast.append({
            "day": day,
            "projected_temp": round(projected_temp, 1),
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],
        })
    return forecast

if __name__ == "__main__":
    train_model()
