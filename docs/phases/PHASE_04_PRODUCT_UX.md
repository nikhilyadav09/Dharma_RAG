# Phase 04 — Product Experience & UI Polish

## Summary

Phase 4 transformed the Phase 3 frontend scaffold into a **premium, production-quality AI product experience** — inspired by Perplexity, Linear, Notion, OpenAI, and Vercel design language. All work is **frontend-only**: no FastAPI integration, no API calls, no chat state management, no streaming, and **no backend modifications**.

The application now feels like a calm, credible SaaS product with polished typography, spacing rhythm, responsive layouts, accessible patterns, and a chat interface that looks complete using static preview data.

**Status:** Complete — `npm run build` passes, ESLint clean, backend untouched.

**Explicitly out of scope:** API integration, real chat functionality, state management, streaming, backend/RAG pipeline changes.

---

## Files Created

```
frontend/components/
├── common/
│   ├── page-header.tsx          # Reusable page title block with eyebrow
│   ├── section.tsx              # Section wrapper with variant backgrounds
│   └── section-heading.tsx      # Section title + description
├── layout/
│   └── mobile-nav.tsx           # Mobile navigation panel
├── chat/
│   ├── chat-layout.tsx          # Full chat page shell
│   ├── chat-demo-thread.tsx     # Static sample conversation
│   ├── user-message.tsx         # User message bubble
│   ├── assistant-message.tsx    # Assistant response with sources/verse
│   ├── response-metadata.tsx    # Latency / retrieval count preview
│   └── chat-states-preview.tsx  # Empty, loading, error state showcase
└── ui/
    └── separator.tsx            # Accessible divider

docs/phases/
└── PHASE_04_PRODUCT_UX.md
```

---

## Files Modified

| File | Change |
|------|--------|
| `frontend/app/globals.css` | Refined design tokens, typography utilities, grid texture, focus styles, accent-subtle token |
| `frontend/app/page.tsx` | Premium hero, stats, features, how-it-works, CTA band |
| `frontend/app/chat/page.tsx` | Uses `ChatLayout` instead of stacked placeholders |
| `frontend/app/about/page.tsx` | `PageHeader`, improved card spacing |
| `frontend/app/architecture/page.tsx` | `PageHeader`, `SectionHeading`, structured flow list |
| `frontend/app/evaluation/page.tsx` | `PageHeader`, updated integration phase wording |
| `frontend/components/layout/navbar.tsx` | Skip link, mobile nav, `aria-current`, refined styling |
| `frontend/components/layout/footer.tsx` | Multi-column layout, product/resource links |
| `frontend/components/layout/page-container.tsx` | `id="main-content"`, `flush` mode for chat |
| `frontend/components/chat/chat-input-placeholder.tsx` | Premium composer with hint bar |
| `frontend/components/chat/suggested-questions.tsx` | Card-style suggestion grid |
| `frontend/components/chat/sources-placeholder.tsx` | Source pills with relevance badges |
| `frontend/components/chat/verse-card-placeholder.tsx` | Confidence bar, Devanagari verse, translation |
| `frontend/components/chat/response-placeholder.tsx` | Realistic loading skeleton |
| `frontend/components/ui/card.tsx` | Removed default shadow for calmer surfaces |

### Files Removed

| File | Reason |
|------|--------|
| `frontend/components/chat/chat-hero.tsx` | Replaced by `ChatLayout` header |

### Files NOT modified (per phase rules)

- `api/` — FastAPI backend
- `src/` — RAG pipeline
- `app.py` — Streamlit UI
- `frontend/types/index.ts` — API types preserved for next phase
- No new dependencies added

---

## UX Decisions

1. **Chat as a product surface, not a demo page** — The `/chat` route uses a full-height layout: slim header, scrollable message thread, sticky composer area with suggestions. This mirrors Perplexity/OpenAI chat patterns users already know.

2. **Static conversation preview** — A realistic Q&A thread demonstrates the end-to-end experience without state or API calls. Metadata strip ("1.2s", "3 verses retrieved") sets expectations for live integration.

3. **Interface states section** — Empty, loading, and error placeholders are shown in a labeled "Interface states" band below the main chat. Engineers can wire these directly in the API integration phase without redesigning.

4. **Suggestion cards over pill buttons** — Questions use titled cards with hover affordances, improving scanability on tablet/desktop and touch targets on mobile.

5. **Home page narrative arc** — Hero → credibility stats → feature pillars → how-it-works → CTA band. Each section uses consistent vertical rhythm (`py-14`–`py-20`).

6. **Skip to content** — Keyboard users can bypass navigation via a focus-visible skip link in the navbar.

7. **Mobile navigation** — Hamburger menu on small screens; theme toggle and CTA included in the mobile panel.

---

## Design Decisions

