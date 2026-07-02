import logging

import psycopg2

from api.schemas.corpus import BookVerseCount, CorpusStatsResponse
from src.config.settings import DatabaseConfig

logger = logging.getLogger(__name__)


def get_corpus_stats() -> CorpusStatsResponse:
    """Return verse counts grouped by book from PostgreSQL."""
    try:
        conn = psycopg2.connect(**DatabaseConfig.CONNECTION_PARAMS)
        with conn.cursor() as cur:
            cur.execute("SELECT book, COUNT(*) FROM verses GROUP BY book ORDER BY book")
            rows = cur.fetchall()
        conn.close()
    except psycopg2.Error as exc:
        logger.error("Failed to fetch corpus stats: %s", exc)
        raise

    books = [BookVerseCount(book=row[0], count=row[1]) for row in rows]
    total = sum(book.count for book in books)
    return CorpusStatsResponse(total_verses=total, books=books)


def check_database_connection() -> bool:
    """Return True when the application database is reachable."""
    try:
        conn = psycopg2.connect(**DatabaseConfig.CONNECTION_PARAMS)
        conn.close()
        return True
    except psycopg2.Error:
        return False
