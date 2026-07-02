"""Tests for conversation memory."""

from src.core.conversation_store import ConversationSession, ConversationStore


def test_session_stores_turns():
    store = ConversationStore()
    session = store.get_or_create()
    session.add_turn("What is dharma?", "Dharma is righteous duty.", ["Bhagavad Gita 2.7"])
    assert len(session.turns) == 1
    assert "dharma" in session.context_block().lower()


def test_session_reuses_id():
    store = ConversationStore()
    session = store.get_or_create("test-session")
    assert session.session_id == "test-session"
