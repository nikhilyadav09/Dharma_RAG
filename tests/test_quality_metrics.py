"""Unit tests for query preprocessing."""

from src.core.query_preprocessor import QueryProcessor
from src.evaluation.quality_metrics import (
    score_citation_overlap,
    score_markdown_structure,
    score_readability,
)


def test_processor_detects_scripture_preference():
    processor = QueryProcessor()
    result = processor.process_query("What does the Bhagavad Gita say about duty?")
    assert result["scripture_preference"] == "bhagavad_gita"
    assert result["needs_clarification"] is False


def test_processor_enhances_greeting_instead_of_clarification():
    processor = QueryProcessor()
    result = processor.process_query("hi")
    assert "teaching" in result["processed_query"].lower()
    assert result["needs_clarification"] is False


def test_processor_enhances_short_non_spiritual_query():
    processor = QueryProcessor()
    result = processor.process_query("ego")
    assert "teaching" in result["processed_query"].lower()


def test_markdown_structure_score():
    text = """# Summary
Brief answer.

# Key Insights
- One
- Two

# Explanation
More detail.

# Practical Takeaways
- Apply this."""
    assert score_markdown_structure(text) == 1.0


def test_readability_penalizes_long_paragraphs():
    long_para = " ".join(["word"] * 200)
    assert score_readability(long_para) < score_readability("Short clear paragraph.")


def test_citation_overlap():
    sources = ["Bhagavad Gita 2.47", "Yoga Sutras 1.2"]
    response = "As taught in Bhagavad Gita 2.47, focus on action."
    assert score_citation_overlap(response, sources) > 0
