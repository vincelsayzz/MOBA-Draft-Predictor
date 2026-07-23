# MOBA Draft Predictor

Live Demo: [Open the live demo](https://your-live-demo-url.com)

Backend API: [Open the API](https://your-backend-url.com)

## Purpose of this website

This website is a multi-game MOBA draft analysis and prediction platform designed to help players explore team compositions, compare hero or champion choices, and estimate winning chances before a match begins. Instead of only showing static hero lists, it gives users a more interactive drafting experience for three different games:

- Dota 2
- Honor of Kings
- League of Legends

The goal is to make drafting easier, faster, and more strategic by combining prediction models, live hero/champion information, and simple team-building tools.

## What this website can do

- Predict the likely winner of a drafted matchup using a trained machine-learning model
- Let users build two teams by selecting heroes or champions from a searchable pool
- Show role-based information and team composition insights
- Support draft planning for multiple MOBA games in one project
- Display up-to-date game data from public APIs whenever the backend is refreshed or reloaded

## Data sources used for predictions

The app pulls data from public APIs and uses that information to support prediction and draft analysis:

- Dota 2: OpenDota API
  - Used to fetch live hero data, statistics, and meta information for Dota 2.
- Honor of Kings: Tencent hero data API
  - Used to fetch hero roster and role information from the official public hero data source.
- League of Legends: Riot Games API
  - Intended for champion metadata and refreshed champion information. If you connect a Riot API key, the app can use live champion data for League of Legends as well.

## Updated data and information

One of the main goals of this project is to keep the draft experience current. The app is built around live or refreshable data sources so that hero, champion, and role information can be updated over time. Whenever new data is available, you can refresh the backend data source or retrain the prediction model to keep the predictions aligned with the latest game meta.

## How to run it locally from GitHub

### Option 1: Clone the repository

```bash
git clone https://github.com/your-username/MOBA-Draft-Predictor.git
cd MOBA-Draft-Predictor
```

### Option 2: Download from GitHub

1. Go to the GitHub repository page
2. Click Code
3. Choose Download ZIP
4. Extract the ZIP file to a folder on your computer
5. Open that folder in your terminal

### Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn main:app --reload
```

The backend will be available at:

```text
http://localhost:8000
```

### Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## Project structure

```text
MOBA-Draft-Predictor/
├── backend/      FastAPI backend with prediction endpoints and data handling
├── data/         Training data and model preparation scripts
└── frontend/     React + Vite web app for the draft interface
```

## API endpoint example

The backend exposes a prediction endpoint for the draft model:

```http
POST /predict
```

Example request:

```json
{
  "radiant_heroes": [1, 2, 3, 4, 5],
  "dire_heroes": [6, 7, 8, 9, 10],
  "game_mode": 22,
  "r_registered": 5,
  "d_registered": 5
}
```

Example response:

```json
{
  "winner": "Radiant",
  "radiant_probability": 65.4
}
```

## Summary

This project brings together MOBA draft prediction, role-based team analysis, and live game data in one app. It is designed to help players make smarter drafting decisions while also serving as a flexible foundation for future upgrades and additional game support.