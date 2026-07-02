# Phase 10 — Production Deployment

## Summary

Phase 10 prepares DHARMA for **public launch** on free-tier infrastructure. No application features, UI, prompts, or RAG logic were modified — only deployment configuration, documentation, and production hardening.

**Status:** Complete — repository production-ready, deployment guide written, tests and build verified.

---

## Hosting Decisions

| Component | Provider | Tier | Rationale |
|-----------|----------|------|-----------|
| **Frontend** | Vercel | Free | Native Next.js 15 support, automatic SSL, custom domains |
| **Backend API** | Render | Free (Docker) | Supports Docker + long-running Python ML workloads |
| **Database** | Neon | Free | Managed PostgreSQL 16 with pgvector extension |
| **LLM** | Groq | Free | Already integrated; fast inference, no code changes |
| **Domain** | `nikhilyadav.dev` | Existing | `dharma.` and `api.dharma.` subdomains |

### Why not all-in-one?

- Vercel cannot run the Python ML stack (torch, sentence-transformers)
- Render free tier has memory limits → `ENABLE_RERANKER=false` recommended
- Neon provides pgvector without self-hosting Postgres

---

## Deployment Architecture

```
                    ┌─────────────────────────┐
                    │  dharma.nikhilyadav.dev │
                    │       Vercel CDN        │
                    │      Next.js 15         │
                    └───────────┬─────────────┘
                                │ HTTPS
                                ▼
                    ┌─────────────────────────┐
                    │ api.dharma.nikhilyadav  │
                    │      .dev (Render)      │
                    │   FastAPI + Docker      │
                    │  BGE + BM25 + Groq      │
                    └───────────┬─────────────┘
                                │ SSL (DB_SSLMODE=require)
                                ▼
                    ┌─────────────────────────┐
                    │   Neon PostgreSQL 16    │
                    │   pgvector · 867 verses │
                    └─────────────────────────┘
                                │
                                ▼
                    ┌─────────────────────────┐
                    │      Groq Cloud API     │
                    │ llama-3.3-70b-versatile │
                    └─────────────────────────┘
```

---

## Security Audit

| Check | Status |
|-------|--------|
| `.env` in `.gitignore` | ✅ |
| `frontend/.env.local` gitignored | ✅ |
| Only `.env.example` tracked (no secrets) | ✅ |
| API keys not in source code | ✅ |
| `docker-compose.yml` uses dev-only `postgres/postgres` | ✅ (local only) |
| Production CORS documented as single origin | ✅ |
| Groq key server-side only (Render) | ✅ |

**Strengthened `.gitignore`:** added `.env.local`, `.env.*.local`, `*.pem`, `*.key`, `credentials.json`.

---

## Files Created

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Step-by-step deploy guide (Neon → Render → Vercel → DNS) |
| `Dockerfile` | Production container for Render |
| `requirements-prod.txt` | Slim production Python dependencies |
| `.dockerignore` | Smaller Docker context |
| `render.yaml` | Render Blueprint with env var template |
| `runtime.txt` | Python 3.12.4 for Render |
| `scripts/seed_production_db.py` | Seed Neon without local Docker DB creation |
| `frontend/app/robots.ts` | SEO robots.txt |
| `frontend/app/sitemap.ts` | SEO sitemap.xml |
| `frontend/vercel.json` | Vercel build config |
| `frontend/env.local.example` | Frontend env template |
| `docs/phases/PHASE_10_DEPLOYMENT.md` | This document |

## Files Modified

| File | Change |
|------|--------|
| `.gitignore` | Expanded secret patterns |
| `.env.example` | Production vars, `DB_SSLMODE`, CORS examples |
| `src/config/settings.py` | Optional `DB_SSLMODE` for Neon SSL |
| `frontend/lib/site.ts` | Production URL `dharma.nikhilyadav.dev` |
| `frontend/.gitignore` | Allow `env.local.example` to be committed |
| `README.md` | Live demo, deployment section, screenshots placeholder |

---

## Environment Variables

See [`DEPLOYMENT.md`](../../DEPLOYMENT.md) and [`.env.example`](../../.env.example) for the complete list.

### Critical production values

```env
# Render
DB_SSLMODE=require
CORS_ORIGINS=https://dharma.nikhilyadav.dev
ENABLE_RERANKER=false
LLM_API_KEY_1=<secret>

# Vercel
NEXT_PUBLIC_API_URL=https://api.dharma.nikhilyadav.dev
NEXT_PUBLIC_SITE_URL=https://dharma.nikhilyadav.dev
```

