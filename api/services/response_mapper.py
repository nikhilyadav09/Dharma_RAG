import logging
from typing import Any, Optional

from api.schemas.chat import (
    AnswerContent,
    ChatResponse,
    QueryInfo,
    ResponseMetadata,
    ResponseType,
    VerseDetail,
)
from src.config.settings import LLMConfig

logger = logging.getLogger(__name__)


def _map_verse(raw: Optional[dict[str, Any]]) -> Optional[VerseDetail]:
    if not raw:
        return None
    return VerseDetail(
        id=raw.get("id"),
        book=str(raw.get("book", "Unknown")),
        chapter=raw.get("chapter", "?"),
        verse=raw.get("verse", "?"),
        sanskrit=raw.get("sanskrit"),
        translation=raw.get("translation"),
        explanation=raw.get("explanation"),
        confidence_score=raw.get("confidence_score"),
    )


def _build_query_info(
    raw: dict[str, Any],
    fallback_query: str,
) -> QueryInfo:
    query_info = raw.get("query_info") or {}
    return QueryInfo(
        original=query_info.get("original", fallback_query),
        processed=query_info.get("processed", fallback_query),
    )


def map_pipeline_response(
    raw: dict[str, Any],
    request_query: str,
    latency_ms: int,
) -> tuple[ChatResponse, int]:
    """Convert pipeline dict output into API response model and HTTP status."""
    metadata = ResponseMetadata(
        model=LLMConfig.MODEL_NAME,
        latency_ms=latency_ms,
    )

    if "error" in raw and "type" not in raw:
        return (
            ChatResponse(
                type="error",
                error=str(raw["error"]),
                metadata=metadata,
            ),
            500,
        )

    response_type: ResponseType = raw.get("type", "error")
    response_body = raw.get("response") or {}
    summary = response_body.get("summary", "")
    sources = response_body.get("sources") or []
    related_questions = response_body.get("related_questions") or []

    if response_type == "error":
        return (
            ChatResponse(
                type="error",
                error=summary or "An unknown error occurred",
                metadata=metadata,
            ),
            500,
        )

    query_info = _build_query_info(raw, request_query)
    answer = AnswerContent(
        summary=summary,
        sources=sources,
        related_questions=related_questions,
    )
    primary_verse = _map_verse(raw.get("verse"))

    return (
        ChatResponse(
            type=response_type,
            query=query_info,
            answer=answer,
            primary_verse=primary_verse,
            metadata=metadata,
            session_id=raw.get("session_id"),
        ),
        200,
    )
