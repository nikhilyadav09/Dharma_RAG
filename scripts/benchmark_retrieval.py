#!/usr/bin/env python3
"""Compare retrieval quality across embedding models (offline benchmark).

Usage:
    python scripts/benchmark_retrieval.py

Requires a seeded database with embeddings for each model being compared,
or runs semantic-only comparison against in-memory encoded passages from CSV.
"""

import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"

BENCHMARK_QUERIES = [
    ("Why was Krishna teaching Yoga to Arjuna?", "bhagavad_gita"),
    ("What is the purpose of Yoga?", "yoga_sutras"),
    ("What is karma yoga?", "bhagavad_gita"),
    ("What are the five kinds of thought?", "yoga_sutras"),
    ("Why should we worship God?", "bhagavad_gita"),
]

MODELS = [
    "sentence-transformers/all-MiniLM-L6-v2",
    "BAAI/bge-small-en-v1.5",
]


def load_passages() -> pd.DataFrame:
    gita = pd.read_csv(DATA_DIR / "processed_bhagwat_gita.csv")
    yoga = pd.read_csv(DATA_DIR / "processed_yoga_sutra.csv")
    gita["book"] = "Bhagavad Gita"
    yoga["book"] = "Yoga Sutras"
    return pd.concat([gita, yoga], ignore_index=True)


def build_text(row) -> str:
    t = str(row.get("translation", "") or "").strip()
    e = str(row.get("explanation", "") or "").strip()
    if t and e:
        return f"{t}\n\n{e}"[:1200]
    return (t or e)[:1200]


def evaluate_model(model_name: str, df: pd.DataFrame) -> dict:
    model = SentenceTransformer(model_name)
    texts = [build_text(row) for _, row in df.iterrows()]
    labels = [
        "bhagavad_gita" if "Gita" in row["book"] else "yoga_sutras"
        for _, row in df.iterrows()
    ]

    start = time.perf_counter()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    encode_ms = (time.perf_counter() - start) * 1000

    hits = 0
    mrr_sum = 0.0
    for query, expected in BENCHMARK_QUERIES:
        q_emb = model.encode([query], normalize_embeddings=True)
        sims = cosine_similarity(q_emb, embeddings)[0]
        ranked_idx = np.argsort(sims)[::-1][:5]
        ranked_labels = [labels[i] for i in ranked_idx]
        if expected in ranked_labels:
            hits += 1
            rank = ranked_labels.index(expected) + 1
            mrr_sum += 1.0 / rank

    n = len(BENCHMARK_QUERIES)
    return {
        "model": model_name,
        "embedding_dim": embeddings.shape[1],
        "encode_corpus_ms": round(encode_ms, 1),
        "top5_scripture_hit_rate": round(hits / n, 3),
        "mrr_at_5": round(mrr_sum / n, 3),
    }


def main():
    df = load_passages()
    results = [evaluate_model(name, df) for name in MODELS]
    print(json.dumps(results, indent=2))

    out = PROJECT_ROOT / "evaluation_summary_embedding_benchmark.json"
    with open(out, "w") as f:
        json.dump({"queries": len(BENCHMARK_QUERIES), "results": results}, f, indent=2)
    print(f"\nWrote {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
