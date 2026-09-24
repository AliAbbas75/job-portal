# CLAUDE.md: Pakistan Railways Job Portal

This file is the entry point for everyone working on this repo: the five team members and any Claude Code session. Read it before writing code.

## 1. Before you touch any code (mandatory)

Every change follows this order. No exceptions, including for small fixes.

1. **Pull** the latest `main`: `git checkout main && git pull`
2. **Claim a task** in [workspace/TASKS.md](workspace/TASKS.md): set Owner and Status `IN PROGRESS`, commit and push that change on its own **before** starting work. If the task doesn't exist, add it first.
3. **Branch**: `git checkout -b <name>/<task-id>-<short-desc>` (e.g. `hadi/T-020-signup-api`).
4. **Do the work.**
5. **Log it** in your own file under [workspace/logs/](workspace/logs/): what changed, which files, migrations, follow-ups.
6. **Commit** with the task ID in the message, then **push** and open a pull request into `main`.
7. **Update the task** to `IN REVIEW`, then `DONE` after merge.

The full procedure, with templates and conflict rules, is in [workspace/WORKFLOW.md](workspace/WORKFLOW.md).

### Rules for Claude Code sessions

- At the start of a session, find out which team member you're working for (ask if it isn't clear; don't guess from `git config user.name`). Use their name for task ownership, their log file and their branch prefix.
- Before editing code, confirm a task in `workspace/TASKS.md` is claimed by that person and marked `IN PROGRESS`. If not, claim it (or create it) first and tell the user.
- Never start work on a task owned by someone else unless the user explicitly says it's been handed over; record the handover as a note under that milestone's table in TASKS.md.
- Before committing, append the entry to the member's log in `workspace/logs/` and include it in the same commit.
- Commit and push only when the user asks. Never force-push to `main`.

## 2. Team

| Member  | Branch prefix | Log file |
|---------|---------------|----------|
| Ali     | `ali/`        | [workspace/logs/ali.md](workspace/logs/ali.md) |
| Anum    | `anum/`       | [workspace/logs/anum.md](workspace/logs/anum.md) |
| Hadi    | `hadi/`       | [workspace/logs/hadi.md](workspace/logs/hadi.md) |
| Malaika | `malaika/`    | [workspace/logs/malaika.md](workspace/logs/malaika.md) |
| Umaima  | `umaima/`     | [workspace/logs/umaima.md](workspace/logs/umaima.md) |

Use the name exactly as spelled above as the Owner on the task board.

## 3. What we're building

A recruitment portal for Pakistan Railways: admins create, approve and publish jobs; candidates keep one permanent profile (keyed by CNIC) and apply to jobs; staff screen applications through to merit lists and offers.

The source of truth for the product flow is [docs/railway-job-portal-master-flow.md](docs/railway-job-portal-master-flow.md) (diagram: [docs/job-portal-initial-flow.drawio](docs/job-portal-initial-flow.drawio)). Items tagged **[Proposed]** there are not yet signed off. Don't build them as final behaviour without checking the task notes or [workspace/MILESTONES.md](workspace/MILESTONES.md).

### Domain rules that code must never violate

1. **One permanent `CandidateProfile` per CNIC.** It's created at signup and never deleted with a job or application. CNIC is unique at the database level.
2. **Profile, Job and Application are separate entities.** An application stores only what the job needs, plus a reference to the candidate.
3. **Submitted applications are frozen.** On submit, write an `ApplicationSnapshot`. Later profile edits must not change a submitted application.
4. **One application per CNIC per job.** Enforce with a unique constraint, not only in the UI.
5. **Eligibility runs on structured data.** `JobRequirement` rows (qualification level, discipline, min marks, experience years, age range, domicile, documents) are compared to structured profile fields. Uploaded resumes are supporting material, never the eligibility source.
6. **BPS is a filter and classification, not an eligibility rule.** Below BPS-15 and BPS-15 and above share one data model; they differ only in how data is entered and which extra sections appear.
7. **Age is never collected.** Calculate it from DOB, as of the job's closing date (or the advertisement's cutoff date if set).
8. **A candidate never has to complete the whole profile to apply.** The application check shows only what's missing for that job.
9. **Approved jobs are locked.** Any change after publication goes through a `Corrigendum` with its own approval.
10. **Every admin action is audited** (create, approve, return, reject, publish, corrigendum, screening decisions) and every application status change writes a `StatusEvent`.

## 4. Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | React (Vite), React Router, Axios |
| Backend | Python 3.11+, Flask (app factory + blueprints) |
| ORM / migrations | Flask-SQLAlchemy, Flask-Migrate (Alembic) |
| Validation / serialization | Marshmallow |
| Auth | Flask-JWT-Extended (OTP-based candidate login, role-based staff login) |
| Database | PostgreSQL 16 |
| Tests | pytest (backend), Vitest + React Testing Library (frontend) |
| Lint / format | Ruff + Black (Python), ESLint + Prettier (JS) |

Adding a new dependency needs a task and a line in the log explaining why.

## 5. Architecture: MVC

The project follows MVC across the two apps:

