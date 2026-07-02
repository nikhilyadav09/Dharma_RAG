# Phase 02 — Backend API Foundation

## Phase Summary

Phase 2 added a **thin FastAPI REST layer** around the existing `VedicWisdomPipeline` without modifying any RAG logic. The Streamlit application (`app.py`) remains unchanged and fully functional.

The API exposes five endpoints for health checks, readiness probes, chat, corpus statistics, and evaluation summary. A **singleton pipeline** is initialized once at application startup via FastAPI lifespan hooks.

**Status:** Complete and verified (unit tests + live integration against PostgreSQL).

---

## Files Created

```
api/
├── __init__.py
├── main.py                      # FastAPI app, CORS, router registration
├── dependencies.py              # Singleton pipeline + lifespan
├── routes/
│   ├── __init__.py
│   ├── health.py                # GET /health, GET /ready
│   ├── chat.py                  # POST /api/v1/chat
│   ├── corpus.py                # GET /api/v1/corpus/stats
│   └── evaluation.py            # GET /api/v1/evaluation/summary
├── schemas/
│   ├── __init__.py
│   ├── health.py
│   ├── chat.py
│   ├── corpus.py
│   └── evaluation.py
└── services/
    ├── __init__.py
    ├── response_mapper.py       # Pipeline dict → Pydantic response
    ├── corpus_service.py        # DB verse counts
    └── evaluation_service.py    # Load evaluation_summary_*.json

tests/
└── test_api.py                  # 7 unit tests (mocked pipeline)

docs/phases/
└── PHASE_02_BACKEND_API.md      # This document
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/config/settings.py` | Added `APIConfig` (`API_HOST`, `API_PORT`, `CORS_ORIGINS`) |
| `requirements.txt` | Added `fastapi`, `uvicorn[standard]` |
| `.env.example` | Added API server variables |
| `README.md` | Quick Start step 6 (API), updated project structure |

### Files explicitly NOT modified (RAG core)

```
src/core/pipeline.py
src/core/retriever.py
src/core/generator.py
src/core/query_preprocessor.py
src/core/store_data.py
src/config/prompts.py
src/utils/query_classifier.py
src/evaluation/evaluator.py
src/evaluation/run_evaluation.py
app.py
```

---

## API Endpoints

| Method | Path | Purpose | Success | Failure |
|--------|------|---------|---------|---------|
| `GET` | `/health` | Liveness probe | `200` | — |
| `GET` | `/ready` | Readiness (pipeline + DB) | `200` | `503` |
| `POST` | `/api/v1/chat` | Submit question to RAG pipeline | `200` | `422` / `500` / `503` |
| `GET` | `/api/v1/corpus/stats` | Verse counts by book | `200` | `503` |
| `GET` | `/api/v1/evaluation/summary` | Latest offline eval metrics | `200` | `404` / `500` |

**Documentation URLs (auto-generated):**

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Run command:**

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Request / Response Schemas

### `POST /api/v1/chat`

**Request:**

```json
{
  "query": "What is the purpose of yoga?",
  "session_id": "optional-uuid"
}
```

Validation: `query` required, 1–2000 characters.

**Response (`200` — `wisdom_response`):**

```json
{
  "type": "wisdom_response",
  "query": {
    "original": "What is the purpose of yoga?",
    "processed": "What is the nature of is the purpose of yoga?"
  },
  "answer": {
    "summary": "...",
    "sources": ["Yoga Sutras 1.2", "Bhagavad Gita 6.20"]
  },
  "primary_verse": {
    "id": 42,
    "book": "Yoga Sutras",
    "chapter": 1,
    "verse": "2",
    "sanskrit": "...",
    "translation": "...",
    "explanation": "...",
    "confidence_score": 0.85
  },
  "error": null,
  "metadata": {
    "model": "llama-3.3-70b-versatile",
    "latency_ms": 1240
  }
}
```

**Other success types (all `200`):**

