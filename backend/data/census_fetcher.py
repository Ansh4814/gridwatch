import requests
import os

CENSUS_KEY = os.getenv("CENSUS_API_KEY", "")

ZIP_TO_NEIGHBORHOOD = {
    "02119": 1, "02122": 2, "02126": 3, "02128": 4, "02136": 5,
    "02130": 6, "02118": 7, "02116": 8, "02127": 9, "02129": 10,
    "02120": 11, "02215": 12, "02135": 13, "02134": 14, "02132": 15,
}

def fetch_real_census_data():
    zips = list(ZIP_TO_NEIGHBORHOOD.keys())
    zip_str = ",".join(zips)
    url = "https://api.census.gov/data/2022/acs/acs5"
    params = {
        "get": "B19013_001E,B17001_002E,B17001_001E,B25035_001E",
        "for": f"zip code tabulation area:{zip_str}",
        "key": CENSUS_KEY,
    }
    try:
        r = requests.get(url, params=params, timeout=10)
        data = r.json()
        headers = data[0]
        rows = data[1:]
        results = {}
        for row in rows:
            record = dict(zip(headers, row))
            zip_code = record["zip code tabulation area"]
            median_income = int(record["B19013_001E"]) if record["B19013_001E"] and int(record["B19013_001E"]) > 0 else 40000
            poverty_total = int(record["B17001_001E"]) if record["B17001_001E"] else 1
            poverty_count = int(record["B17001_002E"]) if record["B17001_002E"] else 0
            poverty_rate = round(poverty_count / poverty_total, 3) if poverty_total > 0 else 0.15
            median_year_built = int(record["B25035_001E"]) if record["B25035_001E"] and int(record["B25035_001E"]) > 0 else 1970
            old_housing_pct = round(max(0, min(1, (2024 - median_year_built) / 100)), 3)
            if zip_code in ZIP_TO_NEIGHBORHOOD:
                nid = ZIP_TO_NEIGHBORHOOD[zip_code]
                results[nid] = {
                    "median_income": median_income,
                    "poverty_rate": poverty_rate,
                    "old_housing_pct": old_housing_pct,
                    "data_source": "US Census ACS 2022",
                }
        print(f"Fetched real Census data for {len(results)} neighborhoods")
        return results
    except Exception as e:
        print(f"Census API error: {e}")
        return {}

if __name__ == "__main__":
    data = fetch_real_census_data()
    for nid, vals in data.items():
        print(f"Neighborhood {nid}: income=${vals['median_income']:,}, poverty={vals['poverty_rate']*100:.1f}%")
