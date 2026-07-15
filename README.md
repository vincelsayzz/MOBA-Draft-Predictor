Dota 2 Draft Predictor & Analytics Engine

Live Demo: 🔗 https://dota2-draft-predictor.vercel.app/

A full-stack, machine-learning-powered web application that predicts the likely winner of a Dota 2 match based on a 5v5 hero draft. Beyond simple win/loss prediction, it acts as a comprehensive drafting tool by integrating live professional meta data and analyzing team composition synergies.

✨ Key Features
Machine Learning Prediction: Utilizes a custom-trained Logistic Regression model (trained on historical Kaggle match data) to evaluate team drafts, factoring in specific game modes and player dedication proxies.

Real-Time Meta Tracking (Data Waterfall): Automatically fetches live hero statistics from the OpenDota API. Uses a cascading fallback algorithm (Pro matches → Global Public matches → Turbo) to ensure every hero has an accurate, up-to-date win rate badge.

Team Composition Analytics: Algorithmically grades both the Radiant and Dire drafts across 7 crucial metrics:

Initiation / Catch

Crowd Control (Disables)

Durability / Frontline

Mobility / Elusiveness

Push Potential

Late Game Scaling

Physical vs. Magical Damage Distribution

Interactive Hover Inspector: A responsive, cursor-tracking glassmorphism modal that displays hero roles, base stats (Armor, Speed, Damage, HP), and primary-attribute-based meta core items.

Immersive UI: A dark, authentic Dota 2 themed dashboard featuring glassmorphism panels, search filtering, and visual state management (e.g., graying out picked heroes).

🛠️ Architecture & Tech Stack
Frontend: React (Vite), Standard CSS (Glassmorphism UI), OpenDota API Integration. Designed for deployment on Vercel.

Backend: Python, FastAPI, Uvicorn. Designed for deployment on Render.

Machine Learning: Scikit-Learn (Logistic Regression), Pandas (Data Cleaning & One-Hot Encoding), Joblib (Model Serialization).

📂 Project Structure
Plaintext
Dota2-Draft-Predictor/
├── data/          Phase 1: Raw Kaggle dataset + data preparation & model training scripts
├── backend/       Phase 2: FastAPI server, loads the serialized .pkl ML models
└── frontend/      Phase 3: React (Vite) UI, fully integrated with backend & external APIs
🚀 Running It Locally
To run this project end-to-end on your local machine, you will need two terminal windows.

Terminal 1 — Backend

Bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
Backend runs at http://localhost:8000

Terminal 2 — Frontend

Bash
cd frontend
npm install
npm run dev
Frontend runs at http://localhost:5173

📡 API Contract
If you want to interact directly with the FastAPI backend, here is the expected schema.

POST /predict

Request Body:

JSON
{ 
  "radiant_heroes": [1, 2, 3, 4, 5], 
  "dire_heroes": [6, 7, 8, 9, 10],
  "game_mode": 22,
  "r_registered": 5,
  "d_registered": 5
}
(Note: game_mode uses official Dota API integers, e.g., 22 for Ranked All Pick. r_registered and d_registered accept integers 0-5 representing the number of public/registered profiles on the team).

Response:

JSON
{ 
  "winner": "Radiant", 
  "radiant_probability": 65.4 
}