| Area | Decision |
|------|----------|
| **Typography** | `text-display` utility for hero headings; `-0.03em` letter-spacing; `text-balance` for headlines; `prose-width` (65ch) for reading blocks |
| **Color** | Warm off-white light mode (`#faf9f7`); refined saffron accent (`#e8890c` light / `#ff9933` dark); `accent-subtle` for section backgrounds |
| **Surfaces** | Cards without default shadows; borders at 80% opacity; hover border accent hints only |
| **Texture** | Subtle dot-grid on hero (`bg-grid-subtle`) — single use, not repeated |
| **Motion** | Framer Motion on home hero only (opacity + 20px translate); no excessive animation elsewhere |
| **Spacing** | 4/6/8px scale via Tailwind; section padding `py-14 md:py-20`; container `px-4 sm:px-6 lg:px-8` |
| **Chat composer** | Rounded-2xl card, arrow-up send icon (OpenAI-style), disabled with descriptive hint bar |

---

## Branding Improvements

- Consistent **ॐ** mark in navbar and footer with saffron rounded square
- **DHARMA** wordmark with calm tracking; hidden on very small screens to save space
- Eyebrow labels (`text-xs uppercase tracking-[0.14em] text-accent`) on inner pages
- Footer tagline reinforces product positioning without marketing fluff
- "Preview data" badge on chat metadata — honest labeling until API is connected
- Removed "Portfolio AI Application" badge language; replaced with "AI wisdom assistant"

---

## Responsive Review

| Breakpoint | Changes |
|------------|---------|
| **Mobile (<640px)** | Mobile nav; single-column grids; full-width CTAs; chat suggestions 1-column; user bubbles max 85% width |
| **Tablet (640–1024px)** | 2-column suggestion grid; 2-column evaluation metrics; nav links visible at `md` |
| **Desktop** | 3-column feature/stats grids; centered reading widths; sticky chat composer |
| **Large screens** | `max-w-3xl` chat column; `max-w-6xl` default container; hero scales to `3.5rem` |

**Overflow:** No horizontal scroll introduced; `min-w-0` on assistant message column prevents flex overflow.

---

## Accessibility Review

| Check | Status |
|-------|--------|
| **Heading hierarchy** | Single `h1` per page; section `h2`/`h3` nested correctly |
| **Skip link** | `#main-content` target on all pages |
| **Keyboard navigation** | All interactive elements focusable; disabled controls marked `disabled` |
| **Focus states** | Global `:focus-visible` ring using `--ring` token |
| **ARIA** | `aria-label` on chat feed, composer, sources; `aria-current="page"` on active nav; `role="alert"` on error state; `role="progressbar"` on verse confidence |
| **Screen readers** | `sr-only` labels on chat input; decorative icons `aria-hidden` |
| **Contrast** | Muted text on warm backgrounds meets readable contrast in both themes |

---

## Performance Impact

| Metric | Before (Phase 3) | After (Phase 4) |
|--------|------------------|-----------------|
| Home First Load JS | ~161 kB | ~162 kB |
| Chat page | ~119 kB | ~120 kB |
| New dependencies | — | **None** |
| Bundle impact | — | Negligible (+1 kB chat, +1 kB home) |

Existing components were extended rather than duplicated. Framer Motion was already a Phase 3 dependency and is used only on the home hero.

---

## Remaining Work

Phase 4 is **complete**. The following belong to **Phase 5 — API Integration**:

1. Create `frontend/lib/api.ts` with `fetch` wrapper and error handling
2. Wire `POST /api/v1/chat` to the chat composer
3. Replace static `ChatDemoThread` with live message state
4. Connect suggestion cards to populate composer / submit
5. Swap preview metadata with real `latency_ms` and `sources_count` from API response
6. Map API `sources` and `primary_verse` to `SourcesPlaceholder` / `VerseCardPlaceholder` (rename to live components)
7. Show `LoadingState` during fetch; `ErrorState` on failure with retry
8. Fetch evaluation metrics from `GET /api/v1/evaluation/summary`
9. Optional: corpus stats on home from `GET /api/v1/corpus/stats`
10. Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`

**Not in scope for any near-term phase:** Authentication, streaming SSE, rate limiting UI, user accounts.

---

## Handoff Notes

### Run the frontend

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

### What the next engineer should know

1. **Chat page structure** — `ChatLayout` (`components/chat/chat-layout.tsx`) is the integration point. Replace `ChatDemoThread` with a client component that manages messages once API is wired.

2. **Placeholder components map to API fields** — Types in `frontend/types/index.ts` already mirror Phase 2 response shapes. `AssistantMessage` composes sources + verse — split props from API response in Phase 5.

3. **Interface states section** — `ChatStatesPreview` can be removed from production or hidden behind a dev flag once live states work. It documents the designed empty/loading/error UX.

4. **No backend changes needed** — Phase 2 API is ready. Start integration by enabling CORS for `http://localhost:3000` (already configured via `CORS_ORIGINS` in `.env`).

5. **Design tokens** — All theming lives in `globals.css` CSS variables. Extend `--accent-*` tokens rather than hardcoding hex values in components.

6. **Mobile nav** — Closes automatically on route change. If adding authenticated routes later, extend `navItems` in `navbar.tsx`.

### Verification checklist

```bash
cd frontend
npm run build   # must pass
npm run lint    # must pass
```

Confirm backend untouched:

```bash
git diff api/ src/ app.py   # should show no changes
```

---

*Phase 4 completed. Ready for API integration.*
