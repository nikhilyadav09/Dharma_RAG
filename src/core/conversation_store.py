"""Lightweight in-memory conversation memory for multi-turn chat."""

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from uuid import uuid4

MAX_TURNS = 10
SESSION_TTL = timedelta(hours=2)


@dataclass
class ConversationTurn:
    query: str
    summary: str
    sources: List[str] = field(default_factory=list)
    primary_ref: Optional[str] = None
    topic: Optional[str] = None


@dataclass
class ConversationSession:
    session_id: str
    turns: List[ConversationTurn] = field(default_factory=list)
    last_accessed: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def add_turn(
        self,
        query: str,
        summary: str,
        sources: Optional[List[str]] = None,
        primary_ref: Optional[str] = None,
    ) -> None:
        self.turns.append(
            ConversationTurn(
                query=query,
                summary=summary[:1200],
                sources=sources or [],
                primary_ref=primary_ref,
                topic=_extract_topic(query, primary_ref),
            )
        )
        if len(self.turns) > MAX_TURNS:
            self.turns = self.turns[-MAX_TURNS:]
        self.last_accessed = datetime.now(timezone.utc)

    def context_block(self) -> str:
        if not self.turns:
            return ""
        lines = ["Recent conversation:"]
        for turn in self.turns[-5:]:
            lines.append(f"User: {turn.query}")
            snippet = turn.summary.replace("\n", " ")[:300]
            lines.append(f"Assistant: {snippet}...")
            if turn.primary_ref:
                lines.append(f"Primary scripture: {turn.primary_ref}")
        return "\n".join(lines)


class ConversationStore:
    """Process-local session store. Suitable for single-instance deployment."""

    def __init__(self):
        self._sessions: Dict[str, ConversationSession] = {}

    def get_or_create(self, session_id: Optional[str] = None) -> ConversationSession:
        self._purge_expired()
        if session_id and session_id in self._sessions:
            session = self._sessions[session_id]
            session.last_accessed = datetime.utcnow()
            return session
        new_id = session_id or str(uuid4())
        session = ConversationSession(session_id=new_id)
        self._sessions[new_id] = session
        return session

    def has_context(self, session_id: str) -> bool:
        session = self._sessions.get(session_id)
        return bool(session and session.turns)

    def _purge_expired(self) -> None:
        cutoff = datetime.now(timezone.utc) - SESSION_TTL
        expired = [
            sid for sid, s in self._sessions.items() if s.last_accessed < cutoff
        ]
        for sid in expired:
            del self._sessions[sid]


_store: Optional[ConversationStore] = None


def get_conversation_store() -> ConversationStore:
    global _store
    if _store is None:
        _store = ConversationStore()
    return _store


def _extract_topic(query: str, primary_ref: Optional[str]) -> Optional[str]:
    if primary_ref:
        return primary_ref.split()[0]
    words = [w for w in query.lower().split() if len(w) > 3]
    return words[0] if words else None
