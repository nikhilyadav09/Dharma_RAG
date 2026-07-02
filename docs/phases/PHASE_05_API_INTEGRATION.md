# Phase 05 — Live API Integration

## Summary

Phase 5 connected the existing Next.js frontend to the existing FastAPI backend. The application is now **fully functional** for chat, corpus stats, and evaluation metrics — with no backend changes, no UI redesign, and no streaming or authentication.

A typed API client (`frontend/lib/api.ts`) centralizes all HTTP communication. The chat page uses local React state for message history, loading, cancellation, retry, and auto-scroll. Home and Evaluation pages fetch live data with graceful fallbacks when the API is unavailable.

**Status:** Complete — `npm run build` passes, ESLint clean, `pytest tests/test_api.py` 7/7 passed, live API smoke-tested.

**Explicitly out of scope:** Streaming, WebSockets, authentication, backend modifications, deployment.

---

## Files Created

```
frontend/
├── lib/
│   ├── api.ts                    # Typed API client, fetch wrapper, error types
│   └── chat-messages.ts          # Map API responses → UI message models
├── components/
│   ├── chat/
│   │   └── chat-thread.tsx       # Message list with empty/loading states
│   ├── home/
│   │   └── home-stats.tsx        # Live corpus stats with fallback
│   └── evaluation/
│       └── evaluation-content.tsx # Live evaluation metrics with empty state
├── .env.local.example            # NEXT_PUBLIC_API_URL template
└── .env.local                    # Local dev config (gitignored via .env*)

docs/phases/
└── PHASE_05_API_INTEGRATION.md
```

---

## Files Modified

| File | Change |
|------|--------|
| `frontend/types/index.ts` | Full API-aligned types (`ChatResponse`, `QueryInfo`, `AnswerContent`, etc.) |
| `frontend/components/chat/chat-layout.tsx` | Client-side chat orchestration: send, cancel, retry, auto-scroll |
| `frontend/components/chat/chat-input-placeholder.tsx` | Functional textarea: Enter send, Shift+Enter newline |
| `frontend/components/chat/suggested-questions.tsx` | `onSelect` callback, enabled when not loading |
| `frontend/components/chat/assistant-message.tsx` | Renders live data, error state with retry |
| `frontend/components/chat/response-metadata.tsx` | Accepts `metadata` and `sourcesCount` props |
| `frontend/components/chat/sources-placeholder.tsx` | Accepts `sources` prop |
| `frontend/components/chat/verse-card-placeholder.tsx` | Accepts `verse` prop, confidence bar from API |
| `frontend/app/page.tsx` | Uses `HomeStats` component |
| `frontend/app/evaluation/page.tsx` | Uses `EvaluationContent` component |

### Files Removed

| File | Reason |
|------|--------|
| `frontend/components/chat/chat-demo-thread.tsx` | Replaced by live `ChatThread` |
| `frontend/components/chat/chat-states-preview.tsx` | Design preview no longer needed; live states in chat |

### Files NOT modified (per phase rules)

- `api/` — FastAPI backend
- `src/` — RAG pipeline
- `app.py` — Streamlit UI
- API contracts and endpoints unchanged

---

## API Endpoints Used

| Method | Endpoint | Used by | Fallback |
|--------|----------|---------|----------|
| `POST` | `/api/v1/chat` | Chat page | Error state + retry |
| `GET` | `/api/v1/corpus/stats` | Home stats section | Static placeholders |
| `GET` | `/api/v1/evaluation/summary` | Evaluation page | `EmptyState` |

### Chat response types handled

| `type` | UI behavior |
|--------|-------------|
| `wisdom_response` | Answer text + metadata + sources + primary verse card |
| `clarification` | Answer text only |
| `clarification_needed` | Answer text only |
| `no_results` | Answer text only |
| `error` | Error state with retry (HTTP 500 body or `type: "error"`) |

---

## State Management

Chat state lives in `ChatLayout` (`useState` + `useRef`) — no external state library.

| State | Purpose |
|-------|---------|
| `messages: ChatMessage[]` | User and assistant message history |
| `input: string` | Composer value |
| `isLoading: boolean` | Blocks duplicate sends, shows loading skeleton |
| `abortRef` | `AbortController` for in-flight request cancellation |
| `messagesEndRef` | Auto-scroll anchor |

**Message flow:**

1. User submits → `createUserMessage()` appended
2. `getApiClient().sendChat()` called with abort signal
3. Success → `createAssistantMessage(response)` appended
4. Failure → `createErrorMessage(error, query)` with `retryQuery`
5. Retry re-invokes `sendMessage(retryQuery)` and removes prior error for same query

Home and Evaluation use local `useEffect` + `useState` per component.

---

## Error Handling

`ApiError` class with codes:

