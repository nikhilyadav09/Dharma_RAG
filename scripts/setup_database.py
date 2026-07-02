#!/usr/bin/env python3
"""Create the database, enable pgvector, and seed verse data."""

import os
import sys
import time
from pathlib import Path

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

load_dotenv(PROJECT_ROOT / ".env")

from src.config.settings import DatabaseConfig

DB_PLACEHOLDERS = {"your_db_username", "your_db_password"}
REQUIRED_DB_VARS = ("DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST")


def validate_db_env() -> None:
    missing = [name for name in REQUIRED_DB_VARS if not os.getenv(name)]
    if missing:
        print(f"Error: Missing environment variables: {', '.join(missing)}")
        print("Run: cp .env.example .env")
        print("Then set your database credentials in .env")
        sys.exit(1)

    if os.getenv("DB_USER") in DB_PLACEHOLDERS or os.getenv("DB_PASSWORD") in DB_PLACEHOLDERS:
        print("Error: DB_USER and DB_PASSWORD are still placeholder values in .env")
        print("For Docker setup, use:")
        print("  DB_USER=postgres")
        print("  DB_PASSWORD=postgres")
        sys.exit(1)


def wait_for_postgres(max_attempts: int = 30, delay: int = 2) -> None:
    admin_params = {**DatabaseConfig.CONNECTION_PARAMS, "dbname": "postgres"}
    for attempt in range(1, max_attempts + 1):
        try:
            conn = psycopg2.connect(**admin_params)
            conn.close()
            print("PostgreSQL is ready.")
            return
        except psycopg2.OperationalError:
            if attempt == max_attempts:
                print("Error: Could not connect to PostgreSQL.")
                print("Start the database first:")
                print("  docker compose up -d")
                sys.exit(1)
            print(f"Waiting for PostgreSQL... ({attempt}/{max_attempts})")
            time.sleep(delay)


def ensure_database() -> None:
    db_name = DatabaseConfig.CONNECTION_PARAMS["dbname"]
    admin_params = {**DatabaseConfig.CONNECTION_PARAMS, "dbname": "postgres"}

    conn = psycopg2.connect(**admin_params)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
    if cur.fetchone():
        print(f"Database already exists: {db_name}")
    else:
        cur.execute(f'CREATE DATABASE "{db_name}"')
        print(f"Created database: {db_name}")

    cur.close()
    conn.close()


def ensure_pgvector() -> None:
    conn = psycopg2.connect(**DatabaseConfig.CONNECTION_PARAMS)
    conn.autocommit = True
    cur = conn.cursor()

    try:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("pgvector extension enabled.")
    except psycopg2.Error as exc:
        print("Error: pgvector is not available on this PostgreSQL server.")
        print("Recommended: use Docker (includes pgvector automatically):")
        print("  docker compose up -d")
        print("Or install natively: sudo apt install postgresql-16-pgvector")
        print(f"Details: {exc}")
        sys.exit(1)
    finally:
        cur.close()
        conn.close()


def seed_data() -> None:
    from src.core.store_data import main as seed_main

    print("Seeding database (this may take a few minutes on first run)...")
    seed_main()


def main() -> None:
    print("DHARMA database setup")
    print("=" * 40)
    validate_db_env()
    wait_for_postgres()
    ensure_database()
    ensure_pgvector()
    seed_data()
    print("=" * 40)
    print("Database setup complete.")
    print("Start the app with: streamlit run app.py")


if __name__ == "__main__":
    main()
