# DHARMA — Divine Healing And Reflective Mindfulness Assistant

Production-quality RAG system for spiritual and philosophical guidance from the **Bhagavad Gita** and **Yoga Sutras**.

DHARMA combines hybrid retrieval (pgvector + BM25 + cross-encoder reranking), intent-aware prompt routing, multi-turn conversation memory, and a polished Next.js frontend — designed as a portfolio-grade full-stack AI product.

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
User → Next.js Chat UI
         ↓ POST /api/v1/chat { query, session_id }
       FastAPI
         ↓
       VedicWisdomPipeline
         ├── QueryProcessor (clean, scripture detect)
         ├── MetadataRetriever (chapter/verse direct lookup)
         ├── VedicKnowledgeRetriever (hybrid + rerank)
         ├── ConversationStore (multi-turn memory)
         └── WisdomResponseGenerator (intent templates → Groq LLM)
         ↓
       PostgreSQL + pgvector (867 verses)
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and phase docs in [`docs/phases/`](docs/phases/).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, react-markdown |
| API | FastAPI, Pydantic |
| RAG | sentence-transformers, rank-bm25, NLTK |
| Embeddings | BAAI/bge-small-en-v1.5 (384-dim, normalized) |
| Reranker | cross-encoder/ms-marco-MiniLM-L6-v2 |
| LLM | Groq — llama-3.3-70b-versatile (free tier) |
| Database | PostgreSQL 16 + pgvector |
| Infra | Docker Compose |

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- Groq API key ([free](https://console.groq.com))
- 8 GB RAM recommended

### 1. Clone and install

```bash
git clone https://github.com/nikhilyadav09/Dharma_RAG.git
cd Dharma_RAG

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Set LLM_API_KEY_1=gsk_your_key
```

### 3. Start database

```bash
docker compose up -d
```

### 4. Seed verses (one-time, ~2–5 min)

```bash
python scripts/setup_database.py
```

### 5. Start API

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

- Docs: http://localhost:8000/docs
- Health: `GET /health` · Ready: `GET /ready`

### 6. Start frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open http://localhost:3000

---

## API

### `POST /api/v1/chat`

```json
{
  "query": "What is karma yoga?",
  "session_id": "optional-uuid-for-multi-turn"
}
```

```json
{
  "type": "wisdom_response",
  "session_id": "abc-123",
  "answer": {
    "summary": "# Summary\n\n...",
    "sources": ["Bhagavad Gita 2.47"],
    "related_questions": [
      "Why is detachment important?",
      "How does Patanjali define yoga?",
      "What is the nature of the self?"
    ]
  },
  "primary_verse": { "book": "Bhagavad Gita", "chapter": 2, "verse": "47", "..." },
  "metadata": { "model": "llama-3.3-70b-versatile", "latency_ms": 3200 }
}
```

All new fields are **optional** — existing clients remain compatible.

---

## Evaluation

```bash
python -m src.evaluation.run_evaluation
python scripts/benchmark_retrieval.py
python -m pytest tests/ -q
```

Metrics include: semantic similarity, ROUGE, markdown structure, readability, citation overlap, groundedness proxy, answer length, verse diversity.

---

## Project Structure

```
Dharma_RAG/
├── api/                    # FastAPI routes, schemas, services
├── frontend/               # Next.js application
├── src/
│   ├── config/             # Settings, dynamic prompts
│   ├── core/               # Pipeline, retriever, generator, memory
│   ├── utils/              # Intent router, scripture detection
│   └── evaluation/         # Quality metrics + benchmarks
├── scripts/                # DB setup, retrieval benchmarks
├── tests/                  # 33 unit + API tests
├── docs/phases/            # Phase 01–09 engineering docs
├── data/                   # Source CSV datasets
└── docker-compose.yml
```

---

## Deployment

DHARMA is ready for deployment after Phase 09. Recommended stack:

1. **API** — containerize with `uvicorn api.main:app`, expose port 8000
2. **Frontend** — `npm run build && npm start` or Vercel
3. **Database** — managed PostgreSQL with pgvector extension
4. **Env** — set `LLM_API_KEY_1`, `DB_*`, `CORS_ORIGINS`, `NEXT_PUBLIC_API_URL`

See [`docs/phases/PHASE_09_PRODUCTION_POLISH.md`](docs/phases/PHASE_09_PRODUCTION_POLISH.md) for the deployment readiness checklist.

---

## Development Phases

| Phase | Focus |
|-------|-------|
| 01–02 | Stabilization, FastAPI backend |
| 03–05 | Next.js frontend, API integration |
| 06–07 | Product UX polish |
| 08 | Retrieval & intelligence optimization |
| 09 | Production polish, multi-turn, intent routing |

---

## Performance

| Metric | Typical value |
|--------|---------------|
| Verses indexed | 867 (700 Gita + 167 Yoga Sutras) |
| Cold start | ~30–40s (model loading) |
| Query latency | 3–8s (retrieval + LLM) |
| Tests | 33 passing |
| Frontend build | ✓ |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| DB connection refused | `docker compose up -d` then restart API |
| Empty answers | Set valid `LLM_API_KEY_1` in `.env` |
| Stale retrieval | Re-run `python scripts/setup_database.py` |
| API 503 | Wait for pipeline init; check `GET /ready` |

---

## License

MIT — see [LICENSE](LICENSE)

## Author

Nikhil Yadav — [GitHub](https://github.com/nikhilyadav09/Dharma_RAG)

## Acknowledgments

Groq (LLM inference), Hugging Face (embeddings), translators of the Bhagavad Gita and Yoga Sutras.
