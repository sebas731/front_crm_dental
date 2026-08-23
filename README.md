# dental-frontend

Web frontend for the dental clinic CRM (patients & clinical records).

**Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 · ESLint · Prettier.

> This repo is technical scaffolding only. No business components or pages are
> implemented yet — just the base structure and an API client.

## Requirements

- Node.js 18.18+ (developed on 24)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local

# 3. Run the dev server
npm run dev
```

App runs at http://localhost:3000. It expects the backend at the URL in
`NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api`).

## Scripts

| Script                 | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start the dev server.                |
| `npm run build`        | Production build.                    |
| `npm run start`        | Serve the production build.          |
| `npm run lint`         | Run ESLint.                          |
| `npm run format`       | Format all files with Prettier.      |
| `npm run format:check` | Check formatting without writing.    |

## Project layout

```
src/
├── app/                # App Router routes (default layout + home only)
├── components/
│   ├── ui/             # Reusable UI primitives (empty)
│   └── layout/         # Layout components (empty)
├── hooks/              # Custom React hooks (empty)
├── lib/                # Utilities (empty)
├── services/
│   └── api.ts          # Base HTTP client (fetch + JWT), no business endpoints
└── types/
    └── index.ts        # Shared TypeScript types
```

## API client

`src/services/api.ts` exposes `apiFetch` and an `api` helper (`api.get`,
`api.post`, …). It reads the base URL from `NEXT_PUBLIC_API_URL`, attaches the
JWT bearer token from `localStorage` when present, and throws `ApiError` on
non-2xx responses. Build feature services on top of it.

## Theme

Base neutral palette is defined with CSS variables in `src/app/globals.css`
and exposed to Tailwind via `@theme` tokens (`bg-surface`, `text-muted`,
`bg-primary`, …). Swap `--primary` for the brand color when design begins.
