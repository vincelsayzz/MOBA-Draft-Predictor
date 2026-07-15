import pandas as pd

print("Loading Kaggle CSVs...")
# 1. Load only what we need (adding game_mode and account_id)
matches = pd.read_csv("match.csv", usecols=["match_id", "radiant_win", "game_mode"])
players = pd.read_csv("players.csv", usecols=["match_id", "hero_id", "player_slot", "account_id"])

# 2. Identify Teams and Public Profiles
players["team"] = players["player_slot"].apply(lambda slot: "radiant" if slot < 128 else "dire")
# If account_id is not 0, they have a public profile (we cast True/False to 1/0)
players["is_registered"] = (players["account_id"] != 0).astype(int)

# 3. Aggregate data per match for both teams
print("Processing team data...")
radiant_data = players[players["team"] == "radiant"].groupby("match_id").agg(
    r_heroes=("hero_id", list),
    r_registered=("is_registered", "sum") # Counts how many registered players are on Radiant
)
dire_data = players[players["team"] == "dire"].groupby("match_id").agg(
    d_heroes=("hero_id", list),
    d_registered=("is_registered", "sum")
)

# 4. Merge everything together based on match_id
df = matches.merge(radiant_data, on="match_id").merge(dire_data, on="match_id")

# 5. Filter out incomplete matches (disconnects, etc.)
df = df[(df['r_heroes'].str.len() == 5) & (df['d_heroes'].str.len() == 5)]

# 6. Expand the hero lists into their own columns (hero_1 to hero_10)
for i in range(5):
    df[f'hero_{i+1}'] = df['r_heroes'].apply(lambda x: x[i])
    df[f'hero_{i+6}'] = df['d_heroes'].apply(lambda x: x[i])

# Drop the temporary list columns
df = df.drop(columns=['r_heroes', 'd_heroes', 'match_id'])

# 7. Save the new advanced dataset
df.to_csv("dota_matches_advanced.csv", index=False)
print(f"Saved {len(df)} advanced matches to dota_matches_advanced.csv!")