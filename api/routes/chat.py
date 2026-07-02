import logging
import time

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from api.dependencies import PipelineDependency
from api.schemas.chat import ChatRequest, ChatResponse
from api.services.response_mapper import map_pipeline_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        500: {"model": ChatResponse, "description": "Pipeline processing error"},
        503: {"description": "RAG pipeline not initialized"},
    },
    summary="Submit a spiritual or philosophical question",
)
async def chat(
    request: ChatRequest,
    pipeline=PipelineDependency,
):
    started = time.perf_counter()
    try:
        raw = await pipeline.process_query(request.query, session_id=request.session_id)
    except Exception as exc:
        logger.exception("Chat request failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    latency_ms = int((time.perf_counter() - started) * 1000)
    response, status_code = map_pipeline_response(raw, request.query, latency_ms)

    if status_code != status.HTTP_200_OK:
        return JSONResponse(status_code=status_code, content=response.model_dump())

    return response
