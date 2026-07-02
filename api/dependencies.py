import logging
import threading
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING, Optional

from fastapi import Depends, FastAPI, HTTPException, status

if TYPE_CHECKING:
    from src.core.pipeline import VedicWisdomPipeline

logger = logging.getLogger(__name__)

_pipeline: Optional["VedicWisdomPipeline"] = None
_pipeline_error: Optional[str] = None
_init_lock = threading.Lock()


def _lazy_initialize_pipeline() -> bool:
    """Create the singleton pipeline on first use. Returns True if ready."""
    global _pipeline, _pipeline_error

    if _pipeline is not None:
        return True

    with _init_lock:
        if _pipeline is not None:
            return True

        try:
            # Import deferred: uvicorn binds the port before loading torch/ML.
            from src.core.pipeline import VedicWisdomPipeline

            logger.info("Lazy-initializing VedicWisdomPipeline...")
            _pipeline = VedicWisdomPipeline()
            _pipeline_error = None
            logger.info("VedicWisdomPipeline ready")
            return True
        except Exception as exc:
            _pipeline = None
            _pipeline_error = str(exc)
            logger.exception(
                "Failed to initialize VedicWisdomPipeline: %s", exc
            )
            return False


def shutdown_pipeline() -> None:
    """Clear the singleton pipeline reference on application shutdown."""
    global _pipeline, _pipeline_error
    with _init_lock:
        _pipeline = None
        _pipeline_error = None
    logger.info("VedicWisdomPipeline shutdown complete")


def is_pipeline_ready() -> bool:
    """True only after the pipeline has been successfully initialized."""
    return _pipeline is not None


def get_pipeline_error() -> Optional[str]:
    return _pipeline_error


def get_pipeline() -> "VedicWisdomPipeline":
    """FastAPI dependency: lazy init, then return the singleton pipeline."""
    if not _lazy_initialize_pipeline():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=_pipeline_error or "RAG pipeline is not initialized",
        )
    return _pipeline


PipelineDependency = Depends(get_pipeline)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Application lifespan — pipeline is initialized lazily on first use."""
    logger.info("DHARMA API startup complete (pipeline loads on first chat)")
    yield
    shutdown_pipeline()
