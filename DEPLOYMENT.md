# DHARMA — Production Deployment Guide

Step-by-step guide to deploy DHARMA using **Neon** (database), **Render** (API), and **Vercel** (frontend).

**Production URLs (target):**

| Service | URL |
|---------|-----|
| Frontend | https://dharma.nikhilyadav.dev |
| API | https://api.dharma.nikhilyadav.dev |

---

## Prerequisites

- GitHub repository pushed and up to date
- [Groq API key](https://console.groq.com) (free tier)
- [Neon](https://neon.tech) account (free tier)
- [Render](https://render.com) account (free tier)
- [Vercel](https://vercel.com) account (free tier)
- Domain `nikhilyadav.dev` with DNS access

---

## Architecture

```
dharma.nikhilyadav.dev          → Vercel (Next.js)
api.dharma.nikhilyadav.dev      → Render (FastAPI + Docker)
Neon PostgreSQL + pgvector      → 867 verse embeddings
Groq API                        → llama-3.3-70b-versatile
```

---

## Step 1 — Neon PostgreSQL

### 1.1 Create project

1. Go to [console.neon.tech](https://console.neon.tech)
2. **New Project** → name: `dharma-production`
3. Region: choose closest to Render region (e.g. `US West` for Oregon)
4. PostgreSQL version: **16**

### 1.2 Enable pgvector

In the Neon SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 1.3 Get connection details

From **Dashboard → Connection Details**, copy:

| Field | Env variable |
|-------|--------------|
| Database name | `DB_NAME` |
| User | `DB_USER` |
| Password | `DB_PASSWORD` |
| Host | `DB_HOST` |
| Port | `DB_PORT` (usually `5432`) |

Set `DB_SSLMODE=require` for all Neon connections.

### 1.4 Seed the database (one-time, local machine)

On your laptop (not on Render):

```bash
cd Dharma_RAG
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
```

Edit `.env` with Neon credentials:

```env
DB_NAME=neondb
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_HOST=ep-xxxx.us-west-2.aws.neon.tech
DB_PORT=5432
DB_SSLMODE=require
LLM_API_KEY_1=gsk_your_key   # not required for seeding, but harmless
```

Run the production seed script:

```bash
python scripts/seed_production_db.py
```

This takes **5–15 minutes** (downloads BGE model, generates 867 embeddings, inserts verses).

Verify in Neon SQL Editor:

```sql
SELECT book, COUNT(*) FROM verses GROUP BY book;
-- Expected: Bhagavad Gita ~700, Yoga Sutras ~167
```

---

## Step 2 — Render (Backend API)

### 2.1 Create web service

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect your GitHub repo `Dharma_RAG`
3. Settings:

| Setting | Value |
|---------|-------|
| Name | `dharma-api` |
| Region | Oregon (or same as Neon) |
| Branch | `main` |
| Runtime | **Docker** |
| Dockerfile path | `./Dockerfile` |
| Plan | Free |

Or use the included `render.yaml` blueprint: **New +** → **Blueprint** → point to repo.

### 2.2 Environment variables (Render)

Set in **Environment** tab:

```env
DB_NAME=<from Neon>
DB_USER=<from Neon>
DB_PASSWORD=<from Neon>
DB_HOST=<from Neon>
DB_PORT=5432
DB_SSLMODE=require

LLM_API_KEY_1=<your Groq key>
LLM_MODEL_NAME=llama-3.3-70b-versatile
LLM_MAX_TOKENS=900
LLM_TEMPERATURE=0.5

CORS_ORIGINS=https://dharma.nikhilyadav.dev

ENABLE_RERANKER=false
```

> **Note:** Set `ENABLE_RERANKER=false` on Render free tier to reduce memory usage. Hybrid retrieval still works without the cross-encoder reranker.

Mark `DB_PASSWORD` and `LLM_API_KEY_1` as **Secret**.

### 2.3 Health check

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness — always returns 200 |
| `GET /ready` | Readiness — 200 when DB + pipeline ready, 503 otherwise |

Render health check path: `/health`

### 2.4 Deploy

Click **Deploy**. First deploy takes **10–20 minutes** (Docker build downloads ML models).

Note the Render URL: `https://dharma-api.onrender.com` (example).

### 2.5 Verify API

```bash
curl https://dharma-api.onrender.com/health
# {"status":"ok","service":"dharma-api"}

curl https://dharma-api.onrender.com/ready
# May take 60s+ on cold start; returns ready when pipeline loads

curl -X POST https://dharma-api.onrender.com/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is karma yoga?"}'
```

---

## Step 3 — Vercel (Frontend)

### 3.1 Import project

1. [vercel.com/new](https://vercel.com/new) → Import `Dharma_RAG` from GitHub
2. **Root Directory:** `frontend`
3. Framework: Next.js (auto-detected)

### 3.2 Environment variables (Vercel)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.dharma.nikhilyadav.dev` (or Render URL until DNS is set) |
| `NEXT_PUBLIC_SITE_URL` | `https://dharma.nikhilyadav.dev` |

### 3.3 Deploy

Click **Deploy**. Build should complete in ~2 minutes.

---

## Step 4 — Custom Domain & DNS

### 4.1 Frontend — `dharma.nikhilyadav.dev`

**Vercel → Project → Settings → Domains → Add:**

```
dharma.nikhilyadav.dev
```

Vercel shows DNS records. At your DNS provider (e.g. Cloudflare, Namecheap):

| Type | Name | Value |
|------|------|-------|
| `CNAME` | `dharma` | `cname.vercel-dns.com` |

SSL is automatic via Vercel.

### 4.2 API — `api.dharma.nikhilyadav.dev`

**Render → dharma-api → Settings → Custom Domains → Add:**

```
api.dharma.nikhilyadav.dev
```

Render shows DNS record:

| Type | Name | Value |
|------|------|-------|
| `CNAME` | `api.dharma` | `<your-service>.onrender.com` |

SSL is automatic via Render.

### 4.3 Update CORS after DNS

Once frontend domain is live, confirm Render has:

```env
CORS_ORIGINS=https://dharma.nikhilyadav.dev
```

Redeploy API if you changed CORS.

### 4.4 Update Vercel API URL

Set `NEXT_PUBLIC_API_URL=https://api.dharma.nikhilyadav.dev` and redeploy frontend.

---

## Step 5 — Environment Variables Summary

### Backend (Render)

| Variable | Required | Example |
|----------|----------|---------|
| `DB_NAME` | Yes | `neondb` |
| `DB_USER` | Yes | `neondb_owner` |
| `DB_PASSWORD` | Yes | *(secret)* |
| `DB_HOST` | Yes | `ep-xxx.neon.tech` |
| `DB_PORT` | Yes | `5432` |
| `DB_SSLMODE` | Yes (Neon) | `require` |
| `LLM_API_KEY_1` | Yes | `gsk_...` |
| `LLM_MODEL_NAME` | No | `llama-3.3-70b-versatile` |
| `CORS_ORIGINS` | Yes | `https://dharma.nikhilyadav.dev` |
| `ENABLE_RERANKER` | No | `false` (free tier) |

### Frontend (Vercel)

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | `https://api.dharma.nikhilyadav.dev` |
| `NEXT_PUBLIC_SITE_URL` | No | `https://dharma.nikhilyadav.dev` |

### Database (Neon)

Configured via `DB_*` env vars on Render. No separate Neon env file needed.

### Groq

`LLM_API_KEY_1` on Render only. Never expose in frontend.

---

## Step 6 — Testing Checklist

After full deployment:

- [ ] `https://dharma.nikhilyadav.dev` loads home page
- [ ] Chat sends a question and returns Markdown answer
- [ ] Related question chips appear and work
- [ ] Source cards and primary verse collapse/expand
- [ ] `https://api.dharma.nikhilyadav.dev/health` returns 200
- [ ] `https://api.dharma.nikhilyadav.dev/ready` returns 200 (may need 60s cold start)
- [ ] `https://api.dharma.nikhilyadav.dev/api/v1/corpus/stats` shows 867 verses
- [ ] No CORS errors in browser console
- [ ] `https://dharma.nikhilyadav.dev/robots.txt` accessible
- [ ] `https://dharma.nikhilyadav.dev/sitemap.xml` accessible

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 503 on `/ready` | Cold start — wait 60–90s; check Render logs for OOM |
| OOM on Render free | Set `ENABLE_RERANKER=false`; upgrade to Starter plan |
| CORS error | Verify `CORS_ORIGINS` matches exact frontend URL (no trailing slash) |
| Empty chat answers | Check `LLM_API_KEY_1` on Render |
| DB connection failed | Verify `DB_SSLMODE=require` and Neon credentials |
| Render spins down | Free tier sleeps after 15 min inactivity; first request is slow |
| Seed script fails | Ensure pgvector enabled; check Neon IP allowlist (default: open) |

---

## Rollback Plan

1. **Frontend:** Vercel → Deployments → Promote previous deployment
2. **API:** Render → Deploys → Rollback to previous deploy
3. **Database:** Neon → Backups / Point-in-time restore (if enabled on plan)
4. **DNS:** Revert CNAME records to previous targets

---

## Security Checklist

- [ ] `.env` is in `.gitignore` (never committed)
- [ ] `LLM_API_KEY_1` only on Render (not Vercel, not git)
- [ ] `DB_PASSWORD` only on Render
- [ ] `CORS_ORIGINS` lists production domain only (no `*`)
- [ ] Neon dashboard: restrict access, use strong password

---

## Local Docker (optional)

For local API testing with Docker:

```bash
docker build -t dharma-api .
docker run -p 8000:8000 --env-file .env dharma-api
```

---

*See also: [`docs/phases/PHASE_10_DEPLOYMENT.md`](docs/phases/PHASE_10_DEPLOYMENT.md)*
