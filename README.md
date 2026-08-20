# CardioSense — Frontend

The React frontend for CardioSense: a clinical-decision-support dashboard for intake, tracking, and RAG-backed cardiovascular/hypertension risk assessment of patient cases.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- TanStack React Query for server state
- React Router for navigation
- lucide-react for icons

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL to the backend's URL
npm run dev            # http://localhost:5173
```

### Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (default `http://localhost:8000`) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Reserved for potential direct-Supabase features; not currently used by any page |

## Pages

| Route | Component | Purpose |
|---|---|---|
| `/` | `Dashboard.tsx` | Lists all patient cases with BP classification, risk-factor badges, and summary stats. Auto-refreshes every 15s |
| `/new-case` | `NewCase.tsx` | Patient intake form — demographics, vitals, risk factors, symptoms/medications |
| `/cases/:caseId` | `CaseDetails.tsx` | Case detail + the AI assistant chat: starts/resumes a session, renders the risk assessment (with citations and a confidence badge), and supports follow-up messages |

## Services (`src/services/`)

- `caseService.ts` — CRUD against `/api/cases`
- `agentService.ts` — `createSession`, `getSession`, `getSessionByCase`, `sendMessage` against `/api/agent/sessions`

## Notable design decisions

- **Session resumption checks the backend, not just localStorage.** `CaseDetails.tsx` remembers a case's session ID in `localStorage` for fast reload, but a fresh browser/device (or cleared storage) falls back to `GET /api/agent/sessions/by-case/{case_id}` — otherwise a case with an existing chat would silently show "Start AI Evaluation" again on a first visit from a new browser.
- **The assistant's markdown is rendered by a small dependency-free formatter** (`AssistantMessageContent` in `CaseDetails.tsx`) — it only needs to handle the specific subset (`###` headers, `**bold**`, `- ` bullets) that the backend actually emits, so a full markdown library wasn't worth the bundle size.
- **Risk/confidence badges are color-coded from the backend's own values**, not re-derived in the frontend: `session.state.risk_category` and `session.state.retrieval_confidence` come directly from the API (see `SessionState` in `src/types/index.ts`); the frontend only maps them to a color bucket for display.

## Build

```bash
npm run build    # tsc -b && vite build, output in dist/
npm run preview  # serve the production build locally
```
