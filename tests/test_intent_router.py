"""Tests for intent routing."""

from src.utils.intent_router import detect_intent, words_to_max_tokens


def test_detect_comparison_intent():
    result = detect_intent("Compare karma yoga and bhakti yoga")
    assert result["intent"] == "comparison"
    assert result["complexity"] == "complex"


def test_detect_practice_intent():
    result = detect_intent("How do I practice meditation daily?")
    assert result["intent"] == "practice"


def test_detect_greeting():
    result = detect_intent("Hello")
    assert result["intent"] == "greeting"


def test_follow_up_detection():
    result = detect_intent("Explain more about that", has_conversation=True)
    assert result["is_follow_up"] is True


def test_words_to_max_tokens():
    assert words_to_max_tokens((100, 150)) >= 200
