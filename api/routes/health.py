from fastapi import APIRouter, status

from api.dependencies import get_pipeline_error, is_pipeline_ready
from api.schemas.health import HealthResponse, ReadyResponse
from api.services.corpus_service import check_database_connection

router = APIRouter(tags=["health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness probe",
)
def health() -> HealthResponse:
    return HealthResponse(status="ok", service="dharma-api")


@router.get(
    "/ready",
    response_model=ReadyResponse,
    summary="Readiness probe",
)
def ready() -> ReadyResponse:
    pipeline_initialized = is_pipeline_ready()
    database_connected = check_database_connection()
    is_ready = pipeline_initialized and database_connected

    response = ReadyResponse(
        status="ready" if is_ready else "not_ready",
        pipeline_initialized=pipeline_initialized,
        database_connected=database_connected,
    )

    if not is_ready:
        detail = {
            "status": response.status,
            "pipeline_initialized": pipeline_initialized,
            "database_connected": database_connected,
        }
        if not pipeline_initialized and get_pipeline_error():
            detail["pipeline_error"] = get_pipeline_error()

        from fastapi import HTTPException

        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)

    return response
