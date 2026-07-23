Dota 2 Draft Predictor & Analytics Engine

Live Demo: 🔗 [Insert your Vercel Link Here](https://moba-draft-predictor.vercel.app/)

Backend API: 🔗 [Insert your Render Link Here](https://moba-draft-predictor.onrender.com)

A full-stack, machine-learning-powered web application that predicts the likely winner of a Dota 2 match based on a 5v5 hero draft. Beyond simple win/loss prediction, it acts as a comprehensive drafting tool by integrating live professional meta data and analyzing team composition synergies.

✨ Key Features
Machine Learning Prediction: Utilizes a custom-trained Logistic Regression model (trained on historical Kaggle match data) to evaluate team drafts, factoring in specific game modes and player dedication proxies.

Real-Time Meta Tracking (Data Waterfall): Automatically fetches live hero statistics from the OpenDota API. Uses a cascading fallback algorithm (Pro matches → Global Public matches → Turbo) to ensure every hero has an accurate, up-to-date win rate badge.

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
JSON
{ 
  "winner": "Radiant", 
  "radiant_probability": 65.4 
}.
