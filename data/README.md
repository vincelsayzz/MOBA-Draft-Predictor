# Data

This is where your training data lives — this is your current step.

## What to look for

On Kaggle, search "Dota 2 matches dataset." You want a CSV with something like:

- `hero_1` through `hero_10` — the hero IDs picked in that match
- `radiant_win` — 1 if Radiant won, 0 if Dire won

Different datasets structure this differently (some list heroes per side,
some use a wide one-hot format). Whatever you download, drop the raw CSV
in this folder, e.g. `data/dota_matches.csv`, and note its actual column
names below so future-you remembers:

```
# My dataset's columns:
# (fill this in once you've downloaded it)
```

## Next step

Once the CSV is here, `train_model.py` in this folder is a starting
template for Phase 1: load it with pandas, shape it into 10 hero columns
+ 1 outcome column, train a classifier, and export `dota_model.pkl` into
`../backend/model/`.