---

## Health Endpoints

| Endpoint | Type | Expected |
|----------|------|----------|
| `GET /health` | Liveness | `200 {"status":"ok"}` |
| `GET /ready` | Readiness | `200` when DB + pipeline ready; `503` during startup |
| `GET /api/v1/corpus/stats` | Data check | `867` total verses |

Render health check: `/health`

> Note: There is no `/readiness` endpoint — use `/ready`.

---

## Production Checklist

### Pre-deploy

- [x] Secrets audit — no keys in git
- [x] Dockerfile and production requirements
- [x] Neon seed script documented
- [x] CORS production values documented
- [x] Health endpoints verified locally
- [x] Frontend build passes
- [x] Backend tests pass (33)

### Deploy (manual steps)

- [ ] Create Neon project + enable pgvector
- [ ] Run `python scripts/seed_production_db.py` locally against Neon
- [ ] Deploy API to Render with env vars
- [ ] Deploy frontend to Vercel (root: `frontend/`)
- [ ] Configure DNS: `dharma` → Vercel, `api.dharma` → Render
- [ ] Set `NEXT_PUBLIC_API_URL` to production API URL
- [ ] Run post-deployment testing checklist

### Post-deploy

- [ ] Verify chat end-to-end on production domain
- [ ] Confirm no CORS errors
- [ ] Add `frontend/public/og.png` for social previews (optional)
- [ ] Add screenshots to README
- [ ] Record demo video (optional)

---

## Known Limitations

| Limitation | Mitigation |
|------------|------------|
| Render free tier sleeps after 15 min | First request slow (~60s cold start) |
| Render free ~512MB RAM | `ENABLE_RERANKER=false`; consider Starter plan |
| In-memory session store | Single Render instance only; Redis for scale |
| Neon free storage/compute limits | Monitor usage in Neon dashboard |
| Groq free tier rate limits | Monitor; add backup keys `LLM_API_KEY_2` |
| Docker image ~2GB (ML models) | Pre-baked in Dockerfile; long first deploy |
| `og.png` not yet in repo | Add 1200×630 image to `frontend/public/` |

---

## Rollback Plan

1. **Vercel:** Deployments → promote previous build (< 1 min)
2. **Render:** Deploys → rollback (< 5 min)
3. **Neon:** Point-in-time restore if data corrupted
4. **DNS:** Revert CNAME records if domain misconfigured

---

## Verification Results

| Check | Result |
|-------|--------|
| `pytest tests/` | 33 passed |
| `npm run build` (frontend) | Success |
| Secrets in git | None (only `.env.example`) |
| `/health` endpoint | Exists |
| `/ready` endpoint | Exists |
| `robots.ts` + `sitemap.ts` | Added |
| `DEPLOYMENT.md` | Complete |

---

## Post-Deployment Checklist

```bash
# API health
curl https://api.dharma.nikhilyadav.dev/health
curl https://api.dharma.nikhilyadav.dev/ready

# Corpus
curl https://api.dharma.nikhilyadav.dev/api/v1/corpus/stats

# Chat smoke test
curl -X POST https://api.dharma.nikhilyadav.dev/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is dharma?"}'

# Frontend
open https://dharma.nikhilyadav.dev
open https://dharma.nikhilyadav.dev/robots.txt
open https://dharma.nikhilyadav.dev/sitemap.xml
```

---

## Lessons Learned

1. **Seed locally, not on Render** — embedding generation is too heavy for a one-off Render job
2. **`DB_SSLMODE=require`** is mandatory for Neon — document clearly
3. **Disable reranker on free tier** — prevents OOM without changing RAG logic
4. **CORS must match exactly** — no trailing slashes, production domain only
5. **Cold starts are real** — set user expectations; `/health` vs `/ready` serve different purposes

---

## Future Infrastructure (Post-Launch)

- Redis for multi-instance session store
- Render Starter plan or Fly.io for more RAM
- CI/CD GitHub Actions for auto-deploy on merge to `main`
- Neon autoscaling / backup retention
- CDN cache for static evaluation JSON
- Custom `og.png` and demo video assets

---

*Phase 10 complete. DHARMA is ready for public launch.*
