"""Backward-compatible query classification — delegates to intent router."""

from src.utils.intent_router import detect_intent


def classify_query(query: str) -> str:
    """Map intent to legacy template keys used by older code paths."""
    intent = detect_intent(query, has_conversation=False)
    mapping = {
        "philosophy": "philosophical",
        "practice": "practical",
        "meditation": "practical",
        "yoga": "practical",
        "life_guidance": "practical",
        "greeting": "clarification",
        "non_philosophical": "clarification",
    }
    return mapping.get(intent["intent"], "default")
