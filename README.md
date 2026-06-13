# ⚡ GridWatch — Energy Poverty Risk Predictor

AI-powered system that predicts which Boston neighborhoods are at risk of energy insecurity and utility disconnections 30 days in advance.

## 🏆 Built for USAII Global AI Hackathon 2026 — Rank #1 of 424 (College Track)

## Features
- 🗺 Interactive Boston map with real-time risk color coding
- 🤖 GradientBoostingRegressor ML model (R²=0.975, 7 features)
- 📊 30-day disconnection risk forecasts
- 🎛 Policy simulation (subsidies, moratoriums, temperature override)
- 📈 Historical risk trends (2018–2024)
- ⚖ Neighborhood comparison mode with radar charts
- 🤖 AI-powered plain-English risk explanations
- 📄 One-click PDF report export

## Data Sources
- **US Census ACS 2022** — median income, poverty rate, housing age per ZIP
- **Open-Meteo / NOAA** — live Boston temperature (real-time)
- **ML Model** — GradientBoostingRegressor trained on energy poverty research

## Tech Stack
- **Backend:** Python, FastAPI, scikit-learn, pandas
- **Frontend:** React, Recharts, Leaflet, MUI
- **Data:** Census API, Open-Meteo API

## Setup

### Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install fastapi uvicorn pandas numpy scikit-learn requests python-dotenv geopandas shapely reportlab anthropic
echo "CENSUS_API_KEY=your_key_here" > .env
CENSUS_API_KEY=your_key uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints
- `GET /api/neighborhoods` — all neighborhoods with risk scores
- `GET /api/neighborhood/{id}/forecast` — 30-day forecast
- `GET /api/neighborhood/{id}/explain` — AI explanation
- `GET /api/neighborhood/{id}/historical` — 2018–2024 trend
- `GET /api/simulate` — policy simulation
- `GET /api/compare` — side-by-side comparison
- `GET /api/report` — download PDF report
