import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.dependencies import lifespan
from api.routes import chat, corpus, evaluation, health
from src.config.settings import APIConfig

logger = logging.getLogger(__name__)

app = FastAPI(
    title="DHARMA API",
    description=(
        "REST API for DHARMA (Divine Healing And Reflective Mindfulness Assistant). "
        "Wraps the existing VedicWisdomPipeline without modifying RAG logic."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=APIConfig.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(corpus.router)
app.include_router(evaluation.router)

logger.info("DHARMA API routes registered")


@app.get("/", include_in_schema=False)
def root():
    return {
        "service": "dharma-api",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "ready": "/ready",
    }
