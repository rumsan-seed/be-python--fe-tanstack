# Seed: FastAPI + TanStack Router

A fullstack monorepo seed. The backend is Python/FastAPI; the frontend is React/TypeScript with TanStack Router. The demo domain is a simple Notes CRUD app — replace it with your own domain.

---

## Repository Layout

```
be-python--fe-tanstack/
├── app/                        # Python backend (FastAPI)
│   ├── main.py                 # App factory, CORS, route registration, SPA serving
│   ├── config.py               # Pydantic settings (env vars, APP_ prefix)
│   ├── auth.py                 # Optional API key auth dependency
│   ├── database.py             # SQLite engine + SQLModel session
│   ├── models/
│   │   ├── note.py             # ORM table model (Note)
│   │   └── schemas.py          # Pydantic request schemas (NoteCreate, NoteUpdate)
│   ├── routers/
│   │   └── notes.py            # CRUD routes for /api/v1/notes
│   └── services/               # Empty placeholder — put business logic here
├── frontend/                   # React/TypeScript frontend
│   ├── src/
│   │   ├── main.tsx            # React root mount
│   │   ├── router.tsx          # TanStack Router setup
│   │   ├── routeTree.gen.ts    # Auto-generated route tree (do not edit manually)
│   │   ├── styles.css          # Global styles + Tailwind v4 imports
│   │   ├── routes/
│   │   │   ├── __root.tsx      # Root layout: AuthProvider + AuthGate + AppShell
│   │   │   └── index.tsx       # / route — Notes page
│   │   ├── components/
│   │   │   ├── login.tsx       # API key login screen
│   │   │   └── layout/
│   │   │       ├── app-shell.tsx     # Full-screen shell with sidebar slot
│   │   │       └── icon-sidebar.tsx  # Narrow icon sidebar (w-16)
│   │   │   └── ui/             # shadcn/ui primitives: Button, Card, Input, Textarea
│   │   └── lib/
│   │       ├── api.ts          # Typed fetch wrapper for all backend calls
│   │       ├── auth.tsx        # Auth React Context + hooks
│   │       └── utils.ts        # cn() — clsx + tailwind-merge
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── components.json         # shadcn/ui config
├── pyproject.toml              # Python deps + CLI entry points (dev, prod)
├── uv.lock
├── .env.example                # Template: APP_HOST, APP_PORT, APP_API_KEY
├── .rumsan/
│   ├── settings.json           # Dev runner: pnpm dev
│   ├── dev.json                # Prod runner: uv run prod
│   └── info/
│       └── seed-info.md        # This file
```

---

## Tech Stack

### Backend
| Layer | Tool |
|---|---|
| Language | Python >=3.11 |
| Framework | FastAPI >=0.115 |
| ASGI server | Uvicorn |
| ORM | SQLModel (SQLAlchemy + Pydantic) |
| Database | SQLite (file at `~/.app-seed/app.db`) |
| Config | pydantic-settings (`APP_` prefix, `.env` file) |
| Package manager | uv |
| Linter | Ruff |

### Frontend
| Layer | Tool |
|---|---|
| Language | TypeScript ^5.9 (strict mode) |
| UI library | React ^19.2 |
| Build tool | Vite ^7.3 |
| Router | TanStack Router ^1.167 (file-based) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Components | shadcn/ui (base-lyra style, Base UI primitives) |
| Icons | lucide-react + @remixicon/react |
| Toasts | sonner |
| Class utility | clsx + tailwind-merge via `cn()` |
| Package manager | pnpm 10+ |
| Formatter | Prettier + prettier-plugin-tailwindcss |

---

## How It Works

### Development
```
# Terminal 1 — backend (port 8000, hot-reload)
uv run dev

# Terminal 2 — frontend (port 5173, proxies /api to backend)
cd frontend && pnpm dev
```
Vite proxies all `/api` requests to `http://localhost:8000`.

### Production
```
uv run prod
```
This builds the frontend (`pnpm build`) then serves both the API and the static SPA from a single Uvicorn process on port 8000.

---

## Backend Patterns

### Entry Points (`pyproject.toml`)
- `dev` → `app.main:start` — runs Uvicorn with `reload=True`
- `prod` → `app.main:start_prod` — builds frontend, then runs Uvicorn

