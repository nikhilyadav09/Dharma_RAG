# DHARMA Frontend

Next.js 15 application for the DHARMA wisdom assistant.

## Quick start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Requires the FastAPI backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).

## Features

- **Wisdom Chat** — intent-aware answers with Markdown, inline citations, and related follow-up chips
- **Multi-turn memory** — `session_id` persisted in sessionStorage for conversational follow-ups
- **Source cards** — Primary / Supporting / Related teachings with scripture badges
- **Staged loading** — progressive retrieval → synthesis → response indicators
- **Architecture & Evaluation** — live pages documenting the RAG pipeline and offline metrics

## Structure

```
frontend/
├── app/                 # App Router pages (home, chat, about, architecture, evaluation)
├── components/
│   ├── chat/            # Chat UI, related questions, source/verse cards
│   ├── common/          # Markdown, copy button, collapsible sections
│   ├── evaluation/      # Evaluation metrics display
│   ├── home/            # Home page sections and stats
│   ├── layout/          # Navbar, footer, page shell
│   └── ui/              # Design system primitives
├── lib/
│   ├── api.ts           # Typed API client (chat, corpus, evaluation)
│   ├── chat-messages.ts # Response → message mapping
│   ├── format-relevance.ts  # Citation roles and scripture badges
│   └── parse-source.ts  # Source reference parsing
└── types/               # Shared TypeScript types
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (default `http://localhost:8000`) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
