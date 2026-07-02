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

## Structure

```
frontend/
├── app/                 # App Router pages
├── components/
│   ├── chat/            # Chat UI, verse cards, source cards
│   ├── common/          # Markdown, copy button, shared UI
│   ├── evaluation/      # Evaluation metrics display
│   ├── home/            # Home page sections
│   ├── layout/          # Navbar, footer, page shell
│   └── ui/              # Design system primitives
├── lib/
│   ├── api.ts           # Typed API client
│   ├── chat-messages.ts # Response → message mapping
│   └── parse-source.ts  # Source reference parsing
└── types/               # Shared TypeScript types
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | FastAPI base URL (default `http://localhost:8000`) |

## Screenshots

<!-- TODO: Add screenshot of home page -->
<!-- TODO: Add screenshot of chat with verse card -->
<!-- TODO: Add demo GIF of chat flow -->

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
