# Backend

FastAPI server that wraps your trained model behind a `/predict` endpoint.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Adding your trained model

Once you finish training (Phase 1 of your roadmap), save your model as:

```
backend/model/dota_model.pkl
```

`main.py` already looks for it at that path — nothing else needs to change.
If the file isn't there yet, the server still starts fine, it just returns
a clear error from `/predict` instead of crashing.

## Run

```bash
uvicorn main:app --reload
```

Visit `http://localhost:8000/docs` for the interactive API docs (great for
testing `/predict` with fake hero IDs before your frontend is even involved).

## API contract

**POST** `/predict`

```json
{ "radiant_heroes": [1, 2, 3, 4, 5], "dire_heroes": [6, 7, 8, 9, 10] }
```

Returns:

```json
{ "winner": "Radiant", "radiant_probability": 65.4 }
```
