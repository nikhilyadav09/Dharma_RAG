#!/usr/bin/env python3
"""Seed verses into a managed PostgreSQL database (e.g. Neon).

Skips local Docker database creation. Use after enabling pgvector on Neon.

Usage:
    cp .env.example .env   # set Neon DB_* vars + DB_SSLMODE=require
    python scripts/seed_production_db.py
"""

import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env")

from src.config.settings import DatabaseConfig

REQUIRED = ("DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST")


def main() -> None:
    missing = [k for k in REQUIRED if not os.getenv(k)]
    if missing:
        print(f"Missing env vars: {', '.join(missing)}")
        sys.exit(1)

    print("Connecting to database...")
    conn = psycopg2.connect(**DatabaseConfig.CONNECTION_PARAMS)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    cur.close()
    conn.close()
    print("pgvector extension enabled.")

    from src.core.store_data import main as seed_main

    print("Seeding verses (may take several minutes)...")
    seed_main()
    print("Production database seed complete.")


if __name__ == "__main__":
    main()
