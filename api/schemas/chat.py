from typing import Literal, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    session_id: Optional[str] = Field(default=None, max_length=64)


class QueryInfo(BaseModel):
    original: str
    processed: str


class AnswerContent(BaseModel):
    summary: str
    sources: list[str] = Field(default_factory=list)


class VerseDetail(BaseModel):
    id: Optional[int] = None
    book: str
    chapter: int | str
    verse: int | str
    sanskrit: Optional[str] = None
    translation: Optional[str] = None
    explanation: Optional[str] = None
    confidence_score: Optional[float] = None


class ResponseMetadata(BaseModel):
    model: Optional[str] = None
    latency_ms: int


ResponseType = Literal[
    "wisdom_response",
    "clarification",
    "clarification_needed",
    "no_results",
    "error",
]


class ChatResponse(BaseModel):
    type: ResponseType
    query: Optional[QueryInfo] = None
    answer: Optional[AnswerContent] = None
    primary_verse: Optional[VerseDetail] = None
    error: Optional[str] = None
    metadata: Optional[ResponseMetadata] = None
