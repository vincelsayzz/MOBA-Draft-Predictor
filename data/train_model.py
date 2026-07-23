import json
import os
import pickle
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
import requests

# Setup Directories
DATA_DIR = Path(__file__).resolve().parent
DATASET_PATH = DATA_DIR / "dota_matches_advanced.csv"

# Backend model directory for Dota
MODEL_DIR = (DATA_DIR.parent / "backend" / "model").resolve()
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Backend root directory for LoL
BACKEND_DIR = DATA_DIR.parent / "backend"

# ==========================================================
# PART 1: TRAIN DOTA 2 MODEL
# ==========================================================
print("Loading advanced dataset...")
df = pd.read_csv(DATASET_PATH)

required_columns = {"radiant_win", "game_mode", "r_registered", "d_registered"}
missing_columns = required_columns - set(df.columns)
if missing_columns:
    raise ValueError(f"Missing required columns: {sorted(missing_columns)}")

RADIANT_COLUMNS = ["hero_1", "hero_2", "hero_3", "hero_4", "hero_5"]
DIRE_COLUMNS = ["hero_6", "hero_7", "hero_8", "hero_9", "hero_10"]
TARGET_COLUMN = "radiant_win"

all_hero_ids = sorted({int(hero_id) for hero_id in set(df[RADIANT_COLUMNS + DIRE_COLUMNS].values.flatten()) if pd.notna(hero_id)})
encoded_heroes = pd.DataFrame(0, index=df.index, columns=[f"hero_{h}" for h in all_hero_ids], dtype=int)

for hero_id in all_hero_ids:
    col_name = f"hero_{hero_id}"
    for radiant_col in RADIANT_COLUMNS:
        encoded_heroes.loc[df[radiant_col] == hero_id, col_name] = 1
    for dire_col in DIRE_COLUMNS:
        encoded_heroes.loc[df[dire_col] == hero_id, col_name] = -1

encoded_modes = pd.get_dummies(df["game_mode"], prefix="mode")
numerical_features = df[["r_registered", "d_registered"]].astype(float)

X = pd.concat([encoded_heroes, encoded_modes, numerical_features], axis=1)
y = df[TARGET_COLUMN].astype(int)
feature_columns = X.columns.tolist()

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

model = LogisticRegression(max_iter=2000)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
roc_auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])

print(f"\nDota 2 Model accuracy: {accuracy:.2%}")
print(f"Dota 2 ROC AUC: {roc_auc:.3f}")
print(classification_report(y_test, predictions, zero_division=0))

metrics = {
    "accuracy": float(accuracy),
    "roc_auc": float(roc_auc),
    "test_size": int(len(y_test)),
    "train_size": int(len(y_train)),
}

joblib.dump(model, MODEL_DIR / "dota_model.pkl")
joblib.dump(all_hero_ids, MODEL_DIR / "hero_ids.pkl")
joblib.dump(feature_columns, MODEL_DIR / "feature_columns.pkl")
with open(MODEL_DIR / "training_metrics.json", "w", encoding="utf-8") as fh:
    json.dump(metrics, fh, indent=2)

print(f"Saved Dota 2 model and required files to {MODEL_DIR}/\n")


# ==========================================================
# PART 2: LEAGUE OF LEGENDS DATA GENERATION & ML TRAINING
# ==========================================================
MAX_CHAMP_ID = 1000
NUM_MATCHES_LOL = 10000

print(f"Generating {NUM_MATCHES_LOL} simulated League of Legends match data...")

# Mocking popular champion IDs
mock_champ_pool = list(range(1, 160))
lol_matches = []

for _ in range(NUM_MATCHES_LOL):
    picks = np.random.choice(mock_champ_pool, 10, replace=False)
    blue_team, red_team = picks[:5], picks[5:]
    
    # Simulate a slight blue-side advantage
    win_prob = 0.52 + (sum(blue_team) - sum(red_team)) * 0.0001
    blue_win = 1 if np.random.rand() < win_prob else 0
    
    match = {f'blue_{i+1}': blue_team[i] for i in range(5)}
    match.update({f'red_{i+1}': red_team[i] for i in range(5)})
    match['blue_win'] = blue_win
    lol_matches.append(match)

df_lol = pd.DataFrame(lol_matches)

print("Encoding LoL drafts into feature arrays...")
X_lol = np.zeros((len(df_lol), MAX_CHAMP_ID))

for i, row in df_lol.iterrows():
    for j in range(1, 6):
        X_lol[i, row[f'blue_{j}']] = 1 
        X_lol[i, row[f'red_{j}']] = -1

y_lol = df_lol['blue_win']

print("Training LoL Logistic Regression model...")
model_lol = LogisticRegression(C=0.1, solver='liblinear')
model_lol.fit(X_lol, y_lol)

if BACKEND_DIR.exists():
    LOL_OUTPUT_PATH = BACKEND_DIR / "lol_draft_model.pkl"
else:
    LOL_OUTPUT_PATH = DATA_DIR / "lol_draft_model.pkl"

with open(LOL_OUTPUT_PATH, 'wb') as f:
    pickle.dump(model_lol, f)
    
print(f"League of Legends model successfully trained and saved to {LOL_OUTPUT_PATH}")