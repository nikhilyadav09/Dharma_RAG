# Phase 10 — Render Startup Fix (Lazy Pipeline Initialization)

## Summary

Render deployments failed with **"Waiting for application startup"** and **"No open ports detected"** because FastAPI blocked startup while `VedicWisdomPipeline` loaded ML models, connected to the database, and built BM25 indexes inside the lifespan hook.

**Fix:** Lazy, thread-safe singleton initialization on first pipeline use. The API now binds its port immediately; heavy work runs on the first `/api/v1/chat` request.

**Status:** Complete — 35 tests passing, flake8 clean, local startup verified.

---

## Root Cause

```python
# Before (api/dependencies.py)
@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_pipeline()  # blocks for 30–90+ seconds
    yield
```

`VedicWisdomPipeline.__init__()` performs:

1. Load `sentence-transformers` embedding model (BGE)
2. Connect to PostgreSQL and run semantic index setup
3. Load all 867 verses into memory for BM25
4. Optionally load cross-encoder reranker

Render's health check expects the process to **open a port within a short timeout**. While lifespan runs synchronously, uvicorn never finishes startup → Render reports no open ports → deploy fails.

`/health` was never reachable because the app had not finished starting.

---

## Solution

Replace eager lifespan initialization with **lazy singleton initialization**:

| Behavior | Before | After |
|----------|--------|-------|
| App startup | Blocked until pipeline ready | Immediate |
| Port binding | Delayed 30–90s | Within seconds |
| Pipeline creation | `lifespan()` | First `get_pipeline()` call |
| Thread safety | N/A | `threading.Lock` + double-check |
| Init failure | Set at startup | HTTP 503 on first pipeline request |
| `/health` | Unreachable during init | Always 200 |
| `/ready` | Required pipeline at startup | `pipeline_initialized: false` until first chat |

### Flow (after fix)

```
Render starts container
    ↓
uvicorn binds PORT (fast)
    ↓
GET /health → 200 ✓  (Render health check passes)
    ↓
(first user request)
POST /api/v1/chat → get_pipeline() → lazy init → response
```

---

## Changes

### `api/dependencies.py`

- Removed `initialize_pipeline()` call from `lifespan()`
- Added `_lazy_initialize_pipeline()` with `threading.Lock`
- `get_pipeline()` triggers lazy init, returns 503 on failure
- `is_pipeline_ready()` returns `True` only after successful init
- `shutdown_pipeline()` clears state on app shutdown (unchanged)

### `tests/test_api.py`

- Added `test_ready_before_pipeline_init` — `/ready` returns 503 before first chat
- Updated `test_ready_endpoint` — initializes pipeline via chat first
- Added `test_get_pipeline_returns_503_when_init_fails`

### Unchanged

- All API routes (`chat.py`, `health.py`, etc.)
- `PipelineDependency = Depends(get_pipeline)` interface
- RAG pipeline logic (`src/core/pipeline.py`)
- Frontend

---

## Files Modified

| File | Change |
|------|--------|
| `api/dependencies.py` | Lazy thread-safe singleton init |
| `tests/test_api.py` | Tests for lazy init behavior |
| `docs/phases/PHASE_10_RENDER_STARTUP_FIX.md` | This document |

---

## Why Render Now Works

1. **Port opens immediately** — lifespan no longer blocks on ML model loading
2. **Health check passes** — `GET /health` returns 200 without touching the pipeline
3. **Render marks deploy successful** — process is listening on `$PORT`
4. **First chat request pays the cold-start cost** — acceptable for free tier (users expect ~60s first query)
5. **`/ready` stays honest** — returns 503 with `pipeline_initialized: false` until first successful init

### Recommended Render settings

| Setting | Value |
|---------|-------|
| Health check path | `/health` |
| Not `/ready` | `/ready` returns 503 until first chat (by design) |

---

## Verification

```bash
# Tests
.venv/bin/python -m pytest tests/ -q
# 35 passed

# Lint
.venv/bin/python -m flake8 api/dependencies.py tests/test_api.py
# (clean)

# Local startup (API binds before pipeline loads)
uvicorn api.main:app --host 127.0.0.1 --port 8765
curl http://127.0.0.1:8765/health        # 200 immediately
curl http://127.0.0.1:8765/ready         # 503, pipeline_initialized: false
curl -X POST .../api/v1/chat ...         # triggers lazy init
curl http://127.0.0.1:8765/ready         # 200 after successful init
```

---

## Known Behavior After Fix

| Endpoint | Before first chat | After first chat |
|----------|-------------------|------------------|
| `GET /health` | 200 | 200 |
| `GET /ready` | 503 (`pipeline_initialized: false`) | 200 (if DB up) |
| `POST /api/v1/chat` | Slow (init + inference) | Normal latency |

First chat request on Render may take **60–90 seconds** (model load + inference). Subsequent requests are faster while the instance stays warm.

---

*Fix applied — redeploy to Render with health check path `/health`.*
