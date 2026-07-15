import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib
import os

print("Loading advanced dataset...")
df = pd.read_csv("dota_matches_advanced.csv")

RADIANT_COLUMNS = ["hero_1", "hero_2", "hero_3", "hero_4", "hero_5"]
DIRE_COLUMNS = ["hero_6", "hero_7", "hero_8", "hero_9", "hero_10"]
TARGET_COLUMN = "radiant_win"

# --- 1. ENCODE HEROES (+1 / -1 / 0) ---
all_hero_ids = sorted(set(df[RADIANT_COLUMNS + DIRE_COLUMNS].values.flatten()))
encoded_heroes = pd.DataFrame(0, index=df.index, columns=[f"hero_{h}" for h in all_hero_ids])

for hero_id in all_hero_ids:
    col_name = f"hero_{hero_id}"
    for radiant_col in RADIANT_COLUMNS:
        encoded_heroes.loc[df[radiant_col] == hero_id, col_name] = 1
    for dire_col in DIRE_COLUMNS:
        encoded_heroes.loc[df[dire_col] == hero_id, col_name] = -1

# --- 2. ENCODE NEW FEATURES ---
# Convert game_mode into One-Hot Encoded columns (e.g., mode_22, mode_2)
encoded_modes = pd.get_dummies(df['game_mode'], prefix='mode')

# Isolate our new numerical features
numerical_features = df[['r_registered', 'd_registered']]

# Combine Heroes + Game Modes + Player Experience into one massive feature table (X)
X = pd.concat([encoded_heroes, encoded_modes, numerical_features], axis=1)
y = df[TARGET_COLUMN]

# Save the exact column names so the FastAPI backend knows how to build the input
feature_columns = X.columns.tolist()

# --- 3. TRAIN & EVALUATE ---
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

accuracy = accuracy_score(y_test, model.predict(X_test))
print(f"\nModel accuracy with new features: {accuracy:.2%}")

# --- 4. SAVE MODEL & CONFIG ---
MODEL_DIR = os.path.join("..", "backend", "model")
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(model, os.path.join(MODEL_DIR, "dota_model.pkl"))
joblib.dump(all_hero_ids, os.path.join(MODEL_DIR, "hero_ids.pkl"))
# We must save the column order so the backend matches the trained model exactly
joblib.dump(feature_columns, os.path.join(MODEL_DIR, "feature_columns.pkl"))

print(f"Saved model and required files to {MODEL_DIR}/")