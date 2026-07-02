# Phase 03 — Frontend Architecture & Design System

## Summary

Phase 3 scaffolded a **premium Next.js 15 frontend** for DHARMA without API integration, chat logic, or backend modifications. The result is a production-quality UI foundation with a cohesive design system, dark/light theming, responsive layout, and six routed pages (plus loading, error, and 404 states).

**Status:** Complete — `npm run build` passes, ESLint clean, no backend changes.

**Explicitly out of scope:** FastAPI calls, streaming, authentication, real chat functionality.

---

## Files Created

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata, theme provider
│   ├── globals.css             # Design tokens (light/dark, saffron accent)
│   ├── page.tsx                # Home
│   ├── loading.tsx             # Global loading UI
│   ├── error.tsx               # Global error boundary
│   ├── not-found.tsx           # 404 page
│   ├── chat/page.tsx           # Chat layout placeholders
│   ├── about/page.tsx
│   ├── architecture/page.tsx
│   └── evaluation/page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx          # CVA variants
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   └── skeleton.tsx
│   ├── layout/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── page-container.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── chat/
│   │   ├── chat-hero.tsx
│   │   ├── chat-input-placeholder.tsx
│   │   ├── suggested-questions.tsx
│   │   ├── response-placeholder.tsx
│   │   ├── verse-card-placeholder.tsx
│   │   └── sources-placeholder.tsx
│   └── common/
│       ├── container.tsx
│       ├── empty-state.tsx
│       ├── error-state.tsx
│       └── loading-state.tsx
├── hooks/
│   └── use-mounted.ts
├── lib/
│   ├── utils.ts                # cn() helper
│   └── site.ts                 # SEO metadata constants
├── types/
│   └── index.ts                # Placeholder API types for Phase 4
├── components.json             # shadcn/ui conventions
├── .prettierrc
├── eslint.config.mjs
├── package.json
└── README.md

