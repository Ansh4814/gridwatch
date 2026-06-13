from data.census_fetcher import fetch_real_census_data
import os

# Base neighborhood geographic data
NEIGHBORHOODS_BASE = [
    {"id": 1, "name": "Roxbury", "lat": 42.3115, "lng": -71.0890, "zip": "02119"},
    {"id": 2, "name": "Dorchester", "lat": 42.3010, "lng": -71.0631, "zip": "02122"},
    {"id": 3, "name": "Mattapan", "lat": 42.2770, "lng": -71.0921, "zip": "02126"},
    {"id": 4, "name": "East Boston", "lat": 42.3706, "lng": -71.0389, "zip": "02128"},
    {"id": 5, "name": "Hyde Park", "lat": 42.2559, "lng": -71.1245, "zip": "02136"},
    {"id": 6, "name": "Jamaica Plain", "lat": 42.3100, "lng": -71.1133, "zip": "02130"},
    {"id": 7, "name": "South End", "lat": 42.3430, "lng": -71.0750, "zip": "02118"},
    {"id": 8, "name": "Back Bay", "lat": 42.3503, "lng": -71.0810, "zip": "02116"},
    {"id": 9, "name": "South Boston", "lat": 42.3355, "lng": -71.0476, "zip": "02127"},
    {"id": 10, "name": "Charlestown", "lat": 42.3782, "lng": -71.0602, "zip": "02129"},
    {"id": 11, "name": "Mission Hill", "lat": 42.3270, "lng": -71.1040, "zip": "02120"},
    {"id": 12, "name": "Fenway", "lat": 42.3467, "lng": -71.1001, "zip": "02215"},
    {"id": 13, "name": "Brighton", "lat": 42.3510, "lng": -71.1554, "zip": "02135"},
    {"id": 14, "name": "Allston", "lat": 42.3534, "lng": -71.1340, "zip": "02134"},
    {"id": 15, "name": "West Roxbury", "lat": 42.2798, "lng": -71.1604, "zip": "02132"},
]

# Fallback in case Census API is down
FALLBACK = {
    1: {"median_income": 37158, "poverty_rate": 0.309, "old_housing_pct": 0.61},
    2: {"median_income": 81025, "poverty_rate": 0.148, "old_housing_pct": 0.58},
    3: {"median_income": 66689, "poverty_rate": 0.187, "old_housing_pct": 0.55},
    4: {"median_income": 84023, "poverty_rate": 0.142, "old_housing_pct": 0.48},
    5: {"median_income": 91579, "poverty_rate": 0.110, "old_housing_pct": 0.42},
    6: {"median_income": 114933, "poverty_rate": 0.123, "old_housing_pct": 0.38},
    7: {"median_income": 74155, "poverty_rate": 0.262, "old_housing_pct": 0.35},
    8: {"median_income": 131648, "poverty_rate": 0.151, "old_housing_pct": 0.22},
    9: {"median_income": 145357, "poverty_rate": 0.105, "old_housing_pct": 0.30},
    10: {"median_income": 146815, "poverty_rate": 0.084, "old_housing_pct": 0.28},
    11: {"median_income": 51698, "poverty_rate": 0.388, "old_housing_pct": 0.52},
    12: {"median_income": 64138, "poverty_rate": 0.314, "old_housing_pct": 0.40},
    13: {"median_income": 87603, "poverty_rate": 0.192, "old_housing_pct": 0.37},
    14: {"median_income": 80027, "poverty_rate": 0.214, "old_housing_pct": 0.44},
    15: {"median_income": 132457, "poverty_rate": 0.041, "old_housing_pct": 0.33},
}

def get_neighborhoods():
    census_data = fetch_real_census_data()
    if not census_data:
        census_data = FALLBACK
    
    neighborhoods = []
    for n in NEIGHBORHOODS_BASE:
        extra = census_data.get(n["id"], FALLBACK.get(n["id"], {}))
        neighborhoods.append({**n, **extra})
    return neighborhoods

NEIGHBORHOODS = get_neighborhoods()
