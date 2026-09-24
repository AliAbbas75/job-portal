# Pakistan Railways Job Portal

Recruitment portal where admins create, approve and publish jobs, candidates keep one permanent CNIC-based profile and apply, and staff screen applications through to merit lists and offers.

**Stack:** React (Vite) · Python Flask · PostgreSQL · MVC architecture

## Start here

| Read | For |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Project rules, architecture, conventions (humans and AI agents) |
| [workspace/WORKFLOW.md](workspace/WORKFLOW.md) | How to claim a task, log work, commit and push |
| [workspace/TASKS.md](workspace/TASKS.md) | Task board |
| [workspace/MILESTONES.md](workspace/MILESTONES.md) | Milestones and open questions |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Where code goes, naming, repo hygiene |
| [docs/railway-job-portal-master-flow.md](docs/railway-job-portal-master-flow.md) | Product flow |

## Repository layout

```
backend/    Flask API: models (M), schemas + React (V), controllers (C), services
frontend/   React app
docs/       Product and technical documentation
workspace/  Tasks, milestones, per-member work logs
```

## Local setup

### Frontend (React)

Needs Node.js 20 or later.

```bash
cd frontend
cp .env.example .env      # VITE_USE_MOCKS=true serves sample data, no backend needed
npm install
npm run dev               # http://localhost:5173
```

In mock mode, sign up with any valid CNIC and mobile number and use the code **123456**. Data is kept in your browser's localStorage.

| Command | Does |
|---|---|
| `npm run dev` | Dev server (proxies `/api` to Flask on port 5000) |
| `npm test` | Unit and component tests (Vitest) |
| `npm run lint` / `npm run format` | ESLint / Prettier |
| `npm run build` | Production build into `frontend/dist/` |

### Backend and database

Setup steps will be added as they land: Flask (T-002), PostgreSQL via docker-compose (T-003).

## Team

Ali · Anum · Hadi · Malaika · Umaima
