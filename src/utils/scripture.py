"""Scripture detection and passage formatting utilities."""

from typing import Literal, Optional

ScripturePreference = Literal["bhagavad_gita", "yoga_sutras", "any"]

GITA_ALIASES = (
    "bhagavad gita",
    "gita",
    "bhagavadgita",
    "krishna",
    "arjuna",
    "kurukshetra",
)

YOGA_ALIASES = (
    "yoga sutra",
    "yoga sutras",
    "patanjali",
    "sutra",
    "sutras",
    "ashtanga",
    "eight limbs",
)


def detect_scripture_preference(query: str) -> ScripturePreference:
    """Infer whether the user is asking about a specific corpus."""
    lowered = query.lower()

    gita_score = sum(1 for term in GITA_ALIASES if term in lowered)
    yoga_score = sum(1 for term in YOGA_ALIASES if term in lowered)

    if gita_score > yoga_score and gita_score > 0:
        return "bhagavad_gita"
    if yoga_score > gita_score and yoga_score > 0:
        return "yoga_sutras"
    return "any"


def book_matches_preference(book: str, preference: ScripturePreference) -> bool:
    if preference == "any":
        return True
    lowered = book.lower()
    if preference == "bhagavad_gita":
        return "gita" in lowered or "bhagavad" in lowered
    if preference == "yoga_sutras":
        return "yoga" in lowered or "sutra" in lowered
    return True


def truncate_passage(text: str, max_chars: int = 1200) -> str:
    text = " ".join(text.split())
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 3].rstrip() + "..."


def build_index_text(translation: str, explanation: str, max_chars: int = 1200) -> str:
    translation = (translation or "").strip()
    explanation = (explanation or "").strip()
    if translation and explanation:
        combined = f"{translation}\n\n{explanation}"
    else:
        combined = translation or explanation
    return truncate_passage(combined, max_chars)
