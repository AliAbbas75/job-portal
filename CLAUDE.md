# CLAUDE.md: Pakistan Railways Job Portal

This file is the entry point for everyone working on this repo: the five team members and any Claude Code session. Read it before writing code.

## 1. Before you touch any code (mandatory)

There are only two branches: **`develop`**, where everyone works and pushes directly, and **`main`**, which only receives releases. No other branches and no pull requests. Work is claimed by **milestone** (development phase). Every change follows this order, including small fixes.

1. **Claim a milestone** yourself (no one's permission needed): fill in the **Claim** block of its file in [workspace/milestones/](workspace/milestones/) (alone or as a co-owner), commit and push it. Overview and dependencies: [workspace/MILESTONES.md](workspace/MILESTONES.md).
2. **Pull first:** `git checkout develop && git pull --rebase`.
3. **Mark your tasks** in the **Tasks** table of that milestone file: your name + `IN PROGRESS`, then `DONE`.
4. **Log your work** in your own file under [workspace/logs/](workspace/logs/): what changed, which files, migrations, follow-ups.
5. **Commit with the task ID**, run the checks, `git pull --rebase`, then `git push` to `develop`.
6. **When the milestone is done,** set its Status to `Done`. Only the **project lead (Ali)** releases `develop` into `main` (merge + tag).

The full procedure, with commands and what to do when a push or pull goes wrong, is in [workspace/WORKFLOW.md](workspace/WORKFLOW.md).

### Rules for Claude Code sessions

- At the start of a session, find out which team member you're working for and which milestone/task (ask if it isn't clear; don't guess from `git config user.name`).
- Work on `develop`. Never create other branches or pull requests.
- Before editing code, confirm that person is an owner in the milestone's file in `workspace/milestones/` and that the task has their name and `IN PROGRESS` (set it if not, and tell the user).
- If the milestone isn't claimed, stop and tell the user. Claim it only when they ask.
- Never work on a task another owner has taken unless the user says it's been handed over; add a line under **Notes** in the milestone file.
- To avoid merge conflicts: in `workspace/`, edit only the current milestone's file and the member's own log; add lines to shared registry files (`models/__init__.py`, `controllers/__init__.py`, `routes/AppRoutes.jsx`, `routes/paths.js`) in alphabetical position, never at the end; put UI text in `frontend/src/i18n/en/<area>.json`; don't reformat, rename or move files the task doesn't need. See WORKFLOW.md → How we avoid merge conflicts.
- Before committing, add the entry to the member's log in `workspace/logs/` and include it in the same commit.
- Commit and push only when the user asks. Before pushing, run the checks and `git pull --rebase`. Never force-push, and never push to `main` unless the project lead asks for a release.

## 2. Team

| Member  | Log file |
|---------|----------|
| Ali     | [workspace/logs/ali.md](workspace/logs/ali.md) |
| Anum    | [workspace/logs/anum.md](workspace/logs/anum.md) |
| Hadi    | [workspace/logs/hadi.md](workspace/logs/hadi.md) |
| Malaika | [workspace/logs/malaika.md](workspace/logs/malaika.md) |
| Umaima  | [workspace/logs/umaima.md](workspace/logs/umaima.md) |

Use the names exactly as spelled above in milestone files (Owners, task Owner).

**Project lead: Ali.** The lead's only special job is releasing `develop` → `main` (plus repo settings and recording stakeholder decisions). Everyone claims, builds, reviews and merges milestones themselves.

## 3. What we're building

A recruitment portal for Pakistan Railways: admins create, approve and publish jobs; candidates keep one permanent profile (keyed by CNIC) and apply to jobs; staff screen applications through to merit lists and offers.

**Current scope: the master flow up to §4.9 Application Tracking** (milestones M0–M6). Screening (§5), notifications, Urdu, reports and deployment (§6) are deferred. Don't build them unless a milestone for them exists in MILESTONES.md.

The source of truth for the product flow is [docs/railway-job-portal-master-flow.md](docs/railway-job-portal-master-flow.md) (diagram: [docs/job-portal-initial-flow.drawio](docs/job-portal-initial-flow.drawio)). Items tagged **[Proposed]** there are not yet signed off. Don't build them as final behaviour without checking the task notes or [workspace/MILESTONES.md](workspace/MILESTONES.md).

### Domain rules that code must never violate

1. **One permanent `CandidateProfile` per CNIC.** It's created at signup and never deleted with a job or application. CNIC is unique at the database level.
2. **Profile, Job and Application are separate entities.** An application stores only what the job needs, plus a reference to the candidate.
3. **Submitted applications are final.** On submit, write an `ApplicationSnapshot`. Later profile edits must not change a submitted application, and candidates can't edit or withdraw it. Don't add edit or withdraw endpoints.
4. **One application per CNIC per job.** Enforce with a unique constraint, not only in the UI.
5. **Eligibility runs on structured data.** `JobRequirement` rows (qualification level, discipline, min marks, experience years, age range, domicile, documents) are compared to structured profile fields. Uploaded resumes are supporting material, never the eligibility source.
6. **BPS is a filter and classification, not an eligibility rule.** Below BPS-15 and BPS-15 and above share one data model; they differ only in how data is entered and which extra sections appear.
7. **Age is never collected.** Calculate it from DOB, as of the job's closing date (or the advertisement's cutoff date if set).
8. **A candidate never has to complete the whole profile to apply.** The application check shows only what's missing for that job.
9. **Approved jobs are locked, and published jobs are final.** No edits after publication and no corrigendum process. Don't add edit endpoints for published jobs.
10. **Every admin action is audited** (create, approve, return, reject, publish, application status changes) and every application status change writes a `StatusEvent`.

