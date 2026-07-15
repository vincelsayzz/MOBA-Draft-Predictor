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

Markdown
# 🎮 Dota2 Draft Predictor

An end-to-end machine learning application designed to predict the winner of Dota 2 matches based on team compositions. This project integrates a FastAPI backend with a React (Vite) frontend to provide real-time draft analysis.

---

## 📂 Project Structure

Dota2-Draft-Predictor/
├── data/           # Phase 1: Raw Kaggle dataset + data preparation & model training scripts
├── backend/        # Phase 2: FastAPI server, loads the serialized .pkl ML models
└── frontend/       # Phase 3: React (Vite) UI, fully integrated with backend & external APIs
🛠 Prerequisites
Ensure you have the following installed on your machine:

Python 3.10+ (for the backend)

Node.js 18+ (for the frontend)

pip and npm (or yarn/pnpm)

🚀 Running It Locally
To run this project end-to-end, you will need two terminal windows open simultaneously.

Terminal 1: Backend
The backend serves the ML model predictions via FastAPI.

Bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
Access: http://localhost:8000

Docs: View auto-generated Swagger UI at http://localhost:8000/docs

Terminal 2: Frontend
The frontend provides the user interface for inputting hero drafts.

Bash
cd frontend
npm install
npm run dev
Access: http://localhost:5173

📡 API Contract
The backend exposes a prediction endpoint to process draft data.

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
Configuration Notes:

game_mode: Use official Dota 2 API integers (e.g., 22 for Ranked All Pick).

r_registered/d_registered: Integer 0-5 representing the number of public/registered profiles on the team.

Response:

JSON
{ 
  "winner": "Radiant", 
  "radiant_probability": 65.4 
}
⚙️ Development Notes
Data Models: Ensure your serialized .pkl model files are located in the backend/models/ directory before running the server.

Environment Variables: If you change the backend port, ensure you update the VITE_API_URL in the frontend environment configuration.

Dependencies: Regularly update your dependencies using pip freeze > requirements.txt or npm outdated to ensure compatibility.

This project is built for educational purposes and performance analysis.
