# Backend

This backend powers the MOBA draft predictor by serving prediction requests through a FastAPI API. It supports draft analysis for the website and can be connected to refreshed game-data sources for Dota 2, Honor of Kings, and League of Legends.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Running the backend

```bash
uvicorn main:app --reload
```

Open the docs at:

```text
http://localhost:8000/docs
```

## Prediction endpoint

**POST** `/predict`

```json
{
  "radiant_heroes": [1, 2, 3, 4, 5],
  "dire_heroes": [6, 7, 8, 9, 10],
  "game_mode": 22,
  "r_registered": 5,
  "d_registered": 5
}
```

Returns:

```json
{
  "winner": "Radiant",
  "radiant_probability": 65.4
}
```

## Notes

- The backend expects trained model files in the model folder when prediction is enabled.
- If the model files are missing, the server can still start, but prediction requests will return an error message.
- Live game data can be refreshed by updating the backend data integration or retraining the model with newer datasets.