## 4. Tech stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React / Next.js | User interface |
| UI | Tailwind CSS | Consistent responsive design |
| API | Flask | Backend REST API |
| API Server | Gunicorn | Production Flask server |
| Reverse Proxy | Nginx | Traffic gateway |
| Edge Security | Cloudflare | CDN, WAF, DDoS protection |
| ORM | SQLAlchemy | Database interaction |
| Database | PostgreSQL | Main source of truth |
| Migration | Alembic / Flask-Migrate | Database version control |
| Validation | Marshmallow | Request/response validation |
| Authentication | JWT | API authentication |
| Password Hashing | Argon2id | Secure password storage |
| Cache | Redis | Fast temporary data |
| Background Jobs | Celery | Async processing |
| Broker | Redis initially | Celery task queue |
| Search | OpenSearch | Advanced job/CV search |
| File Storage | S3-compatible object storage | CVs/documents |
| API Docs | OpenAPI / Swagger | API documentation |
| Containers | Docker | Deployment consistency |
| Monitoring | Prometheus | Metrics |
| Dashboards | Grafana | Monitoring visualization |
| Errors | Sentry | Application error tracking |
| Logs | Structured logging | Debugging/auditing |
| CI/CD | GitHub Actions/GitLab CI | Automated testing/deployment |

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
  hooks/ context/ routes/ i18n/ utils/ assets/
  index.css            # the only stylesheet: Tailwind v4 + brand theme
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
- All user-facing text goes through `t()` with strings in `i18n/en/<area>.json` (one file per namespace, e.g. `jobs.json` for `t('jobs.…')`; a new file needs no registration), never hard-coded. English only for now; Urdu is deferred but must be addable without touching components.
- Build mobile-first and keep bundles small; many candidates are on low-bandwidth connections.
- **Styling is Tailwind CSS v4, controlled from one file: `frontend/src/index.css`.** Components use Tailwind utility classes only. No other `.css` files, no CSS Modules, no inline `style` except for computed values (e.g. a progress width).
- **Follow the brand guide** ([docs/pakistan-railways-brand-guidelines.md](docs/pakistan-railways-brand-guidelines.md)). `index.css` enforces most of it: the `@theme` removes Tailwind's default palette and shadows, so only the 8 brand colours exist (`heritage`, `ember`, `gold`, `pumpkin`, `surface`, `cream`, `white`, `black`). Never use arbitrary colours (`bg-[#...]`), gradients (`bg-linear-*`), or gold/pumpkin for body text on white. New design tokens go in `@theme` in `index.css`, nowhere else.
- **Dropdowns:** always use `components/forms/Select.jsx` (or `SelectField` with a label), never a native `<select>`. It always shows 4 options and scrolls beyond that, and is keyboard- and screen-reader-accessible.
- Join conditional classes with `cx()` (`utils/cx.js`). Never put two utilities for the same property in one class list (e.g. `font-medium` and `font-bold`): Tailwind doesn't guarantee which wins. Put alternatives in the two branches of a condition instead.
- Prettier sorts Tailwind classes automatically (`prettier-plugin-tailwindcss`).
- **Mock mode:** with `VITE_USE_MOCKS=true` (the default), `src/api/*` serves data from `src/api/mocks/`. When a backend endpoint lands, match the request/response shape the mock uses (the endpoint paths are in each `src/api/<resource>.js`) and pages need no changes. Error responses are `{ code, message }` (validation errors add `fields: { field: [messages] }`); the UI maps `code` to `errors.<code>` in `i18n/en/errors.json`.
- **Candidate API auth:** candidate endpoints use `@candidate_required` (`backend/app/controllers/auth_guard.py`). The token is a Flask-JWT-Extended access token whose identity is the candidate account id (as a string) with the claim `{"role": "candidate"}`. Issued by `auth_service.candidate_token()`; tests mint it with the `auth_headers` fixture.
- **Staff API auth:** admin endpoints live in `controllers/admin/` under `/api/admin` and use `@staff_required(StaffRole.APPROVER, ...)` (no roles = any staff). Staff tokens carry `{"role": "staff", "staffRole": ...}`; the guard reads the role from the database, so a role change applies at once. Tests use the `make_staff` and `staff_headers` fixtures. In the frontend, requests to `/admin/...` carry the staff token automatically; guard admin routes with `<RequireStaff roles={[...]}>`.
- There is **no CI** (no GitHub Actions); don't add any. Checks run locally: pre-commit hooks on every commit, and the four checks in [workspace/WORKFLOW.md](workspace/WORKFLOW.md#checks-there-is-no-ci) before every push. Before saying work is done, run them and report the results.

