# Phase 11 — Render Deployment Fix (Import-Time Blocking)

## Summary

Render deployments timed out after **~15 minutes** with **no uvicorn logs** (`Started server process`, `Uvicorn running...`). The Docker image built successfully, but the container never reached a listening HTTP server.

**Root cause:** Phase 10 made pipeline *initialization* lazy inside `lifespan()`, but **`VedicWisdomPipeline` was still imported at module load time** in the API layer. Uvicorn imports `api.main:app` before binding the port; that import chain eagerly loaded `torch`, `sentence-transformers`, and synchronous `nltk.download()` calls — blocking or OOM-killing the process on Render's 512MB free tier before any server logs appeared.

**Fix:** Defer all `src.core.*` imports until the first chat request; add explicit startup script logging; install CPU-only PyTorch in Docker; pre-cache NLTK and embedding model at image build time.

**Status:** Complete — 37 tests passing, Docker `build` + `run` verified locally.

---

## Root Cause (Exact)

### What Render observed

```
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default...
(then silence for ~15 minutes)
Timed Out
```

No FastAPI/uvicorn output means the process died or hung **during Python module import**, before uvicorn's first log line.

### Import chain before fix

```
uvicorn loads api.main:app
  → api.dependencies  (top-level: from src.core.pipeline import VedicWisdomPipeline)
  → api.routes.chat   (top-level: from src.core.pipeline import VedicWisdomPipeline)
    → src.core.pipeline
      → src.core.retriever   (torch, SentenceTransformer, nltk.download at import)
      → src.core.generator   (nltk.download at import)
      → src.core.query_preprocessor (nltk.download at import)
```

Phase 10 only removed `initialize_pipeline()` from `lifespan()`. **Importing the class still runs the entire ML stack at startup.**

On Render free tier this typically results in:

1. **OOM kill** — CUDA PyTorch + transformers exceeds ~512MB RAM during import
2. **Indefinite hang** — network NLTK downloads or HuggingFace cache writes at import time
3. **No port opened** — uvicorn never finishes loading the app module → Render health check times out

### Why Phase 10 was insufficient

| Layer | Phase 10 fix | Still broken |
|-------|--------------|--------------|
| `lifespan()` | No longer blocks on pipeline init | ✓ |
| Module imports | Unchanged — still imported pipeline at top of `dependencies.py` and `chat.py` | ✗ |
| Docker CMD | Correct (`0.0.0.0`, `${PORT:-8000}`) | ✓ but no pre-start logging |
| PyTorch variant | Default pip pulled **CUDA torch** (~2GB+ NVIDIA wheels) | ✗ for 512MB instances |

---

## Files Modified

| File | Change | Why | Local dev impact |
|------|--------|-----|------------------|
| `api/dependencies.py` | Move `VedicWisdomPipeline` import inside `_lazy_initialize_pipeline()`; `TYPE_CHECKING` for hints | Prevents ML stack load when uvicorn imports app | None — same `get_pipeline()` API |
| `api/routes/chat.py` | Remove top-level `VedicWisdomPipeline` import | Breaks import chain from route registration | None |
| `api/main.py` | Log line after routes registered | Confirms module load completed | None |
| `scripts/start_api.sh` | Explicit startup banner + `exec uvicorn` with `${PORT:-8000}` | Render logs show progress before uvicorn; correct PORT expansion | Optional for local dev |
| `Dockerfile` | CPU torch, `PYTHONPATH`, `HF_HOME`, thread limits, NLTK/model pre-cache, `start_api.sh` CMD | Smaller image, no import-time downloads, Render memory safety | Docker-only |
| `requirements-prod.txt` | Remove `torch` line (installed in Dockerfile) | Avoid CUDA torch reinstall | `requirements.txt` unchanged for local |
| `.dockerignore` | Allow `evaluation_summary_*.json` in image | `/api/v1/evaluation/summary` works in production | None |
| `tests/test_startup_imports.py` | Guard against eager `src.core` imports in `api/` | Regression test | None |
| `tests/test_api.py` | Patch `src.core.pipeline.VedicWisdomPipeline` | Matches deferred import location | None |

---

## Why Deployment Failed

1. **Eager imports** — Python loads all top-level imports before uvicorn binds `$PORT`
2. **Heavy ML at import** — `torch` + `sentence-transformers` + `nltk.download()` in `src/core/*`
3. **CUDA PyTorch in image** — default `pip install torch` pulled NVIDIA CUDA wheels unsuitable for Render CPU instances
4. **No startup logs** — when the process OOM'd during import, Render showed zero application output

---

## Why the Fix Works

```
Render starts container
    ↓
scripts/start_api.sh prints banner (visible in Render logs)
    ↓
uvicorn imports api.main:app
    → only lightweight modules (FastAPI, routes, settings)
    → NO torch / sentence-transformers import
    ↓
lifespan yields immediately
    ↓
uvicorn binds 0.0.0.0:$PORT  ← "Uvicorn running..." appears
    ↓
GET /health → 200 (Render deploy succeeds)
    ↓
(first POST /api/v1/chat)
    → _lazy_initialize_pipeline() imports src.core.pipeline
    → loads models (60–90s cold start, acceptable)
```