docs/phases/
└── PHASE_03_FRONTEND_FOUNDATION.md
```

---

## Files Modified

| File | Change |
|------|--------|
| `.gitignore` | Ignore `node_modules/`, `frontend/.next/` |
| `README.md` | Quick Start step 7 (frontend dev server) |

### Files NOT modified (per phase rules)

```
api/**                          # Backend API untouched
src/**                          # RAG pipeline untouched
app.py                          # Streamlit untouched
```

---

## Folder Structure

| Directory | Responsibility |
|-----------|----------------|
| `app/` | Next.js App Router pages and global layouts |
| `components/ui/` | Primitive design system (shadcn-style) |
| `components/layout/` | Navbar, footer, page shell, theme |
| `components/chat/` | Chat UI placeholders (no logic) |
| `components/common/` | Container, empty/loading/error states |
| `lib/` | Utilities and site config |
| `types/` | TypeScript contracts matching Phase 2 API |
| `hooks/` | Shared React hooks |

---

## Design System

### Visual identity

- **Accent:** Saffron `#FF9933` (DHARMA brand, matches Streamlit)
- **Light background:** Warm off-white `#faf8f5`
- **Dark background:** Charcoal `#0f0f10`
- **Typography:** Inter (UI), Noto Sans Devanagari (Sanskrit previews), Geist Mono (code)

### CSS variables (`app/globals.css`)

| Token | Purpose |
|-------|---------|
| `--background` / `--foreground` | Page colors |
| `--card` / `--card-foreground` | Card surfaces |
| `--muted` / `--muted-foreground` | Subtle backgrounds and secondary text |
| `--accent` / `--accent-muted` | Brand saffron |
| `--border` | Borders and dividers |
| `--destructive` | Error states |
| `--ring` | Focus rings |
| `--radius` | Border radius scale |

### Component library

| Component | Variants / features |
|-----------|---------------------|
| `Button` | default, secondary, outline, ghost, link · sm/default/lg/icon |
| `Card` | Header, title, description, content |
| `Input` | Rounded, focus ring, disabled states |
| `Badge` | default, secondary, outline, source |
| `Skeleton` | Pulse animation for loading |
| `EmptyState` | Icon + title + description + optional action |
| `ErrorState` | Alert styling + optional retry |
| `LoadingState` | Spinner or skeleton variant |
| `Container` | default / narrow / wide max-width |

### Theme

- **Library:** `next-themes`
- **Modes:** light, dark, system
- **Implementation:** `class` attribute on `<html>`, CSS variables swap in `.dark`
- **Toggle:** Navbar `ThemeToggle` component (hydration-safe)

---

## Layout Decisions

### Page shell

`PageContainer` composes:
1. `Navbar` (sticky, blurred backdrop)
2. `Container` (responsive padding)
3. `Footer`

Home page uses custom full-width hero sections but shares Navbar/Footer.

### Navigation

| Route | Label |
|-------|-------|
| `/` | Home |
| `/chat` | Chat |
| `/about` | About |
| `/architecture` | Architecture |
| `/evaluation` | Evaluation |

Active route highlighted with `accent-muted` background.

### Metadata & SEO (`app/layout.tsx`)

- Title template: `%s · DHARMA`
- OpenGraph and Twitter cards
- `metadataBase` from `lib/site.ts`
- Keywords for portfolio discoverability

---

## Responsive Review

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Single column, nav links hidden (CTA visible), stacked cards |
| `sm` (640px+) | Stats grid 3-col, footer row layout |
| `md` (768px+) | Full nav visible, increased vertical padding |
| `lg` (1024px+) | Evaluation metrics 4-column grid |

Chat page uses `narrow` container (`max-w-3xl`) for readable line length.

---

## Accessibility Review

| Item | Status |
|------|--------|
| Semantic HTML (`header`, `nav`, `main`, `footer`) | ✅ |
| `aria-label` on nav and icon buttons | ✅ |
| `role="alert"` on error states | ✅ |
| `aria-busy` on loading states | ✅ |
| Focus visible rings on interactive elements | ✅ |
| Color contrast (saffron on dark/light) | ✅ Acceptable for accents |
| Disabled chat input labeled as coming soon | ✅ |
| Theme toggle hydration guard | ✅ Prevents flash/mismatch |

**Phase 4 improvements:** keyboard shortcuts for chat submit, live region for streaming answers.

---

## Performance Considerations

| Metric | Build output |
|--------|--------------|
| Home First Load JS | ~160 kB |
| Static pages | 9 routes prerendered |
| Chat page | 158 kB (Framer Motion) |

**Choices:**
- Static generation for all content pages (no API calls)
- Fonts via `next/font` (self-hosted, no layout shift)
- Minimal dependencies (no heavy UI framework beyond primitives)
- Framer Motion only on Home hero and Chat hero

**Future:** lazy-load chat components, API client in Phase 4 only on `/chat`.

---

## Remaining Work (Phase 4+)

| Item | Phase |
|------|-------|
| `lib/api.ts` client for FastAPI | Phase 4 |
| Wire `POST /api/v1/chat` | Phase 4 |
| Real chat message state | Phase 4 |
| Fetch corpus stats on Home | Phase 4 |
| Fetch evaluation summary on Evaluation page | Phase 4 |
| SSE streaming UI | Phase 4+ |
| Mobile nav drawer | Optional polish |
| OG image asset (`/og.png`) | Phase 5 |
| `NEXT_PUBLIC_API_URL` env | Phase 4 |

---

## Handoff Notes

### For Phase 4 (Chat Experience)

1. **Create `frontend/.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. **API client sketch (`lib/api.ts`):**
   ```typescript
   export async function sendChat(query: string) {
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ query }),
     });
     return res.json(); // matches types/index.ts ChatResponse shape
   }
   ```

3. **Types already defined** in `frontend/types/index.ts` — align with `api/schemas/chat.py` from Phase 2.

4. **Replace placeholders on `/chat`:**
   - `ChatInputPlaceholder` → real input + submit
   - `ResponsePlaceholder` → dynamic answer renderer
   - `VerseCardPlaceholder` → `primary_verse` from API
   - `SourcesPlaceholder` → `answer.sources`
   - Branch on `type`: wisdom_response, clarification, clarification_needed, no_results, error

5. **CORS:** Backend already allows `http://localhost:3000` via `CORS_ORIGINS` in `.env`.

### Run frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
npm run build   # production verify
npm run lint
```

### Dependencies (frontend/package.json)

```json
{
  "next": "^15.5.20",
  "react": "19.2.4",
  "framer-motion": "^12.x",
  "lucide-react": "^1.x",
  "next-themes": "^0.4.x",
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.x",
  "tailwind-merge": "^3.x"
}
```

### Design conventions for Phase 4

- Use existing `Button`, `Card`, `Badge` — do not introduce new UI libraries
- Keep saffron accent for citations and CTAs
- Use `font-devanagari` class for Sanskrit text
- Use `ErrorState` and `LoadingState` for API feedback
- Use Framer Motion sparingly for message enter animations

---

## Build Verification

| Check | Result |
|-------|--------|
| `npm run build` | ✅ 9 static routes |
| `npm run lint` | ✅ No warnings or errors |
| TypeScript | ✅ Strict compile |
| Backend `api/` | ✅ Unchanged |
| Streamlit `app.py` | ✅ Unchanged |
| Dark mode toggle | ✅ Works |
| All pages render | ✅ /, /chat, /about, /architecture, /evaluation, 404 |

---

*Phase 3 complete. Frontend foundation ready for API integration in Phase 4.*
