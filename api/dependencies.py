import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status

from src.core.pipeline import VedicWisdomPipeline

logger = logging.getLogger(__name__)

_pipeline: Optional[VedicWisdomPipeline] = None
_pipeline_error: Optional[str] = None


def initialize_pipeline() -> None:
    """Create the singleton RAG pipeline instance."""
    global _pipeline, _pipeline_error
    try:
        logger.info("Initializing VedicWisdomPipeline singleton...")
        _pipeline = VedicWisdomPipeline()
        _pipeline_error = None
        logger.info("VedicWisdomPipeline ready")
    except Exception as exc:
        _pipeline = None
        _pipeline_error = str(exc)
        logger.exception("Failed to initialize VedicWisdomPipeline: %s", exc)


def shutdown_pipeline() -> None:
    """Clear the singleton pipeline reference on application shutdown."""
    global _pipeline, _pipeline_error
    _pipeline = None
    _pipeline_error = None
    logger.info("VedicWisdomPipeline shutdown complete")


def is_pipeline_ready() -> bool:
    return _pipeline is not None


def get_pipeline_error() -> Optional[str]:
    return _pipeline_error


def get_pipeline() -> VedicWisdomPipeline:
    """FastAPI dependency that returns the singleton pipeline."""
    if _pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=_pipeline_error or "RAG pipeline is not initialized",
        )
    return _pipeline


PipelineDependency = Depends(get_pipeline)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_pipeline()
    yield
    shutdown_pipeline()