---

## Render Compatibility Notes

| Setting | Value | Notes |
|---------|-------|-------|
| Runtime | Docker | `render.yaml` `runtime: docker` |
| Health check | `/health` | Must NOT be `/ready` (503 until first chat) |
| `PORT` | Injected by Render | Expanded in `scripts/start_api.sh` |
| `WEB_CONCURRENCY=1` | Render default | Harmless for Docker CMD (not gunicorn) |
| `ENABLE_RERANKER` | `false` | Recommended on free tier (saves ~80MB RAM) |
| `DB_SSLMODE` | `require` | Required for Neon |
| `HF_HOME` | `/app/.cache/huggingface` | Set in Dockerfile; model pre-cached at build |
| Memory | 512MB free tier | CPU torch + `ENABLE_RERANKER=false` required |

### Required Render environment variables

- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `LLM_API_KEY_1`
- `CORS_ORIGINS` (e.g. `https://dharma.nikhilyadav.dev`)
- `DB_SSLMODE=require`
- `ENABLE_RERANKER=false`

---

## Local Docker Verification

```bash
# Build (CPU torch — ~5–10 min first time)
docker build -t dharma-api .

# Run
docker run --rm -p 8000:8000 dharma-api

# In another terminal — should return 200 within ~10 seconds
curl http://localhost:8000/health
# {"status":"ok","service":"dharma-api"}

# Verify PORT expansion
docker run --rm -e PORT=9000 -p 9000:9000 dharma-api
curl http://localhost:9000/health

# Expected logs
# ==========================================
# DHARMA API starting
# Host: 0.0.0.0  Port: 8000
# ...
# INFO:     Started server process [1]
# INFO:     Application startup complete.
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Automated checklist

```bash
bash scripts/verify_local_deployment.sh
```

---

## Production Verification (Render)

After redeploy:

1. **Build logs** — Docker build completes; NLTK + BGE model download steps succeed
2. **Deploy logs** — See `DHARMA API starting` banner within seconds
3. **Deploy logs** — See `Uvicorn running on http://0.0.0.0:XXXX`
4. **Deploy status** — "Live" (not "Timed Out")
5. **Health** — `curl https://api.dharma.nikhilyadav.dev/health` → 200
6. **Ready (optional)** — `/ready` → 503 with `pipeline_initialized: false` (expected)
7. **Chat** — First `POST /api/v1/chat` may take 60–90s; subsequent requests faster
8. **Ready after chat** — `/ready` → 200 if DB credentials correct

---

## Remaining Risks

| Risk | Mitigation |
|------|------------|
| First chat cold start (60–90s) | Expected; warm instance with periodic health pings if needed |
| 512MB OOM on first chat | Keep `ENABLE_RERANKER=false`; upgrade Render plan if needed |
| Neon DB unreachable | `/health` still 200; `/ready` and chat return 503 — set correct `DB_*` env vars |
| HuggingFace rate limits at build | Model cached in image layer; rebuild rarely |
| `nltk.download()` at pipeline init | NLTK data pre-cached in Docker build; local `.env` dev unchanged |

---

## Audit Checklist (All Verified)

| Check | Status |
|-------|--------|
| uvicorn installed (`requirements-prod.txt`) | ✓ |
| FastAPI installed | ✓ |
| Docker CMD uses `0.0.0.0` + PORT expansion | ✓ (`scripts/start_api.sh`) |
| Application binds `0.0.0.0` | ✓ |
| Docker context copies `api/`, `src/`, `data/`, `scripts/` | ✓ |
| No failing imports at API startup | ✓ (`tests/test_startup_imports.py`) |
| Startup does not block on pipeline | ✓ |
| Missing env vars do not crash import | ✓ (`settings.py` uses defaults) |
| Neon connection not attempted at startup | ✓ (only on `/ready` or chat) |
| HuggingFace cache path valid | ✓ (`HF_HOME=/app/.cache/huggingface`) |
| Embedding model pre-cached at build | ✓ |
| `/health` returns 200 immediately | ✓ (Docker verified) |
| CPU PyTorch for Render | ✓ |

---

## Mental Walkthrough: Render Deploy Start to Finish

1. **Git push** → Render pulls repo
2. **Docker build** → installs CPU torch, prod deps, downloads NLTK + BGE model into image
3. **Image push** → smaller than CUDA variant; faster pull
4. **Container start** → `sh scripts/start_api.sh`
5. **Banner logged** → confirms shell + Python running
6. **uvicorn imports `api.main`** → lightweight only, no torch
7. **lifespan completes** → instant
8. **Port bound on `$PORT`** → Render detects open port
9. **`GET /health`** → 200 → deploy marked Live
10. **User chats** → lazy pipeline init → models already in image cache → response

Nothing in this path blocks before step 8.

---

*Redeploy to Render with health check path `/health`. Confirm deploy logs show the startup banner and uvicorn lines.*
