# DHARMA — Divine Healing And Reflective Mindfulness Assistant

Production-quality RAG system for spiritual and philosophical guidance from the **Bhagavad Gita** and **Yoga Sutras**.

**Live Demo:** [dharma.nikhilyadav.dev](https://dharma.nikhilyadav.dev)  
**API:** [api.dharma.nikhilyadav.dev](https://api.dharma.nikhilyadav.dev/health)

---

## Screenshots

<!-- TODO: Add screenshot — Home page -->
<!-- TODO: Add screenshot — Chat with structured answer -->
<!-- TODO: Add screenshot — Source cards and related questions -->

## Demo Video

<!-- TODO: Add demo video link (YouTube / Loom) -->

---

## Features

| Capability | Detail |
|------------|--------|
| **Hybrid retrieval** | BGE embeddings + BM25 + score fusion + cross-encoder reranking |
| **Metadata lookup** | Direct chapter/verse resolution before semantic search |
| **Intent routing** | 15+ query intents → dynamic answer templates |
| **Adaptive answers** | Length scales with complexity (100–500 words) |
| **Inline citations** | References woven into prose, e.g. (Bhagavad Gita 2.47) |
| **Multi-turn memory** | Session-based conversation context (last 10 turns) |
| **Related questions** | 3 AI-generated follow-up chips per answer |
| **Structured Markdown** | Intent-specific sections — not one-size-fits-all |
| **Source cards** | Primary / Supporting / Related teachings with scripture badges |
| **Evaluation pipeline** | Faithfulness, structure, readability, citation quality |
| **FastAPI + Next.js** | Modern REST API and responsive TypeScript UI |

---

## Architecture

```
User → Next.js (Vercel)
         ↓ POST /api/v1/chat
       FastAPI (Render)
         ↓
       VedicWisdomPipeline
         ├── QueryProcessor + Intent Router
         ├── MetadataRetriever (chapter/verse lookup)
         ├── VedicKnowledgeRetriever (hybrid + rerank)
         ├── ConversationStore (multi-turn memory)
         └── WisdomResponseGenerator (Groq LLM)
         ↓
       Neon PostgreSQL + pgvector (867 verses)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and phase docs in [`docs/phases/`](docs/phases/).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS — **Vercel** |
| API | FastAPI, Pydantic — **Render (Docker)** |
| Database | PostgreSQL 16 + pgvector — **Neon** |
| Embeddings | BAAI/bge-small-en-v1.5 |
| LLM | Groq — llama-3.3-70b-versatile |
| Local dev | Docker Compose |

---

## Quick Start (Local)

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker & Docker Compose
- Groq API key ([free](https://console.groq.com))

### 1. Clone and install

```bash
git clone https://github.com/nikhilyadav09/Dharma_RAG.git
cd Dharma_RAG
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure

```bash
cp .env.example .env
# Set LLM_API_KEY_1=gsk_your_key
```

### 3. Database + API + Frontend

```bash
docker compose up -d
python scripts/setup_database.py
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

cd frontend && npm install
cp env.local.example .env.local
npm run dev
```

Open http://localhost:3000

---

## Deployment

Full step-by-step guide: **[DEPLOYMENT.md](DEPLOYMENT.md)**

| Step | Service | URL |
|------|---------|-----|
| 1 | Neon PostgreSQL + pgvector | Seed with `scripts/seed_production_db.py` |
| 2 | Render (Docker API) | `api.dharma.nikhilyadav.dev` |
| 3 | Vercel (frontend) | `dharma.nikhilyadav.dev` |
| 4 | DNS | CNAME records for both subdomains |

---

## API

```bash
# Health
curl https://api.dharma.nikhilyadav.dev/health
curl https://api.dharma.nikhilyadav.dev/ready

# Chat
curl -X POST https://api.dharma.nikhilyadav.dev/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is karma yoga?"}'
```

Docs (local): http://localhost:8000/docs

---

## Evaluation & Tests

```bash
python -m pytest tests/ -q          # 33 tests
python -m src.evaluation.run_evaluation
cd frontend && npm run build
```

---

## Project Structure

```
Dharma_RAG/
├── api/                    # FastAPI routes
├── frontend/               # Next.js (deploy to Vercel)
├── src/                    # RAG pipeline
├── scripts/                # DB setup + production seed
├── Dockerfile              # Render deployment
├── render.yaml             # Render Blueprint
├── DEPLOYMENT.md           # Production deploy guide
├── docs/phases/            # Phase 01–10 docs
└── tests/
```

---

## Development Phases

| Phase | Focus |
|-------|-------|
| 01–02 | Stabilization, FastAPI backend |
| 03–05 | Next.js frontend, API integration |
| 06–07 | Product UX polish |
| 08 | Retrieval & intelligence optimization |
| 09 | Production polish, multi-turn, intent routing |
| **10** | **Production deployment** |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| DB connection refused (local) | `docker compose up -d` |
| Empty answers | Set valid `LLM_API_KEY_1` |
| API 503 on `/ready` | Wait for cold start (~60s on Render free) |
| CORS error (production) | Match `CORS_ORIGINS` to frontend URL exactly |

---

## License

MIT — see [LICENSE](LICENSE)

## Author

**Nikhil Yadav** — [Portfolio](https://nikhilyadav.dev) · [GitHub](https://github.com/nikhilyadav09/Dharma_RAG)
