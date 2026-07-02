import re
from typing import List, Optional


def score_markdown_structure(text: str) -> float:
    """Heuristic score for Markdown structure (0–1)."""
    headings = re.findall(r"^#\s+.+", text, re.M)
    has_bullets = bool(re.search(r"^[-*]\s+", text, re.M))
    has_sections = len(headings) >= 2
    if has_sections and has_bullets:
        return 1.0
    if has_sections or has_bullets:
        return 0.7
    return 0.3 if text.strip() else 0.0


def score_readability(text: str) -> float:
    """Penalize very long paragraphs; reward moderate length."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip() and not p.startswith("#")]
    if not paragraphs:
        return 0.0
    lengths = [len(p.split()) for p in paragraphs]
    avg = sum(lengths) / len(lengths)
    if avg <= 80:
        return 1.0
    if avg <= 120:
        return 0.7
    return 0.4


def score_citation_overlap(response: str, sources: Optional[List[str]] = None) -> float:
    if not sources:
        return 0.0
    hits = sum(1 for source in sources if source.split()[0] in response or source in response)
    return hits / len(sources)


def score_answer_length(text: str, target_range: tuple[int, int] | None = None) -> float:
    words = len(text.split())
    if target_range is None:
        target_range = (150, 400)
    low, high = target_range
    if low <= words <= high:
        return 1.0
    if words < low:
        return max(0.3, words / low)
    return max(0.3, high / words)


def score_verse_diversity(sources: Optional[List[str]] = None) -> float:
    if not sources:
        return 0.0
    books = set()
    for source in sources:
        lowered = source.lower()
        if "gita" in lowered:
            books.add("gita")
        elif "yoga" in lowered or "sutra" in lowered:
            books.add("yoga")
        else:
            books.add(source)
    if len(sources) == 1:
        return 1.0
    return min(1.0, len(books) / min(3, len(sources)))


def score_groundedness_proxy(response: str, reference_translation: str) -> float:
    """Lexical overlap proxy between answer and reference translation."""
    if not reference_translation:
        return 0.0
    ref_words = set(reference_translation.lower().split())
    resp_words = set(response.lower().split())
    if not ref_words:
        return 0.0
    overlap = len(ref_words & resp_words)
    return min(1.0, overlap / max(10, len(ref_words) * 0.15))
