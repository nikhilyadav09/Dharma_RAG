"""Unit tests for scripture detection utilities."""

from src.utils.scripture import (
    build_index_text,
    detect_scripture_preference,
    truncate_passage,
)


def test_detect_bhagavad_gita():
    assert detect_scripture_preference("What did Krishna teach Arjuna?") == "bhagavad_gita"


def test_detect_yoga_sutras():
    assert detect_scripture_preference("Explain the eight limbs in Patanjali") == "yoga_sutras"


def test_detect_neutral_query():
    assert detect_scripture_preference("What is meditation?") == "any"


def test_build_index_text_combines_fields():
    text = build_index_text("Translation line", "Explanation line", 500)
    assert "Translation line" in text
    assert "Explanation line" in text


def test_truncate_passage():
    long_text = "word " * 500
    truncated = truncate_passage(long_text, 50)
    assert len(truncated) <= 50
    assert truncated.endswith("...")
