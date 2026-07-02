# syntax=docker/dockerfile:1

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/app/.cache/huggingface

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-prod.txt .
RUN pip install --upgrade pip && pip install -r requirements-prod.txt

# Pre-download NLTK data and embedding model at build time (reduces cold-start failures)
RUN python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('punkt_tab', quiet=True); nltk.download('stopwords', quiet=True)"
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-small-en-v1.5')"

COPY api/ api/
COPY src/ src/
COPY data/ data/
COPY scripts/ scripts/

EXPOSE 8000

# Render sets PORT; default to 8000 for local Docker runs
CMD uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000}
