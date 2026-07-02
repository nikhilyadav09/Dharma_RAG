import logging

from fastapi import APIRouter, HTTPException, status

from api.schemas.corpus import CorpusStatsResponse
from api.services.corpus_service import get_corpus_stats

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["corpus"])


@router.get(
    "/corpus/stats",
    response_model=CorpusStatsResponse,
    summary="Get verse counts by book",
)
def corpus_stats() -> CorpusStatsResponse:
    try:
        return get_corpus_stats()
    except Exception as exc:
        logger.exception("Failed to load corpus stats: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable",
        ) from exc
