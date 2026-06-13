import numpy as np

def compute_risk_score(neighborhood, temp_f, subsidy_boost=0.0, moratorium=False):
    income_score = max(0, min(1, 1 - (neighborhood["median_income"] - 20000) / 100000))
    poverty_score = neighborhood["poverty_rate"]
    housing_score = neighborhood["old_housing_pct"]

    if temp_f < 20:
        weather_score = 1.0
    elif temp_f < 32:
        weather_score = 0.8
    elif temp_f < 45:
        weather_score = 0.5
    elif temp_f > 95:
        weather_score = 0.9
    elif temp_f > 90:
        weather_score = 0.7
    elif temp_f > 85:
        weather_score = 0.5
    else:
        weather_score = 0.1

    raw_score = (income_score * 0.35 + poverty_score * 0.30 + housing_score * 0.20 + weather_score * 0.15) * 100

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

    return {
        "risk_score": round(final_score, 1),
        "risk_level": level,
        "color": color,
        "breakdown": {
            "income_factor": round(income_score * 35, 1),
            "poverty_factor": round(poverty_score * 30, 1),
            "housing_factor": round(housing_score * 20, 1),
            "weather_factor": round(weather_score * 15, 1),
        }
    }

def generate_30day_forecast(neighborhood, base_temp, subsidy_boost=0.0, moratorium=False):
    forecast = []
    for day in range(1, 31):
        temp_variation = np.random.normal(0, 4)
        projected_temp = base_temp + temp_variation + (day * 0.2)
        risk = compute_risk_score(neighborhood, projected_temp, subsidy_boost=subsidy_boost, moratorium=moratorium)
        forecast.append({
            "day": day,
            "projected_temp": round(projected_temp, 1),
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],
        })
    return forecast
