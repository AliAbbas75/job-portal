# Pakistan Railways Job Portal

Recruitment portal where admins create, approve and publish jobs, candidates keep one permanent CNIC-based profile and apply, and staff screen applications through to merit lists and offers.

**Stack:** React (Vite) · Python Flask · PostgreSQL · MVC architecture

## Start here

| Read | For |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Project rules, architecture, conventions (humans and AI agents) |
| [workspace/WORKFLOW.md](workspace/WORKFLOW.md) | How to claim a milestone, work, sync, open and merge PRs |
| [workspace/milestones/](workspace/milestones/) | One file per milestone: owners, status, tasks |
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

### Database (PostgreSQL)

Needs Docker Desktop running.

```bash
docker compose up -d db   # PostgreSQL 16 on localhost:5433, plus a job_portal_test database
```

Port 5433 is used so it doesn't clash with a PostgreSQL already installed on 5432.

### Backend (Flask)

Needs Python 3.11 or later.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # defaults match docker-compose.yml
flask db upgrade                # create the tables
flask seed                      # load departments, provinces, qualifications, document types
flask run                       # http://localhost:5000/api/health
```

| Command | Does |
|---|---|
| `pytest` | Backend tests (uses the `job_portal_test` database, rebuilt each run) |
| `ruff check .` / `black .` | Lint / format |
| `flask db migrate -m "T-### what changed"` | New migration after a model change (review it!) |
| `flask db check` | Confirms models and migrations match |

### Git hooks

Once per clone, from the repo root: `pre-commit install` (it's in `requirements-dev.txt`). Commits then run Ruff, Black, ESLint and Prettier on the files you changed.

There is no CI. Before opening a pull request, run the four checks in [workspace/WORKFLOW.md](workspace/WORKFLOW.md#checks-there-is-no-ci); reviewers run them too before approving.

## Team

Ali · Anum · Hadi · Malaika · Umaima