**Data and security**
- CNIC, phone and uploaded documents are personal data. Don't log them, don't put them in URLs, don't commit real samples.
- Validate file uploads (type, size) on the server, not only in the browser.
- Rate-limit OTP and signup endpoints.

**Tests**
- New service logic (especially eligibility, age calculation, approval rules, snapshots) needs pytest coverage in the same push.

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

- **`develop`**: where all work happens, and the GitHub default branch. Everyone commits and pushes here directly. `git pull --rebase` before starting and before every push.
- **`main`**: released versions only. The project lead merges `develop` into it (`git merge --no-ff develop`) and tags it (`m2`). Nobody else pushes to it.
- No other branches, no pull requests, no force pushes, no rewriting pushed history. To undo a pushed commit, `git revert` it.
- Commit message format: `<type>(<scope>): <summary> [T-###]`
  - types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
  - example: `feat(auth): add CNIC signup endpoint [T-020]`

## 9. Key files

- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md): where code goes, naming, repo hygiene
- [docs/pakistan-railways-brand-guidelines.md](docs/pakistan-railways-brand-guidelines.md): colours, type, logo rules for all UI
- [docs/pakrail-candidate-journey.html](docs/pakrail-candidate-journey.html): Figma candidate journey screens (open in a browser); brand guide wins on colours and fonts
- [workspace/WORKFLOW.md](workspace/WORKFLOW.md): the step-by-step team process
- [workspace/MILESTONES.md](workspace/MILESTONES.md): milestone overview, dependencies, deferred work, open questions
- [workspace/milestones/](workspace/milestones/): one file per milestone: claim, status, scope, done-when, tasks
- [workspace/logs/](workspace/logs/): one work log per member
- [docs/railway-job-portal-master-flow.md](docs/railway-job-portal-master-flow.md): product flow
