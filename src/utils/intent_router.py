"""Intent detection and routing for dynamic prompt selection."""

import re
from typing import Literal, TypedDict

QueryIntent = Literal[
    "greeting",
    "non_philosophical",
    "specific_verse",
    "specific_chapter",
    "verse_explanation",
    "comparison",
    "practice",
    "meditation",
    "yoga",
    "bhakti",
    "karma",
    "jnana",
    "meaning",
    "life_guidance",
    "philosophy",
    "factual",
    "general",
]

AnswerComplexity = Literal["simple", "medium", "complex"]


class IntentResult(TypedDict):
    intent: QueryIntent
    complexity: AnswerComplexity
    target_words: tuple[int, int]
    is_follow_up: bool


GREETING_PATTERNS = (
    r"^(hi|hello|hey|namaste|greetings)\b",
    r"^good\s+(morning|afternoon|evening)\b",
)

NON_PHILOSOPHICAL_PATTERNS = (
    r"\b(weather|stock|price|bitcoin|recipe|sports score)\b",
    r"\b(write code|python script|javascript)\b",
)

FOLLOW_UP_PATTERNS = (
    r"\b(he|she|it|they|this|that|those|these)\b",
    r"\b(explain more|tell me more|go deeper|another example|what else)\b",
    r"\b(why is that|how so|elaborate|continue)\b",
)


def detect_intent(query: str, has_conversation: bool = False) -> IntentResult:
    """Classify query intent and determine answer length targets."""
    lowered = query.lower().strip()

    if any(re.search(p, lowered) for p in GREETING_PATTERNS):
        return _result("greeting", "simple", (80, 120))

    if any(re.search(p, lowered) for p in NON_PHILOSOPHICAL_PATTERNS):
        return _result("non_philosophical", "simple", (80, 120))

    is_follow_up = has_conversation and any(
        re.search(p, lowered) for p in FOLLOW_UP_PATTERNS
    )

    if _is_specific_verse_query(lowered):
        return _result("specific_verse", "medium", (150, 220), is_follow_up)

    if _is_specific_chapter_query(lowered):
        return _result("specific_chapter", "medium", (200, 280), is_follow_up)

    if _matches(lowered, ("compare", "difference", "versus", " vs ", "similarities", "contrast")):
        return _result("comparison", "complex", (300, 450), is_follow_up)

    if _matches(lowered, ("how to", "how do i", "steps", "practice", "technique", "daily", "routine")):
        return _result("practice", "medium", (220, 320), is_follow_up)

    if _matches(lowered, ("meditat", "dhyana", "mindfulness", "concentration")):
        return _result("meditation", "medium", (220, 320), is_follow_up)

    if _matches(lowered, ("bhakti", "devotion", "worship", "prayer")):
        return _result("bhakti", "medium", (220, 320), is_follow_up)

    if _matches(lowered, ("karma yoga", "karma", "action without", "detachment")):
        return _result("karma", "medium", (220, 320), is_follow_up)

    if _matches(lowered, ("jnana", "knowledge", "wisdom path", "self-inquiry")):
        return _result("jnana", "medium", (250, 350), is_follow_up)

    if _matches(lowered, ("yoga sutra", "ashtanga", "eight limbs", "patanjali")):
        return _result("yoga", "medium", (250, 350), is_follow_up)

    if _matches(lowered, ("meaning of", "what does", "define", "what is the meaning")):
        return _result("meaning", "medium", (180, 260), is_follow_up)

    if _matches(lowered, ("verse", "shloka", "sloka", "sutra ") ) and _matches(
        lowered, ("explain", "what does", "mean", "teach")
    ):
        return _result("verse_explanation", "medium", (200, 300), is_follow_up)

    if _matches(
        lowered,
        ("advice", "guidance", "life", "relationship", "stress", "anxiety", "purpose", "career"),
    ):
        return _result("life_guidance", "medium", (250, 350), is_follow_up)

    if _matches(
        lowered,
        (
            "consciousness",
            "atman",
            "brahman",
            "moksha",
            "dharma",
            "soul",
            "reality",
            "existence",
            "enlightenment",
            "philosoph",
        ),
    ):
        return _result("philosophy", "complex", (350, 500), is_follow_up)

    if len(lowered.split()) <= 4 and _matches(
        lowered, ("who", "what", "when", "where", "which")
    ):
        return _result("factual", "simple", (100, 150), is_follow_up)

    if is_follow_up:
        return _result("general", "medium", (200, 280), True)

    return _result("general", "medium", (220, 300), False)


def _result(
    intent: QueryIntent,
    complexity: AnswerComplexity,
    words: tuple[int, int],
    is_follow_up: bool = False,
) -> IntentResult:
    return {
        "intent": intent,
        "complexity": complexity,
        "target_words": words,
        "is_follow_up": is_follow_up,
    }


def _matches(text: str, keywords: tuple[str, ...]) -> bool:
    return any(k in text for k in keywords)


def _is_specific_verse_query(text: str) -> bool:
    patterns = (
        r"(chapter|ch\.?)\s*\d+\s*(verse|v\.?|sutra)\s*\d+",
        r"(verse|v\.?|sutra)\s*\d+\s*(of|in)?\s*(chapter|ch\.?)?\s*\d+",
        r"\b(gita|bhagavad|yoga sutras?)\s+\d+\.\d+",
        r"\b\d+\.\d+\b",
    )
    return any(re.search(p, text) for p in patterns)


def _is_specific_chapter_query(text: str) -> bool:
    return bool(
        re.search(r"(chapter|ch\.?)\s*\d+", text)
        and not _is_specific_verse_query(text)
    )


def words_to_max_tokens(word_range: tuple[int, int]) -> int:
    """Approximate max tokens from target word count."""
    _, upper = word_range
    return min(900, max(200, int(upper * 1.6)))