| `type` | Source |
|--------|--------|
| `clarification` | `generator.py` non-philosophical path |
| `clarification_needed` | `pipeline.py` vague query path |
| `no_results` | `pipeline.py` empty retrieval path |

**Error response (`500`):**

When pipeline returns `{"error": "..."}` without a `type` field:

```json
{
  "type": "error",
  "error": "Database connection failed",
  "metadata": { "model": "llama-3.3-70b-versatile", "latency_ms": 12 }
}
```

### `GET /health`

```json
{ "status": "ok", "service": "dharma-api" }
```

### `GET /ready`

```json
{
  "status": "ready",
  "pipeline_initialized": true,
  "database_connected": true
}
```

Returns `503` with detail when pipeline or database is unavailable.

### `GET /api/v1/corpus/stats`

```json
{
  "total_verses": 867,
  "books": [
    { "book": "Bhagavad Gita", "count": 700 },
    { "book": "Yoga Sutras", "count": 167 }
  ]
}
```

### `GET /api/v1/evaluation/summary`

```json
{
  "model_name": "llama-3.3-70b-versatile",
  "average_semantic_similarity": 0.431,
  "average_bleu_score": 0.00176,
  "average_rouge1": 0.0677,
  "average_rouge2": 0.00767,
  "average_rougeL": 0.0497,
  "average_question_match_score": 0.807,
  "num_samples": 10,
  "source_file": "evaluation_summary_llama-3.3-70b-versatile.json"
}
```

---

## Architecture Decisions

### 1. Thin wrapper pattern

All business logic stays in `src/`. The `api/` package only handles:

- HTTP routing and status codes
- Pydantic validation and serialization
- Singleton lifecycle management
- CORS for future Next.js frontend

### 2. Singleton pipeline on startup

`VedicWisdomPipeline` is expensive to initialize (~15s: embedding model + BM25 index + DB connection). It is created **once** in the FastAPI lifespan hook, not per request.

```python
# api/dependencies.py
@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_pipeline()  # creates singleton
    yield
    shutdown_pipeline()
```

### 3. Response mapping in API layer only

`api/services/response_mapper.py` converts the raw pipeline `dict` into typed Pydantic models. This avoids any changes to `pipeline.py` return structure.

### 4. Corpus stats via direct SQL

`corpus_service.py` queries `SELECT book, COUNT(*) FROM verses` using existing `DatabaseConfig`. Does not go through the retriever.

### 5. Evaluation summary from committed JSON

Reads `evaluation_summary_*.json` from project root (latest file by sort). No live eval trigger in this phase.

### 6. Streamlit coexistence

`app.py` is untouched. Streamlit and FastAPI can run simultaneously on different ports, sharing `.env` and PostgreSQL.

### 7. No authentication (v1)

Public endpoints. Groq API keys remain server-side in `.env`. Rate limiting deferred to Phase 6.

---

## Configuration Changes

### New environment variables (`.env.example`)

```env
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### New Python config (`src/config/settings.py`)

```python
class APIConfig:
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", "8000"))
    CORS_ORIGINS = [...]  # comma-separated from CORS_ORIGINS env
```

All existing DB and LLM variables unchanged.

---

## Dependencies Added

```
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
```

Installed into existing virtual environment alongside Streamlit and RAG dependencies.

---

## Build Verification

| Check | Result |
|-------|--------|
| `python -m py_compile api/**/*.py` | Pass |
| `import app` (Streamlit) | Pass — no regression |
| `pytest tests/test_api.py` | 7/7 passed |
| `uvicorn api.main:app` startup | Pass — pipeline singleton initialized |
| `GET /health` | `{"status":"ok"}` |
| `GET /ready` | `pipeline_initialized: true`, `database_connected: true` |
| `GET /api/v1/corpus/stats` | 867 verses (700 Gita + 167 Yoga) |
| `GET /api/v1/evaluation/summary` | Loads committed JSON |
| `POST /api/v1/chat` | Returns `wisdom_response` with real Groq answer |
| Swagger `/docs` | Accessible |

---

## Testing Performed

### Unit tests (`tests/test_api.py`)

- `test_health_endpoint` — liveness always 200
- `test_ready_endpoint` — readiness with mocked DB
- `test_chat_endpoint` — mocked pipeline, validates response shape
- `test_chat_validation_rejects_empty_query` — 422 on empty query
- `test_evaluation_summary_endpoint` — loads real JSON file
- `test_response_mapper_error_type` — pipeline error → 500 mapping
- `test_response_mapper_clarification_needed` — non-wisdom type mapping

### Integration tests (manual curl against live server)

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/ready
curl http://127.0.0.1:8000/api/v1/corpus/stats
curl http://127.0.0.1:8000/api/v1/evaluation/summary
curl -X POST http://127.0.0.1:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the purpose of yoga?"}'
```

