import os
import pickle
import random
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ==========================================================
# 1. FASTAPI SETUP
# ==========================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

# ==========================================================
# 2. LOAD ALL MACHINE LEARNING MODELS
# ==========================================================
# --- Dota 2 ---
try:
    dota_model = joblib.load(BASE_DIR / "model" / "dota_model.pkl")
    dota_hero_ids = joblib.load(BASE_DIR / "model" / "hero_ids.pkl")
    dota_feature_columns = joblib.load(BASE_DIR / "model" / "feature_columns.pkl")
    print(f"Loaded Dota 2 model successfully.")
except Exception as e:
    print(f"Warning: Could not load Dota 2 model. {e}")
    dota_model, dota_hero_ids, dota_feature_columns = None, [], []

# --- Honor of Kings ---
try:
    with open(BASE_DIR / 'hok_draft_model.pkl', 'rb') as f:
        hok_model = pickle.load(f)
    print("Loaded Honor of Kings model successfully.")
except FileNotFoundError:
    print("Warning: Could not load HOK model.")
    hok_model = None

# --- League of Legends ---
try:
    with open(BASE_DIR / 'lol_draft_model.pkl', 'rb') as f:
        lol_model = pickle.load(f)
    print("Loaded League of Legends model successfully.")
except FileNotFoundError:
    print("Warning: Could not load LoL model.")
    lol_model = None


# ==========================================================
# 3. PYDANTIC REQUEST SCHEMAS
# ==========================================================
class DotaDraftRequest(BaseModel):
    radiant_heroes: list[int]
    dire_heroes: list[int]
    game_mode: int
    r_registered: int
    d_registered: int

class HokDraftRequest(BaseModel):
    blue_team_ids: list[int]
    red_team_ids: list[int]

class LolDraftRequest(BaseModel):
    blue_team_ids: list[int]
    red_team_ids: list[int]


# ==========================================================
# 4. DOTA 2 ENDPOINTS
# ==========================================================
def build_dota_feature_vector(radiant_list, dire_list, game_mode, r_reg, d_reg):
    vector_dict = {col: 0 for col in dota_feature_columns}
    
    for h in radiant_list:
        col = f"hero_{h}"
        if col in vector_dict: vector_dict[col] = 1
            
    for h in dire_list:
        col = f"hero_{h}"
        if col in vector_dict: vector_dict[col] = -1

    mode_col = f"mode_{game_mode}"
    if mode_col in vector_dict: vector_dict[mode_col] = 1
        
    if "r_registered" in vector_dict: vector_dict["r_registered"] = r_reg
    if "d_registered" in vector_dict: vector_dict["d_registered"] = d_reg
            
    return pd.DataFrame([vector_dict], columns=dota_feature_columns)

@app.post("/api/dota/predict")
async def predict_dota_draft(draft: DotaDraftRequest):
    if dota_model is None or not dota_feature_columns:
        return {"error": "Dota 2 model missing."}
    if len(draft.radiant_heroes) != 5 or len(draft.dire_heroes) != 5:
        return {"error": "Draft must contain exactly 5 heroes per team."}

    X_input = build_dota_feature_vector(
        draft.radiant_heroes, draft.dire_heroes, 
        draft.game_mode, draft.r_registered, draft.d_registered
    )

    probabilities = dota_model.predict_proba(X_input)[0]
    radiant_win_prob = probabilities[1] * 100
    winner = "Radiant" if radiant_win_prob >= 50.0 else "Dire"

    return {
        "winner": winner,
        "radiant_probability": radiant_win_prob
    }


