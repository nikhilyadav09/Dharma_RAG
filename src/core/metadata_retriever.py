"""Direct metadata lookup for explicit scripture, chapter, and verse references."""

import re
from typing import Dict, List, Optional

import psycopg2

from src.config.settings import DatabaseConfig
from src.utils.scripture import ScripturePreference, detect_scripture_preference


class MetadataRetriever:
    """Lookup verses by book, chapter, and verse before semantic search."""

    GITA_BOOK = "Bhagavad Gita"
    YOGA_BOOK = "Yoga Sutras"

    def __init__(self, conn=None):
        self._conn = conn
        self._owns_conn = conn is None

    def _get_conn(self):
        if self._conn is None or self._conn.closed:
            self._conn = psycopg2.connect(**DatabaseConfig.CONNECTION_PARAMS)
            self._conn.set_session(autocommit=True)
        return self._conn

    def close(self):
        if self._owns_conn and self._conn and not self._conn.closed:
            self._conn.close()

    def lookup(self, query: str, preference: ScripturePreference = "any") -> List[Dict]:
        parsed = self._parse_reference(query, preference)
        if not parsed:
            return []

        book, chapter, verse = parsed
        return self._fetch(book, chapter, verse)

    def lookup_by_preference(
        self,
        query: str,
        preference: ScripturePreference,
        limit: int = 5,
    ) -> List[Dict]:
        """Return top verses from a preferred book when no exact reference exists."""
        if preference == "any":
            return []

        book = self.GITA_BOOK if preference == "bhagavad_gita" else self.YOGA_BOOK
        conn = self._get_conn()
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, book, chapter, verse, sanskrit, translation, explanation
                FROM verses
                WHERE book = %s
                ORDER BY chapter::int, verse
                LIMIT %s
                """,
                (book, limit),
            )
            rows = cur.fetchall()

        return [self._format_row(row, confidence=0.85) for row in rows]

    def _parse_reference(
        self,
        query: str,
        preference: ScripturePreference,
    ) -> Optional[tuple[str, Optional[int], Optional[str]]]:
        text = query.lower()
        book = self._infer_book(text, preference)
        chapter, verse = self._extract_chapter_verse(text)
        if chapter is None and verse is None:
            return None
        return book, chapter, verse

    def _infer_book(self, text: str, preference: ScripturePreference) -> str:
        if any(t in text for t in ("yoga sutra", "patanjali", "sutra")):
            return self.YOGA_BOOK
        if any(t in text for t in ("gita", "bhagavad", "krishna", "arjuna")):
            return self.GITA_BOOK
        if preference == "yoga_sutras":
            return self.YOGA_BOOK
        if preference == "bhagavad_gita":
            return self.GITA_BOOK
        return self.GITA_BOOK

    def _extract_chapter_verse(self, text: str) -> tuple[Optional[int], Optional[str]]:
        patterns = [
            r"(?:chapter|ch\.?)\s*(\d+)\s*(?:verse|v\.?|sutra)\s*([\d.]+)",
            r"(?:verse|v\.?|sutra)\s*([\d.]+)\s*(?:of|in)?\s*(?:chapter|ch\.?)?\s*(\d+)",
            r"\b(\d+)\.(\d+)\b",
            r"(?:chapter|ch\.?)\s*(\d+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if not match:
                continue
            groups = match.groups()
            if pattern.startswith(r"(?:verse"):
                return int(groups[1]), str(groups[0])
            if len(groups) == 2:
                return int(groups[0]), str(groups[1])
            if len(groups) == 1:
                return int(groups[0]), None
        return None, None

    def _fetch(
        self,
        book: str,
        chapter: Optional[int],
        verse: Optional[str],
    ) -> List[Dict]:
        conn = self._get_conn()
        conditions = ["book = %s"]
        params: list = [book]

        if chapter is not None:
            conditions.append("chapter = %s")
            params.append(chapter)
        if verse is not None:
            conditions.append("verse = %s")
            params.append(str(verse))

        sql = f"""
            SELECT id, book, chapter, verse, sanskrit, translation, explanation
            FROM verses
            WHERE {' AND '.join(conditions)}
            ORDER BY chapter, verse
            LIMIT 5
        """
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()

        if not rows and chapter is not None:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, book, chapter, verse, sanskrit, translation, explanation
                    FROM verses
                    WHERE book = %s AND chapter = %s
                    ORDER BY verse
                    LIMIT 5
                    """,
                    (book, chapter),
                )
                rows = cur.fetchall()

        return [self._format_row(row, confidence=0.99) for row in rows]

    @staticmethod
    def _format_row(row: tuple, confidence: float) -> Dict:
        return {
            "id": row[0],
            "book": row[1],
            "chapter": row[2],
            "verse": row[3],
            "sanskrit": row[4],
            "translation": row[5],
            "explanation": row[6],
            "confidence_score": confidence,
            "final_score": confidence,
            "metadata_match": True,
        }