| Code | Trigger | User message |
|------|---------|--------------|
| `network` | `fetch` TypeError | "Unable to reach the server..." |
| `timeout` | Abort after 60s | "The request timed out..." |
| `server` | HTTP 4xx/5xx (non-chat) | Friendly message by status |
| `invalid_response` | JSON parse fail or schema mismatch | "Unexpected response format" |
| `empty_response` | Empty body or empty answer summary | "Empty response/answer" |
| `cancelled` | User sent new message while loading | Silently ignored |

Chat-specific: HTTP 500 responses with `type: "error"` JSON are parsed and shown inline with retry.

---

## Performance Decisions

1. **Memoized API client** — `getApiClient()` returns a singleton; no per-render instantiation.
2. **Request cancellation** — New chat message aborts the previous in-flight request via `AbortController`.
3. **Duplicate prevention** — `isLoading` guard blocks concurrent sends.
4. **60s timeout** — Default for all requests; prevents hung UI.
5. **No new dependencies** — Uses native `fetch` only; bundle increase ~4 kB on chat route.
6. **Abort on unmount** — `ChatLayout` cleans up controller on unmount; Home/Evaluation abort fetch on unmount.

---

## Testing Performed

| Test | Result |
|------|--------|
| `npm run build` | Pass |
| `npm run lint` | Pass (no warnings) |
| `pytest tests/test_api.py` | 7/7 passed |
| `GET /api/v1/corpus/stats` (live) | 867 verses, 2 books |
| `GET /api/v1/evaluation/summary` (live) | Returns committed JSON |
| `POST /api/v1/chat` (live) | Returns `wisdom_response` with sources + verse |
| Backend diff | `api/`, `src/`, `app.py` unchanged |

### Manual verification checklist

```bash
# Terminal 1 — API (requires .env with DB + LLM_API_KEY_1)
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
cp .env.local.example .env.local   # if not present
npm run dev
# → http://localhost:3000
```

- Chat: send question, see loading skeleton, receive answer with sources and verse
- Suggestions: click card to send
- Enter / Shift+Enter in composer
- Error: stop API, send message, see error + retry
- Home: stats load from API (or fallback if API down)
- Evaluation: metrics load from API (or empty state if API down)
- Mobile: responsive layout preserved

---

## Remaining Technical Debt

| Item | Notes |
|------|-------|
| `session_id` unused | Accepted by API but not sent from frontend |
| Embedding model / retrieval type on Home | Static values — not exposed by corpus API |
| No request deduplication cache | Each navigation refetches stats |
| Chat history not persisted | Lost on page refresh |
| No optimistic UI beyond user bubble | Assistant appears after full response |
| Evaluation page duplicates methodology card logic | Could extract shared component later |

---

## Known Issues

1. **First API startup is slow** — Pipeline + embeddings load on startup; `/ready` may return 503 briefly.
2. **High memory if Streamlit + API run together** — Pipeline loads twice; run one at a time on limited RAM.
3. **CORS** — Frontend must be allowed in `CORS_ORIGINS` (default includes `http://localhost:3000`).
4. **`.env.local` is gitignored** — Developers must copy `.env.local.example` manually.

---

## Future Improvements

| Phase | Work |
|-------|------|
| Streaming | SSE endpoint + incremental assistant rendering |
| Sessions | Pass `session_id`, persist history server-side or localStorage |
| Corpus API extension | Expose embedding model and retrieval weights in stats response |
| Health indicator | Show API connection status in navbar |
| Deployment | Docker compose for full stack, env-based API URL for production |

---

## Build Verification

```
Route (app)                    Size    First Load JS
┌ ○ /                         43.5 kB   164 kB
├ ○ /chat                     5.86 kB   126 kB
└ ○ /evaluation               1.57 kB   122 kB
```

```bash
cd frontend && npm run build && npm run lint
cd .. && python -m pytest tests/test_api.py -q
```

---

## Handoff Notes

### Environment

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend `.env` must have valid `DB_*` vars and `LLM_API_KEY_1` for real chat answers.

### Integration points for next engineer

| Task | File |
|------|------|
| Add streaming | New SSE handler in `lib/api.ts`, update `ChatLayout` |
| Persist chat | `localStorage` or API sessions via `session_id` |
| Add auth headers | Extend `request()` in `lib/api.ts` |
| New endpoints | Add methods to `ApiClient` interface + `getApiClient()` |

### Key files to read first

1. `frontend/lib/api.ts` — all HTTP logic
2. `frontend/components/chat/chat-layout.tsx` — chat state machine
3. `frontend/lib/chat-messages.ts` — response → message mapping
4. `api/schemas/chat.py` — authoritative response contract

### Run full stack

```bash
docker compose up -d
python scripts/setup_database.py
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
cd frontend && npm run dev
```

---

*Phase 5 completed. Application is live end-to-end. Ready for streaming, deployment, or polish phases.*