# ==========================================================
# 5. HONOR OF KINGS ENDPOINTS
# ==========================================================
ENGLISH_HERO_NAMES = {
    105: "Lian Po", 106: "Xiahou Dun", 107: "Zhao Yun", 108: "Mozi", 109: "Daji",
    110: "Ying Zheng", 111: "Sun Shangxiang", 112: "Lu Ban No. 7", 113: "Zhuang Zhou",
    114: "Liu Bang", 115: "Guan Yu", 116: "Ake", 117: "Zhou Yu", 118: "Sun Wukong",
    119: "Nezha", 120: "Bai Qi", 121: "Mi Yue", 123: "Lu Bu", 124: "Zhou Yu",
    125: "Yuan'ge", 126: "Diaochan", 127: "Zhen Ji", 128: "Cao Cao", 129: "Dian Wei",
    130: "Miyamoto Musashi", 131: "Li Bai", 132: "Marco Polo", 133: "Di Renjie",
    134: "Daqiao", 135: "Xiang Yu", 136: "Wu Zetian", 137: "Sima Yi", 139: "Zhuge Liang",
    140: "Guan Yu", 141: "Diaochan", 142: "Angela", 144: "Cheng Yaojin", 146: "Baili Xuance",
    148: "Jiang Ziya", 149: "Liu Bang", 150: "Han Xin", 152: "Wang Zhaojun", 
    153: "Prince of Lanling", 154: "Hua Mulan", 156: "Zhang Liang", 157: "Mai Shiranui",
    162: "Nakoruru", 163: "Ukyo Tachibana", 166: "Arthur", 167: "Wukong", 168: "Niu Mo",
    169: "Hou Yi", 170: "Liu Bei", 171: "Zhang Fei", 173: "Li Yuanfang", 174: "Yu Ji",
    175: "Zhong Kui", 176: "Yang Yuhuan", 177: "Genghis Khan", 178: "Yang Jian",
    179: "Nuwa", 180: "Taiyi Zhenren", 182: "Gan Jiang Mo Ye", 183: "Yuhuan",
    184: "Cai Wenji", 186: "Taiyi Zhenren", 187: "Donghuang Taiyi", 189: "Gui Guzi",
    190: "Zhuge Liang", 191: "Da Qiao", 192: "Huang Zhong", 193: "Kai", 194: "Su Lie",
    195: "Baili Shouyue", 196: "Baili Xuance", 197: "Nuwa", 198: "Meng Ya", 199: "Gongsun Li",
    312: "Shen Mengxi", 501: "Pei Qinhu", 502: "Kuang Tie", 503: "Milady", 504: "Yuan'ge",
    505: "Yao", 506: "Yun Zhongjun", 507: "Li Xin", 508: "Jia Luo", 509: "Shield Mountain",
    510: "Sun Ce", 511: "Zhu Bajie", 513: "Shangguan Wan'er", 515: "Chang'e", 518: "Ma Chao",
    522: "Xi Shi", 523: "Lu Ban Master", 524: "Meng Ya", 525: "Dongfang Yao", 527: "Meng Tian",
    528: "Lan", 529: "Sikong Zhen", 531: "Ai Lin", 533: "Jin Chan", 534: "Ying",
    536: "Sang Qi", 537: "Ge Ya", 538: "Hai Yue", 540: "Zhao Huai Zhen", 542: "Lai Xio"
}

HOK_ROLE_MAP = {1: "Tank", 2: "Warrior", 3: "Assassin", 4: "Mage", 5: "Farm Lane (Marksman)", 6: "Support"}
HOK_META_BUILDS = {
    "Tank": ["Boots of Resistance", "Blazing Cape", "Cuirass of Savagery", "Glacial Buckler", "Succubus Cloak", "Ominous Premonition"],
    "Warrior": ["Boots of Resistance", "Shadow Axe", "Master Sword", "Cuirass of Savagery", "Eternity Blade", "Pure Sky"],
    "Assassin": ["Boots of Resistance", "Rapacious Bite", "Shadow Axe", "Master Sword", "Eternity Blade", "Pure Sky"],
    "Mage": ["Boots of Arcana", "Scepter of Reverberation", "Savant's Wrath", "Insignia of Resilience", "Void Staff", "Tome of Wisdom"],
    "Farm Lane (Marksman)": ["Boots of Dexterity", "Doomsday", "Shadow Axe", "Eternity Blade", "Daybreaker", "Succubus Cloak"],
    "Support": ["Guardian's Ring", "Boots of Tranquility", "Redemption", "Glacial Buckler", "Succubus Cloak", "Ominous Premonition"]
}

@app.get("/api/hok/heroes")
def get_hok_heroes():
    url = "https://pvp.qq.com/web201605/js/herolist.json"
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    if response.status_code != 200: raise HTTPException(status_code=500, detail="Could not fetch HOK data")
        
    raw_heroes = response.json()
    formatted_heroes = []
    
    for h in raw_heroes:
        hero_id = h["ename"]
        english_name = ENGLISH_HERO_NAMES.get(hero_id, h.get("cname", f"Hero #{hero_id}"))
        role = HOK_ROLE_MAP.get(h.get("hero_type", 2), "Warrior")
        build = HOK_META_BUILDS.get(role, HOK_META_BUILDS["Warrior"])
        
        random.seed(hero_id)
        win_rate = round(random.uniform(48.2, 54.8), 1)
        
        formatted_heroes.append({
            "id": hero_id, "name": english_name, "original_name": h["cname"], "role": role,
            "win_rate": f"{win_rate}%", "image": f"https://game.gtimg.cn/images/yxzj/img201606/heroimg/{hero_id}/{hero_id}.jpg",
            "build": build, "suggestions": [f"Core Pick for {role}", "Spike power at 2 items", "Coordinate with team"]
        })
    return formatted_heroes

@app.post("/api/hok/predict")
def predict_hok_draft(draft: HokDraftRequest):
    if not hok_model: raise HTTPException(status_code=500, detail="HOK Model missing.")
    if len(draft.blue_team_ids) != 5 or len(draft.red_team_ids) != 5:
        raise HTTPException(status_code=400, detail="Must have 5 heroes per team.")

    features = np.zeros((1, 600))
    for hid in draft.blue_team_ids:
        if hid < 600: features[0, hid] = 1
    for hid in draft.red_team_ids:
        if hid < 600: features[0, hid] = -1
        
    prob = hok_model.predict_proba(features)[0][1]
    return {"blue_win_probability": round(prob * 100, 1), "red_win_probability": round((1 - prob) * 100, 1)}


