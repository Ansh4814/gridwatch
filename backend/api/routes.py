from fastapi import APIRouter
from fastapi.responses import Response
import requests
import numpy as np
from data.boston_neighborhoods import NEIGHBORHOODS
from models.ml_model import ml_predict, ml_forecast
from api.explain import generate_explanation
from api.report import generate_report

router = APIRouter()

def get_boston_temp():
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {"latitude": 42.3601, "longitude": -71.0589, "current": "temperature_2m", "temperature_unit": "fahrenheit", "forecast_days": 1}
        r = requests.get(url, params=params, timeout=5)
        return r.json()["current"]["temperature_2m"]
    except:
        return 55.0

@router.get("/neighborhoods")
def get_neighborhoods():
    temp = get_boston_temp()
    results = []
    for n in NEIGHBORHOODS:
        risk = ml_predict(n, temp)
        results.append({**n, **risk, "current_temp_f": round(temp, 1)})
    return {"neighborhoods": results, "current_temp_f": round(temp, 1)}

@router.get("/neighborhood/{neighborhood_id}/forecast")
def get_forecast(neighborhood_id: int, subsidy: float = 0.0, moratorium: bool = False, temp_override: float = None):
    n = next((x for x in NEIGHBORHOODS if x["id"] == neighborhood_id), None)
    if not n:
        return {"error": "Not found"}
    temp = temp_override if temp_override else get_boston_temp()
    return {"neighborhood": n["name"], "forecast": ml_forecast(n, temp, subsidy, moratorium)}

@router.get("/neighborhood/{neighborhood_id}/explain")
def explain_neighborhood(neighborhood_id: int, subsidy: float = 0.0, moratorium: bool = False, temp_override: float = None):
    n = next((x for x in NEIGHBORHOODS if x["id"] == neighborhood_id), None)
    if not n:
        return {"error": "Not found"}
    temp = temp_override if temp_override else get_boston_temp()
    risk = ml_predict(n, temp, subsidy, moratorium)
    explanation = generate_explanation(n, risk, temp, subsidy, moratorium)
    return {"neighborhood": n["name"], "explanation": explanation, "risk_score": risk["risk_score"]}

@router.get("/neighborhood/{neighborhood_id}/historical")
def get_historical(neighborhood_id: int):
    n = next((x for x in NEIGHBORHOODS if x["id"] == neighborhood_id), None)
    if not n:
        return {"error": "Not found"}
    np.random.seed(neighborhood_id * 7)
    historical = []
    for year in range(2018, 2025):
        income = int(n["median_income"] * (0.82 + (year - 2018) * 0.03))
        temp_avg = 52 + np.random.normal(0, 2)
        n_hist = {**n, "median_income": income}
        risk = ml_predict(n_hist, temp_avg)
        historical.append({
            "year": year,
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"],
            "median_income": income,
        })
    return {"neighborhood": n["name"], "historical": historical}

@router.get("/compare")
def compare_neighborhoods(id1: int, id2: int, temp_override: float = None):
    temp = temp_override if temp_override else get_boston_temp()
    n1 = next((x for x in NEIGHBORHOODS if x["id"] == id1), None)
    n2 = next((x for x in NEIGHBORHOODS if x["id"] == id2), None)
    if not n1 or not n2:
        return {"error": "Not found"}
    risk1 = ml_predict(n1, temp)
    risk2 = ml_predict(n2, temp)
    exp1 = generate_explanation(n1, risk1, temp)
    exp2 = generate_explanation(n2, risk2, temp)
    return {
        "neighborhood1": {**n1, **risk1, "explanation": exp1},
        "neighborhood2": {**n2, **risk2, "explanation": exp2},
        "temp_f": round(temp, 1)
    }

@router.get("/simulate")
def simulate_policy(subsidy: float = 0.0, moratorium: bool = False, temp_override: float = None):
    temp = temp_override if temp_override else get_boston_temp()
    results = []
    for n in NEIGHBORHOODS:
        risk = ml_predict(n, temp, subsidy_boost=subsidy, moratorium=moratorium)
        results.append({**n, **risk, "current_temp_f": round(temp, 1)})
    return {"neighborhoods": results, "temp_f": round(temp, 1), "subsidy": subsidy, "moratorium": moratorium}

@router.get("/report")
def download_report(subsidy: float = 0.0, moratorium: bool = False, temp_override: float = None):
    temp = temp_override if temp_override else get_boston_temp()
    neighborhoods = []
    for n in NEIGHBORHOODS:
        risk = ml_predict(n, temp, subsidy_boost=subsidy, moratorium=moratorium)
        neighborhoods.append({**n, **risk})
    pdf = generate_report(neighborhoods, temp, subsidy, moratorium)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=gridwatch_report.pdf"}
    )


@router.get("/report/compare")
def download_compare_report(id1: int, id2: int, temp_override: float = None):
    temp = temp_override if temp_override else get_boston_temp()
    n1 = next((x for x in NEIGHBORHOODS if x["id"] == id1), None)
    n2 = next((x for x in NEIGHBORHOODS if x["id"] == id2), None)
    if not n1 or not n2:
        return {"error": "Not found"}
    risk1 = ml_predict(n1, temp)
    risk2 = ml_predict(n2, temp)
    exp1 = generate_explanation(n1, risk1, temp)
    exp2 = generate_explanation(n2, risk2, temp)
    neighborhoods = [
        {**n1, **risk1, "explanation": exp1},
        {**n2, **risk2, "explanation": exp2},
    ]
    pdf = generate_report(neighborhoods, temp, 0, False)
    name1 = n1["name"].replace(" ", "_")
    name2 = n2["name"].replace(" ", "_")
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=gridwatch_{name1}_vs_{name2}.pdf"}
    )


@router.get("/report/single/{neighborhood_id}")
def download_single_report(neighborhood_id: int, subsidy: float = 0.0, moratorium: bool = False, temp_override: float = None):
    n = next((x for x in NEIGHBORHOODS if x["id"] == neighborhood_id), None)
    if not n:
        return {"error": "Not found"}
    temp = temp_override if temp_override else get_boston_temp()
    risk = ml_predict(n, temp, subsidy_boost=subsidy, moratorium=moratorium)
    exp = generate_explanation(n, risk, temp, subsidy, moratorium)
    neighborhoods = [{**n, **risk, "explanation": exp}]
    pdf = generate_report(neighborhoods, temp, subsidy, moratorium)
    name = n["name"].replace(" ", "_")
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=gridwatch_{name}.pdf"}
    )


@router.get("/report/custom")
def download_custom_report(ids: str = "", subsidy: float = 0.0, moratorium: bool = False, temp_override: float = None):
    temp = temp_override if temp_override else get_boston_temp()
    id_list = [int(x) for x in ids.split(",") if x.strip().isdigit()]
    selected = [n for n in NEIGHBORHOODS if n["id"] in id_list]
    if not selected:
        return {"error": "No neighborhoods selected"}
    neighborhoods = []
    for n in selected:
        risk = ml_predict(n, temp, subsidy_boost=subsidy, moratorium=moratorium)
        neighborhoods.append({**n, **risk})
    pdf = generate_report(neighborhoods, temp, subsidy, moratorium)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=gridwatch_custom_report.pdf"}
    )

@router.get("/health")
def health():
    return {"status": "ok", "service": "GridWatch API", "model": "GradientBoostingRegressor"}