All returned expected data.

---

## Remaining Technical Debt

| Item | Notes |
|------|-------|
| Pipeline returns only 1 verse in API | Retriever fetches 5; `related_verses` not exposed yet |
| No SSE streaming endpoint | Deferred to Phase 4 |
| No rate limiting | Deferred to Phase 6 |
| `session_id` accepted but unused | Reserved for future chat sessions |
| Corpus stats opens new DB connection per request | Acceptable for v1; pool later |
| Evaluation summary is static file | Live eval trigger not exposed |
| No Dockerfile for API service | Manual `uvicorn` for now |
| `LLM_MODEL_NAME` in metadata but generator hardcodes model | Pre-existing; not changed in Phase 2 |

---

## Known Limitations

1. **Cold start ~15–20s** — First API request after startup waits for pipeline init (embedding model download/load).
2. **`/ready` returns 503 until pipeline finishes loading** — Use in orchestration health checks.
3. **Chat errors from pipeline return HTTP 500** — Pipeline catches exceptions internally and returns `{"error": ...}`; API maps to 500 JSON body.
4. **CORS limited to localhost:3000 by default** — Update `CORS_ORIGINS` for production frontend URL.
5. **Two Python processes if running Streamlit + API** — Each loads its own pipeline singleton (duplicate memory). Acceptable for dev; consider API-only in production.

---

## Future Phases

| Phase | Focus |
|-------|-------|
| Phase 3 | Next.js frontend foundation (static pages) |
| Phase 4 | Chat UI + optional SSE streaming endpoint |
| Phase 5 | Documentation and portfolio polish |
| Phase 6 | Deployment (Vercel + Railway), rate limiting, Docker |

---

## Handoff Notes

### For Phase 3 (Frontend Foundation)

- API base URL: `http://localhost:8000`
- Set `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- CORS already allows `http://localhost:3000`
- Use `POST /api/v1/chat` for chat page
- Use `GET /api/v1/corpus/stats` for Home page stats
- Use `GET /api/v1/evaluation/summary` for Evaluation page

### For engineers continuing backend work

- **Never import RAG logic into routes directly** — always go through `get_pipeline()` dependency
- **Add new endpoints in `api/routes/`** with schemas in `api/schemas/` and business-adjacent logic in `api/services/`
- **Do not modify `src/core/`** unless fixing a bug; API adapter pattern is intentional
- **Run tests:** `pytest tests/test_api.py -v`
- **Run API:** `uvicorn api.main:app --reload`
- **Run Streamlit:** `streamlit run app.py --server.fileWatcherType none`

### Prerequisites for API to work

Same as Streamlit:

1. `docker compose up -d` (or native PostgreSQL + pgvector)
2. `python scripts/setup_database.py` (one-time seed)
3. Valid `LLM_API_KEY_1` in `.env` for real chat answers

### Response type handling in frontend

Always branch on `response.type`:

```typescript
switch (response.type) {
  case "wisdom_response": // show answer + verse card
  case "clarification":
  case "clarification_needed":
  case "no_results":    // show callout UI
  case "error":           // show error banner
}
```

---

*Phase 2 completed. RAG pipeline untouched. Streamlit functional. API ready for frontend integration.*
