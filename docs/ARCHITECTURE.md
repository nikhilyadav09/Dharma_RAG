# DHARMA Architecture

High-level system design for the DHARMA RAG application.

## Overview

```
Browser (Next.js) → FastAPI → VedicWisdomPipeline → PostgreSQL/pgvector
                                      ↓
                                   Groq LLM
```

DHARMA follows **clean separation of concerns**:

| Layer | Responsibility |
|-------|----------------|
| **Frontend** | UI, markdown rendering, API consumption |
| **API** | HTTP transport, validation, response mapping |
| **Pipeline** | RAG orchestration (unchanged since initial implementation) |
| **Database** | Verse storage and vector search |

## Request flow

1. User submits a question on `/chat`
2. Frontend `POST /api/v1/chat`
3. FastAPI invokes `VedicWisdomPipeline.process_query()`
4. Pipeline preprocesses query, retrieves verses, generates answer
5. Response mapped to JSON schema with citations
6. Frontend renders markdown answer, source cards, and verse card

## Retrieval

- **Semantic**: pgvector cosine similarity on 384-dim embeddings
- **Keyword**: BM25 on verse text
- **Fusion**: 0.7 semantic + 0.3 BM25 (configured in pipeline)

## Data

- **Corpus**: Bhagavad Gita (700 verses) + Yoga Sutras (167 verses)
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2`
- **Storage**: PostgreSQL with `pgvector` extension

## API endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness |
| `GET /ready` | Pipeline + DB readiness |
| `POST /api/v1/chat` | Chat |
| `GET /api/v1/corpus/stats` | Verse counts |
| `GET /api/v1/evaluation/summary` | Offline metrics |

See [PHASE_02_BACKEND_API.md](phases/PHASE_02_BACKEND_API.md) for full API documentation.

## Phase history

| Phase | Focus |
|-------|-------|
| 1 | Runnable setup |
| 2 | FastAPI backend |
| 3 | Next.js foundation |
| 4 | Product UX polish |
| 5 | Live API integration |
| 6 | Product completion |

## Screenshots

<!-- TODO: architecture diagram screenshot -->
<!-- TODO: chat UI screenshot -->
