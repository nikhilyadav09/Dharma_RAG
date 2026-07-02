# Phase 07 — UX Polish & Portfolio Refinement

## Summary

Phase 7 refined the DHARMA frontend into a **calmer, more scannable AI product** suitable for portfolio presentation. The answer is now the primary focus — supporting context, sources, and primary verse are **collapsed by default** with smooth accordion animations. Typography, loading states, navigation, footer, home, and architecture pages received targeted polish.

All work is **frontend-only**. No backend, API, RAG, retrieval, prompts, evaluation, embeddings, or database changes.

**Status:** Complete — `npm run build` passes, ESLint clean.

---

## Goals

1. Reduce visual clutter in chat responses
2. Improve long-form answer readability
3. Make collapsible sections feel intentional and premium
4. Strengthen portfolio presentation (author credit, Why DHARMA, flow diagram)
5. Maintain existing design language and component system
6. Avoid significant bundle size increase

---

## Files Created

```
frontend/
├── components/
│   ├── common/
│   │   └── collapsible-section.tsx   # Reusable accordion + AnswerSection
│   └── home/
│       └── why-dharma.tsx            # "Why DHARMA?" feature grid
└── lib/
    └── format-relevance.ts           # Shared relevance label formatting

docs/phases/
└── PHASE_07_UX_POLISH.md
```

---

## Files Modified

| File | Change |
|------|--------|
| `frontend/components/chat/assistant-message.tsx` | Answer-first layout; collapsed sections |
| `frontend/components/chat/source-cards.tsx` | Collapsed group + one-at-a-time source accordion |
| `frontend/components/chat/verse-card-placeholder.tsx` | Collapsed by default; shorter labels; relevance wording |
| `frontend/components/chat/response-placeholder.tsx` | Rotating loading messages (1.8s interval) |
| `frontend/components/architecture/flow-diagram.tsx` | Added vertical `RequestFlowDiagram` |
| `frontend/app/architecture/page.tsx` | Request flow visualization at top |
| `frontend/app/page.tsx` | Added `WhyDharma` section |
| `frontend/app/globals.css` | Improved markdown spacing and line height |
| `frontend/components/layout/navbar.tsx` | CTA shortened to "Ask" |
| `frontend/components/layout/mobile-nav.tsx` | Mobile CTA shortened to "Ask" |
| `frontend/components/layout/footer.tsx` | Author credit, portfolio link, full tech stack |
| `frontend/components/ui/button.tsx` | Subtle transition duration on hover |

### Files NOT modified

- `api/`, `src/`, `app.py` — backend and RAG pipeline
- `frontend/lib/api.ts` — API client unchanged
- No new npm dependencies

---

## UX Improvements

| Area | Before | After |
|------|--------|-------|
| **Chat sections** | All expanded by default | Answer visible; context, sources, verse collapsed |
| **Supporting context** | "Supporting context" label | "Reasoning from scripture" |
| **Sources** | All cards expanded individually | Group collapsed; compact list with ▶ toggles |
| **Source accordion** | Multiple open | One expanded at a time |
| **Primary verse** | Expanded by default | Collapsed by default |
| **Confidence** | "46% match" | "Relevance · 46%" |
| **Loading** | Single static message | Rotating status messages |
| **Navbar CTA** | "Ask a question" | "Ask" |
| **Home** | Stats + about only | Added "Why DHARMA?" feature grid |
| **Architecture** | Horizontal overview only | Vertical request flow diagram added |

---

## UI Improvements

- **AnswerSection** — always-visible answer with copy action, no collapse chrome
- **CollapsibleSection** — consistent bordered accordion with chevron rotation (200ms)
- **Source list** — minimal rows: `▶ Bhagavad Gita 2.47` style
- **Verse card** — reference as `Book chapter.verse`; removed redundant subtitle
- **Footer** — "Built with ❤️ by Nikhil Yadav" → [nikhilyadav.dev](https://nikhilyadav.dev)
- **Tech stack line** — Next.js · FastAPI · PostgreSQL · pgvector · Groq · Docker
- **Why DHARMA** — 6 compact feature cards (grounded, citations, hybrid, modern AI, open source, production)
- **Request flow** — User → Next.js → FastAPI → Hybrid Retrieval → Groq LLM → Response

---

## Accessibility Improvements

| Check | Implementation |
|-------|----------------|
| Accordion buttons | `aria-expanded`, `aria-controls` on section toggles |
| Collapsed panels | `aria-hidden={!open}` on panel content |
| Source items | `aria-expanded` per source row |
| Loading | `aria-live="polite"` for rotating messages |
| Progress bars | `role="progressbar"` on relevance bar |
| Focus | Existing `:focus-visible` preserved on all interactive elements |
| Keyboard | All accordions operable via button elements |

No accessibility regressions introduced.

---

## Responsive Improvements

- Vertical request flow diagram stacks naturally on mobile (`max-w-xs` centered)
- Source accordion rows remain full-width tap targets on mobile
- Collapsible sections use full-width headers for easy touch interaction
- Footer author and tech stack wrap cleanly on narrow screens
- Why DHARMA grid: 1 col mobile → 2 col tablet → 3 col desktop

---

## Performance Notes

| Route | First Load JS (Phase 6 → 7) |
|-------|----------------------------|
| `/chat` | 220 kB → **220 kB** (unchanged) |
| `/` | 165 kB → 166 kB (+1 kB) |
| `/architecture` | 119 kB (unchanged) |

- **No new dependencies** — accordions use CSS `grid-template-rows` animation
- Reused `CollapsibleSection` across verse, sources, and reasoning
- `format-relevance.ts` deduplicates confidence formatting logic

---

## Remaining TODOs

| Item | Priority |
|------|----------|
| Capture screenshots/GIFs for README | High (Phase 08 deployment) |
| Persist collapsed/expanded preferences per session | Low |
| `localStorage` chat history | Medium |
| Streaming SSE answers | Future phase |
| Production `API Docs` URL in footer (not localhost) | Phase 08 |

---

## Build Verification

```bash
cd frontend && npm run build && npm run lint
```

```
Route (app)                    Size    First Load JS
├ ○ /                         45.4 kB   166 kB
├ ƒ /chat                      100 kB   220 kB
└ ○ /architecture              2.12 kB   119 kB
```

```bash
git diff api/ src/ app.py   # no changes
```

---

## Handoff Notes for Phase 08

Phase 8 should focus on **deployment and production readiness**:

1. **Docker Compose full stack** — frontend + API + DB in one command
2. **Production env vars** — `NEXT_PUBLIC_API_URL`, `CORS_ORIGINS`
3. **Footer API Docs link** — use production URL, not `localhost:8000`
4. **Screenshots** — replace README/TODO placeholders with real assets
5. **CI/CD** — GitHub Actions for `pytest` + `npm run build`
6. **Optional:** Vercel frontend + self-hosted API, or single VPS deployment

### Key files for Phase 08 engineer

| Concern | File |
|---------|------|
| Chat UX | `components/chat/assistant-message.tsx` |
| Accordions | `components/common/collapsible-section.tsx` |
| API client | `lib/api.ts` |
| Env config | `frontend/.env.local.example`, root `.env.example` |
| Phase history | `docs/phases/PHASE_01` through `PHASE_07` |

### Run locally

```bash
docker compose up -d
python scripts/setup_database.py
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
cd frontend && npm run dev
```

---

*Phase 7 completed. Application is portfolio-ready. Proceed to deployment (Phase 08).*
