import logging

from fastapi import APIRouter, HTTPException, status

from api.schemas.evaluation import EvaluationSummaryResponse
from api.services.evaluation_service import get_evaluation_summary

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["evaluation"])


@router.get(
    "/evaluation/summary",
    response_model=EvaluationSummaryResponse,
    summary="Get latest offline evaluation metrics",
)
def evaluation_summary() -> EvaluationSummaryResponse:
    try:
        return get_evaluation_summary()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Failed to load evaluation summary: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load evaluation summary",
        ) from exc