| MVC role | Where it lives | Responsibility |
|----------|----------------|----------------|
| **Model** | `backend/app/models/` | SQLAlchemy models, relationships, DB constraints. No HTTP code. |
| **Controller** | `backend/app/controllers/` | Flask blueprints. Parse the request, call a service, return a response. Keep them thin. |
| **View** | `backend/app/schemas/` + `frontend/` | Marshmallow schemas define the JSON the API exposes; React renders it. |
| Services (supporting layer) | `backend/app/services/` | Business logic: eligibility checks, approval rules, snapshots, screening, notifications. Called by controllers, uses models. |

Request flow: `React page → api/ client → Flask controller → service → model → PostgreSQL`, and back out through a schema.

Rules:
- Controllers never run raw queries or contain business rules; put that in a service.
- Models never import from controllers or services.
- Frontend components never call Axios directly; they use functions in `frontend/src/api/`.
- All API routes are prefixed `/api/` and return JSON.

### Repo layout

The full annotated tree, the "where does it go?" table and the layer import rules are in **[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**. Read it before creating any file.

```
backend/
  app/
    models/            # M: SQLAlchemy models, one module per entity (job.py)
    schemas/           # V: Marshmallow schemas (job_schema.py)
    controllers/       # C: candidate/public blueprints (job_controller.py)
      admin/           # C: staff/admin blueprints under /api/admin
    services/          # business logic (eligibility_service.py)
    scheduler/         # timed jobs: publish, auto-close, screening
    utils/             # generic helpers, no domain logic
  scripts/             # seed / maintenance scripts
  tests/               # models/ services/ controllers/, mirroring app/
frontend/src/
  api/                 # one module per backend resource (jobs.js)
  pages/               # public/ candidate/ admin/: route-level screens (JobDetailsPage.jsx)
  components/          # common/ forms/ layout/: reusable UI
  hooks/ context/ routes/ i18n/ utils/ styles/ assets/
docs/                  # product flow, structure guide
workspace/             # tasks, milestones, workflow, per-member logs
```

## 6. Conventions

**Python**
- `snake_case` for modules, functions and columns; `PascalCase` for models and schemas.
- Table names are plural snake_case (`candidate_profiles`, `job_requirements`).
- Every schema change goes through a migration: `flask db migrate -m "<task-id> <desc>"`, then review the generated file. Never edit the database by hand.
- Config and secrets come from environment variables. Commit `.env.example`, never `.env`.

**React**
- Functional components and hooks only. `PascalCase.jsx` for components, `camelCase.js` for everything else.
- All user-facing text goes through `i18n/` (English and Urdu are both required).
- Build mobile-first and keep bundles small; many candidates are on low-bandwidth connections.

**Data and security**
- CNIC, phone and uploaded documents are personal data. Don't log them, don't put them in URLs, don't commit real samples.
- Validate file uploads (type, size) on the server, not only in the browser.
- Rate-limit OTP and signup endpoints.

**Tests**
- New service logic (especially eligibility, age calculation, approval rules, snapshots) needs pytest coverage in the same PR.

## 7. Keeping the repo clean (agents must follow)

Full rules: [docs/PROJECT_STRUCTURE.md §5](docs/PROJECT_STRUCTURE.md#5-repo-hygiene-rules). The ones agents most often get wrong:

- **Put files where the structure guide says.** Check the "where does it go?" table first. Don't create new top-level folders or new folders under `backend/app/` or `frontend/src/` without a task and the user's approval.
- **Only create files the current task needs.** No stubs, placeholders, example files, or "for later" modules.
- **Search before creating.** Reuse an existing service, component, hook or helper instead of writing a near-duplicate.
- **Name files by the conventions:** `<entity>.py` in models; `<entity>_schema.py`, `<resource>_controller.py`, `<area>_service.py` in the other layers; `NamePage.jsx` for pages; `useName.js` for hooks.
- **Respect layer boundaries:** no queries in controllers, no `flask.request` in services, no Axios calls in components.
- **Leave no debris:** no `print`/`console.log`, commented-out code, scratch files, backup files (`*_old.py`, `copy of ...`), or unrelated reformatting of files outside the task.
- **Don't add dependencies** without telling the user and noting the reason in the work log.
- **Never commit** `.env`, uploads, build output, `node_modules/`, virtualenvs, or real personal data. If a new kind of generated file appears, add it to `.gitignore`.
- **Delete `.gitkeep`** from a folder when adding its first real file.
- **Before committing**, run `git status`, stage only this task's files, and list every created or deleted file in the work log.

## 8. Git

- `main` is always deployable. All code reaches `main` through a pull request reviewed by at least one other team member.
- The only direct pushes to `main` allowed are task-board claims/status changes in `workspace/TASKS.md` (see WORKFLOW.md).
- Commit message format: `<type>(<scope>): <summary> [T-###]`
  - types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
  - example: `feat(auth): add CNIC signup endpoint [T-020]`

## 9. Key files

- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md): where code goes, naming, repo hygiene
- [workspace/WORKFLOW.md](workspace/WORKFLOW.md): the step-by-step team process
- [workspace/TASKS.md](workspace/TASKS.md): central task board
- [workspace/MILESTONES.md](workspace/MILESTONES.md): milestones and open questions
- [workspace/logs/](workspace/logs/): one work log per member
- [docs/railway-job-portal-master-flow.md](docs/railway-job-portal-master-flow.md): product flow