### Request Lifecycle
```
Request
  → CORSMiddleware
  → verify_api_key (Depends — no-op if APP_API_KEY not set)
  → Router handler
  → get_session (Depends — yields SQLModel Session)
  → Response
```

### Auth (`app/auth.py`)
- Optional. Controlled entirely by whether `APP_API_KEY` is set in env.
- Accepted as `X-API-Key` header or `?key=` query param.
- Applied globally at router registration in `main.py`, not per-route.

### Adding a New Resource
1. Create `app/models/my_model.py` — SQLModel table + Pydantic schemas.
2. Create `app/routers/my_resource.py` — CRUD routes using `Depends(get_session)`.
3. Register in `app/main.py`: `app.include_router(my_router, prefix="/api/v1/my-resource", dependencies=[Depends(verify_api_key)])`.
4. Import the model in `app/database.py` so `create_db_and_tables()` picks it up.

### Settings (`app/config.py`)
All env vars use the `APP_` prefix:
- `APP_DATABASE_DIR` — directory for the SQLite file (default: `~/.app-seed/`)
- `APP_HOST` — bind host (default: `0.0.0.0`)
- `APP_PORT` — bind port (default: `8000`)
- `APP_API_KEY` — if omitted, auth is fully disabled

---

## Frontend Patterns

### Routing
- **File-based**: add a file to `src/routes/` and TanStack Router auto-registers it.
- `routeTree.gen.ts` is auto-generated by the Vite plugin — never edit it manually.
- Root layout is `src/routes/__root.tsx`. Nest layouts by following TanStack Router conventions.

### Auth Flow
1. On app mount, `AuthProvider` calls `GET /api/v1/auth/required` (public endpoint).
2. If auth is required, it tries `GET /api/v1/auth/check` with the stored key from `localStorage`.
3. `AuthGate` (in `__root.tsx`) renders `<Login />` if not authenticated, otherwise renders the app.
4. API key is stored in `localStorage` under the key `app_api_key`.

### API Client (`src/lib/api.ts`)
- `request<T>(path, options)` — base fetch wrapper, auto-injects `X-API-Key` from localStorage.
- Throws `Error` with the API's `detail` message on non-OK responses.
- Extend by adding typed functions alongside the existing `auth` and `notes` objects.

### State Management
- No external store. Each route/page uses local `useState`.
- The only shared state is auth, via `AuthContext`.
- Use `useAuth()` hook to get `{ isAuthenticated, isLoading, login, logout }`.

### Adding a New Page
1. Create `src/routes/my-page.tsx` — export a `Route` created with `createFileRoute('/my-page')`.
2. TanStack Router regenerates `routeTree.gen.ts` automatically on save.
3. Add a nav entry in `src/components/layout/icon-sidebar.tsx`.

### Styling Conventions
- Tailwind v4: no config file — use CSS variables and `@theme` in `styles.css` for tokens.
- `cn(...)` from `src/lib/utils.ts` for all conditional className composition.
- Design tokens in use: `#1a1a1a` dark, `#f0f0f0` background, `orange-500` for active/accent.
- Fonts: Inter (UI), JetBrains Mono (code), both loaded as CSS variable fonts.
- shadcn components live in `src/components/ui/`. Add new ones with the shadcn CLI.

---

## Key Files to Read First

When starting work on this codebase, these files give the most context:

| File | Why |
|---|---|
| `app/main.py` | How the app is assembled and what routes exist |
| `app/config.py` | All configurable settings |
| `app/routers/notes.py` | The reference CRUD pattern to follow |
| `app/models/note.py` + `schemas.py` | How models and request schemas are structured |
| `frontend/src/routes/__root.tsx` | Root layout and auth wiring |
| `frontend/src/lib/api.ts` | How the frontend talks to the backend |
| `frontend/src/lib/auth.tsx` | Auth state management |
| `frontend/src/routes/index.tsx` | The reference page/feature pattern to follow |

---

## What to Replace When Using This Seed

| Thing to replace | Location |
|---|---|
| `Note` model | `app/models/note.py`, `app/models/schemas.py` |
| Notes router | `app/routers/notes.py` |
| Notes UI page | `frontend/src/routes/index.tsx` |
| App name / DB dir | `app/config.py` (`APP_DATABASE_DIR` default) |
| Sidebar nav items | `frontend/src/components/layout/icon-sidebar.tsx` |
| API client methods | `frontend/src/lib/api.ts` |
