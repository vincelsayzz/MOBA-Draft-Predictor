import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent
MATCH_PATH = DATA_DIR / "match.csv"
PLAYERS_PATH = DATA_DIR / "players.csv"
OUTPUT_PATH = DATA_DIR / "dota_matches_advanced.csv"

print("Loading Kaggle CSVs...")
required_match_columns = {"match_id", "radiant_win", "game_mode"}
required_player_columns = {"match_id", "hero_id", "player_slot", "account_id"}

matches = pd.read_csv(MATCH_PATH, usecols=["match_id", "radiant_win", "game_mode"])
players = pd.read_csv(PLAYERS_PATH, usecols=["match_id", "hero_id", "player_slot", "account_id"])

missing_match = required_match_columns - set(matches.columns)
missing_players = required_player_columns - set(players.columns)
if missing_match:
    raise ValueError(f"Missing match columns: {sorted(missing_match)}")
if missing_players:
    raise ValueError(f"Missing player columns: {sorted(missing_players)}")

players = players.copy()
players["team"] = players["player_slot"].apply(lambda slot: "radiant" if slot < 128 else "dire")
players["account_id"] = players["account_id"].fillna(0).astype(int)
players["is_registered"] = (players["account_id"] != 0).astype(int)

print("Processing team data...")
radiant_data = players[players["team"] == "radiant"].groupby("match_id").agg(
    r_heroes=("hero_id", list),
    r_registered=("is_registered", "sum")
)
dire_data = players[players["team"] == "dire"].groupby("match_id").agg(
    d_heroes=("hero_id", list),
    d_registered=("is_registered", "sum")
)

df = matches.merge(radiant_data, on="match_id").merge(dire_data, on="match_id")

df = df[(df["r_heroes"].str.len() == 5) & (df["d_heroes"].str.len() == 5)].copy()

for i in range(5):
    df[f"hero_{i+1}"] = df["r_heroes"].apply(lambda x: x[i])
    df[f"hero_{i+6}"] = df["d_heroes"].apply(lambda x: x[i])

df = df.drop(columns=["r_heroes", "d_heroes", "match_id"]).reset_index(drop=True)

df.to_csv(OUTPUT_PATH, index=False)
print(f"Saved {len(df)} advanced matches to {OUTPUT_PATH.name}!")
