from typing import Dict
import re
import logging

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

import nltk

try:
    nltk.download("punkt_tab", quiet=True)
    nltk.download("punkt", quiet=True)
    nltk.download("stopwords", quiet=True)
except Exception as e:
    logging.error("Failed to download NLTK data: %s", e)

from src.utils.scripture import detect_scripture_preference

SPIRITUAL_TERMS = {
    "dharma",
    "karma",
    "moksha",
    "yoga",
    "atman",
    "brahman",
    "samsara",
    "meditation",
    "consciousness",
    "devotion",
    "bhakti",
    "jnana",
    "gita",
    "sutra",
    "sutras",
    "patanjali",
    "krishna",
    "arjuna",
}


class QueryProcessor:
    """Query preprocessing with light enhancement and scripture detection."""

    def __init__(self):
        self.stop_words = set(stopwords.words("english"))

    def process_query(self, query: str) -> Dict:
        cleaned = self._clean_text(query)
        enhanced = self._enhance_query(cleaned)
        word_count = len(word_tokenize(enhanced))
        scripture_preference = detect_scripture_preference(query)

        return {
            "original_query": query,
            "processed_query": enhanced,
            "word_count": word_count,
            "needs_clarification": self._needs_clarification(enhanced),
            "scripture_preference": scripture_preference,
        }

    def _clean_text(self, text: str) -> str:
        text = " ".join(text.split())
        if text and text[0].isalpha():
            text = text[0].upper() + text[1:]
        return text

    def _enhance_query(self, query: str) -> str:
        """Only lightly expand very short queries — avoid semantic drift."""
        words = query.rstrip("?").split()
        if len(words) >= 5:
            return query

        lowered = query.lower()
        if any(term in lowered for term in SPIRITUAL_TERMS):
            return query

        # Minimal expansion for single-word or two-word queries
        if len(words) <= 2 and not query.endswith("?"):
            return f"What is the teaching on {query.rstrip('?')}?"

        return query

    def _needs_clarification(self, query: str) -> bool:
        words = [w for w in word_tokenize(query.lower()) if w.isalnum()]
        meaningful = [w for w in words if w not in self.stop_words]

        if len(meaningful) >= 2:
            return False
        if any(term in query.lower() for term in SPIRITUAL_TERMS):
            return False
        return len(words) < 2