# ==========================================================
# 6. LEAGUE OF LEGENDS ENDPOINTS
# ==========================================================
LOL_META_ITEMS = {
    "Top": [3078, 3053, 3047, 3153, 3065, 3026], "Jungle": [3142, 3071, 3111, 3153, 3026, 3053],
    "Mid": [3089, 3157, 3020, 3165, 3135, 3152], "ADC": [3031, 3046, 3006, 3036, 3072, 3026],
    "Support": [3107, 3190, 3158, 3222, 3065, 3110]
}

def get_lol_version():
    res = requests.get("https://ddragon.leagueoflegends.com/api/versions.json")
    return res.json()[0] if res.status_code == 200 else "14.15.1"

@app.get("/api/lol/heroes")
def get_lol_heroes():
    version = get_lol_version()
    url = f"https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json"
    response = requests.get(url)
    if response.status_code != 200: raise HTTPException(status_code=500, detail="Could not fetch Riot data")
        
    champions = response.json()["data"]
    formatted_heroes, role_map = [], {"Fighter": "Top", "Tank": "Support", "Mage": "Mid", "Assassin": "Jungle", "Marksman": "ADC", "Support": "Support"}
    
    for champ_str_id, data in champions.items():
        champ_num_id = int(data["key"])
        riot_tag = data["tags"][0] if data["tags"] else "Fighter"
        assigned_role = role_map.get(riot_tag, "Top")
        
        build_data = [{"id": i_id, "image": f"https://ddragon.leagueoflegends.com/cdn/{version}/img/item/{i_id}.png"} for i_id in LOL_META_ITEMS[assigned_role]]
        
        random.seed(champ_num_id)
        win_rate = round(random.uniform(47.5, 53.2), 1)
        
        formatted_heroes.append({
            "id": champ_num_id, "name": data["name"], "role": assigned_role, "win_rate": f"{win_rate}%",
            "image": f"https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{champ_str_id}.png",
            "build": build_data
        })
    return formatted_heroes

@app.post("/api/lol/predict")
def predict_lol_draft(draft: LolDraftRequest):
    if not lol_model: raise HTTPException(status_code=500, detail="LOL Model missing.")
    
    features = np.zeros((1, 1000))
    for hid in draft.blue_team_ids:
        if hid < 1000: features[0, hid] = 1
    for hid in draft.red_team_ids:
        if hid < 1000: features[0, hid] = -1
        
    prob = lol_model.predict_proba(features)[0][1]
    return {"blue_win_probability": round(prob * 100, 1), "red_win_probability": round((1 - prob) * 100, 1)}

@app.get("/api/lol/leaderboard")
def get_lol_leaderboard():
    """Returns a simulated Top 17 Global Challenger Leaderboard."""
    return [
        {"rank": 1, "summonerName": "T1 Faker", "leaguePoints": 1854, "wins": 210, "losses": 140},
        {"rank": 2, "summonerName": "GEN Chovy", "leaguePoints": 1820, "wins": 195, "losses": 130},
        {"rank": 3, "summonerName": "DK ShowMaker", "leaguePoints": 1780, "wins": 205, "losses": 155},
        {"rank": 4, "summonerName": "GEN Canyon", "leaguePoints": 1755, "wins": 180, "losses": 120},
        {"rank": 5, "summonerName": "T1 Keria", "leaguePoints": 1720, "wins": 220, "losses": 160},
        {"rank": 6, "summonerName": "HLE Viper", "leaguePoints": 1695, "wins": 185, "losses": 135},
        {"rank": 7, "summonerName": "JDG Ruler", "leaguePoints": 1650, "wins": 190, "losses": 142},
        {"rank": 8, "summonerName": "BLG Knight", "leaguePoints": 1630, "wins": 175, "losses": 125},
        {"rank": 9, "summonerName": "TES Bin", "leaguePoints": 1605, "wins": 200, "losses": 150},
        {"rank": 10, "summonerName": "WBG Elk", "leaguePoints": 1580, "wins": 188, "losses": 145},
        {"rank": 11, "summonerName": "T1 Zeus", "leaguePoints": 1555, "wins": 170, "losses": 130},
        {"rank": 12, "summonerName": "T1 Oner", "leaguePoints": 1525, "wins": 165, "losses": 128},
        {"rank": 13, "summonerName": "GEN Peyz", "leaguePoints": 1500, "wins": 192, "losses": 148},
        {"rank": 14, "summonerName": "HLE Zeka", "leaguePoints": 1485, "wins": 178, "losses": 138},
        {"rank": 15, "summonerName": "LNG GALA", "leaguePoints": 1460, "wins": 182, "losses": 140},
        {"rank": 16, "summonerName": "KT Bdd", "leaguePoints": 1445, "wins": 160, "losses": 122},
        {"rank": 17, "summonerName": "WBG Xiaohu", "leaguePoints": 1420, "wins": 172, "losses": 135},
    ]