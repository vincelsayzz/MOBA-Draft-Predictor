from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. UPDATED DATA MODEL ---
# The frontend will now send the heroes PLUS our new contextual features.
class DraftRequest(BaseModel):
    radiant_heroes: list[int]
    dire_heroes: list[int]
    game_mode: int
    r_registered: int
    d_registered: int

# --- 2. LOAD TRAINED FILES ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "dota_model.pkl")
HERO_IDS_PATH = os.path.join(BASE_DIR, "model", "hero_ids.pkl")
COLUMNS_PATH = os.path.join(BASE_DIR, "model", "feature_columns.pkl") # NEW

try:
    model = joblib.load(MODEL_PATH)
    all_hero_ids = joblib.load(HERO_IDS_PATH)
    feature_columns = joblib.load(COLUMNS_PATH) # Load the exact column order
    print(f"Loaded model, {len(all_hero_ids)} heroes, and {len(feature_columns)} features successfully!")
except Exception as e:
    print(f"Warning: Could not load model files. Error: {e}")
    model = None
    all_hero_ids = []
    feature_columns = []

# --- 3. UPDATED DATA PREPARATION ---
def build_feature_vector(radiant_list, dire_list, game_mode, r_reg, d_reg):
    # Create a dictionary with all required columns set to 0 initially
    vector_dict = {col: 0 for col in feature_columns}
    
    # Apply Hero Picks (+1 for Radiant, -1 for Dire)
    for h in radiant_list:
        col = f"hero_{h}"
        if col in vector_dict:
            vector_dict[col] = 1
            
    for h in dire_list:
        col = f"col_name_{h}" # Fallback in case of typos, but usually hero_id
        col = f"hero_{h}"
        if col in vector_dict:
            vector_dict[col] = -1

    # Apply Game Mode (One-Hot Encoding format)
    mode_col = f"mode_{game_mode}"
    if mode_col in vector_dict:
        vector_dict[mode_col] = 1
        
    # Apply Player Dedication (Registered accounts)
    if "r_registered" in vector_dict:
        vector_dict["r_registered"] = r_reg
    if "d_registered" in vector_dict:
        vector_dict["d_registered"] = d_reg
            
    # Convert into a 1-row Pandas DataFrame ensuring column order exactly matches training
    return pd.DataFrame([vector_dict], columns=feature_columns)

# --- 4. PREDICTION ENDPOINT ---
@app.post("/predict")
async def predict_draft(draft: DraftRequest):
    if model is None or not feature_columns:
        return {"error": "Model files missing. Run train_model.py first!"}

    if len(draft.radiant_heroes) != 5 or len(draft.dire_heroes) != 5:
        return {"error": "Draft must contain exactly 5 heroes per team."}

    # Pass the new features into our builder
    X_input = build_feature_vector(
        draft.radiant_heroes, 
        draft.dire_heroes, 
        draft.game_mode, 
        draft.r_registered, 
        draft.d_registered
    )

    probabilities = model.predict_proba(X_input)[0]
    radiant_win_prob = probabilities[1] * 100
    
    winner = "Radiant" if radiant_win_prob >= 50.0 else "Dire"

    return {
        "winner": winner,
        "radiant_probability": radiant_win_prob
    }