# Work Log: Ali

Newest entries at the top. Template and rules: [../WORKFLOW.md](../WORKFLOW.md#step-4-work-and-log).

<!-- Copy this block for each entry:

### YYYY-MM-DD | T-### Task title
- **Status:** Done / Partial / In progress
- **Milestone:** M# (branch m#-milestone-name)
- **What changed:**
  - `path/to/file`: what and why
- **Database:** migrations, or "none"
- **Commits:**
  - `type(scope): summary [T-###]`
- **How to test:**
- **Notes / follow-ups:**

-->

### 2026-09-25 | M2: candidate signup/login with OTP, staff login and roles (T-020 to T-023, T-026)
- **Milestone:** M2 (branch m2-authentication)
- **Status:** Done for T-020 to T-023 and T-026; M2 stays In progress (T-024 [P], and T-027/T-028 from the design PR)
- **What changed:**
  - Models: `otp_challenge.py` (`OtpChallenge`: hashed code, expiry, attempts), `revoked_token.py` (`RevokedToken` for logout), `OtpPurpose` enum; registered in `models/__init__.py`
  - Services: `otp_service.py` (issue/verify, 5 min expiry, 60 s resend, 5 per hour per CNIC or mobile, 5 wrong tries), `sms_service.py` (stub: console in dev, memory in tests, refuses otherwise), `captcha_service.py` (Cloudflare Turnstile when `CAPTCHA_SECRET_KEY` is set), `auth_service.py` (signup creates account + permanent profile + audit entry; login; candidate token; token revocation), `staff_service.py` (Argon2id passwords, login with one error for every failure, staff token, audit entry)
  - Schemas: `auth_schema.py` (CNIC/mobile/OTP input, mobile dash removed; session JSON matching `authMock.js`), `staff_schema.py`
  - Controllers: `auth_controller.py` (`/api/auth/<signup|login>/otp|verify`, `/session`, `/logout`), `admin/auth_controller.py` (`/api/admin/auth/login|session|logout`), `auth_guard.py` (`@staff_required(*roles)`, revoked-token check), `errors.py` (revoked token → unauthorized), `controllers/__init__.py` registers `/api/admin` blueprints
  - `commands.py`: `flask create-staff`. `config.py` + `.env.example`: OTP limits, `SMS_BACKEND`, `CAPTCHA_SECRET_KEY`
  - Dependency: `argon2-cffi==25.1.0` in `requirements.txt`. Why: Argon2id password hashing for staff, as the tech stack in CLAUDE.md requires; Werkzeug's built-in hashing doesn't offer Argon2
  - Tests: `services/test_otp_service.py`, `services/test_staff_service.py`, `controllers/test_auth_controller.py`, `controllers/admin/test_admin_auth_controller.py`; conftest fixtures `sms_outbox`, `last_otp`, `make_staff`, `staff_headers` (101 backend tests)
  - Frontend (T-026): `api/adminAuth.js` + `api/mocks/adminAuthMock.js`, `api/client.js` (staff token on `/admin/...` requests), `context/StaffAuthContext.js`, `context/StaffAuthProvider.jsx`, `hooks/useStaffAuth.js`, `routes/RequireStaff.jsx` (+ test), `pages/admin/StaffLoginPage.jsx`, `pages/admin/AdminHomePage.jsx` (removed `pages/admin/.gitkeep`), routes `/admin/login` and `/admin`, `App.jsx`; i18n `staffLogin.json`, `admin.json`, new codes in `errors.json`
  - Docs: README (dev OTP in the flask log, `create-staff`, mock staff logins), CLAUDE.md (staff auth contract), M2 notes, M3 note on using the guards
- **Database:** migration `4a947c997756` (T-021): tables `otp_challenges`, `revoked_tokens`
- **Commits:**
  - `feat(auth): candidate OTP signup/login and staff login with roles [T-020]`
- **How to test:** four checks in WORKFLOW.md. Manual: `flask db upgrade`, `flask create-staff`, `frontend/.env.local` with `VITE_USE_MOCKS=false`, then sign up at `/signup` (code in the `flask run` output) and log in to the staff area at `/admin/login`
- **Notes / follow-ups:** account recovery not built ([Proposed]); no SMS gateway yet; per-IP rate limiting and staff lockout left for deployment/security review. `frontend prettier` hook fails on 4 files from `develop` that this branch doesn't touch (`Logo.jsx`, `FaqSection.jsx`, `SiteFooter.jsx`, `JobListItem.jsx`).
### 2026-09-25 | Figma candidate journey: tasks added to M2, M3, M4, M6
- **Milestone:** none (planning, branch `fix/candidate-journey-tasks`, PR into `develop`)
- **Status:** Done
- **What changed:**
  - `docs/pakrail-candidate-journey.html` (new): the Figma candidate journey as a structural HTML skeleton. Sample CNIC, mobile, email, name and address replaced with dummy values before committing.
  - `workspace/milestones/M2-authentication.md`: T-027 (auth screens to match the design), T-028 (telecom operator, remember me); note that "Forgot Password?" isn't built (no passwords)
  - `workspace/milestones/M3-job-admin.md`: note on the extra job fields the job form must capture
  - `workspace/milestones/M4-candidate-portal.md`: status back to In progress; T-049 and T-140 marked DONE (Malaika's FAQ, news bar, footer, already merged); new T-141 to T-149 (header/nav, home sections, `/jobs` table page, job details, profile page, conventions cleanup, job category, job detail fields, profile quota/age-relaxation fields)
  - `workspace/milestones/M6-applications.md`: T-069 (dashboard page), T-160 (6-step apply wizard), T-161 (OTP re-check), T-162 (dashboard API), T-163 [P] (CNIC OCR prefill); rule 8 (only missing items) overrides the design's full-profile steps
  - `workspace/MILESTONES.md`: task ID overflow rule (100 + range start), link to the design, open questions 5 to 8
  - `CLAUDE.md`: design file in key files
- **Database:** none
- **Commits:**
  - `docs(workspace): add Figma candidate journey and its tasks [fix]`
- **How to test:** open `docs/pakrail-candidate-journey.html` in a browser; screen list bottom-right
- **Notes / follow-ups:** open questions 5 to 8 need stakeholder answers before T-148, T-149, T-161, T-162. Design colours (blue buttons, Inter) are mapped to brand tokens, per the M4 notes.

### 2026-09-24 | M4 backend: jobs, reference, profile, documents APIs (T-040–T-044)
- **Milestone:** M4 (branch m4-candidate-portal)
- **Status:** Done (M4 complete)
- **What changed:**
  - `backend/app/controllers/`: `job_controller.py` (GET /jobs, /jobs/stats, /jobs/<id>), `reference_controller.py` (GET /reference), `profile_controller.py` (profile sections + education/experience CRUD), `document_controller.py` (vault list/upload/remove), `auth_guard.py` (`@candidate_required`, JWT contract for M2); `__init__.py` registers them alphabetically; `errors.py` returns `validation_error` with `fields`, and JWT failures as `unauthorized`
  - `backend/app/services/`: `job_service.py` (open published jobs only; keyword, BPS, department, type, location, qualification-rank, closing filters; sort; pagination; stats), `reference_service.py`, `profile_service.py` (domicile district must be in province; edit history in audit log: section + field names, no values), `document_service.py` (type-checked upload, replace/remove archive instead of delete), `candidate_service.py`, `demo_seed_service.py`
  - `backend/app/schemas/`: `job_schema.py`, `reference_schema.py`, `profile_schema.py` (per-section input validation, blank strings → missing, read-only cnic/mobile ignored), `document_schema.py`; JSON shapes match the frontend mocks
  - `backend/app/models/`: `constants.py` (BPS ranges, closing windows, labels), `Job.is_open()`, `Job.department` and `CandidateProfile.domicile_district` relationships (no schema change)
  - `backend/app/utils/dates.py`: `age_on()` (T-044)
  - `backend/app/commands.py`: `flask seed-demo` (dev only, gated on config name, since `flask` CLI overrides DEBUG); `config.py`: `ENV_NAME`, 32+ byte test keys; `.env.example`: longer keys + `FLASK_DEBUG=1`
  - Tests: jobs (11), reference, profile (10), documents (6), dates (6), demo seed; conftest `publish_job` + `auth_headers` fixtures, session cleared between tests (74 backend tests)
  - Frontend: quotas use a `category` code translated via new `i18n/en/quota.json` (mock data updated); `.env.example` note
  - Docs: README (seed-demo, real-API mode), CLAUDE.md (auth contract, validation error shape), M2 note on the token T-022 must issue, M4 tasks done
- **Database:** none (relationships only; `flask db check` clean)
- **Commits:**
  - `feat(api): M4 jobs, reference, profile and document endpoints [T-040]`
- **How to test:** four checks in WORKFLOW.md; manual: `flask seed-demo`, `frontend/.env.local` with `VITE_USE_MOCKS=false`, `npm run dev`: job search and details show database jobs
- **Notes / follow-ups:** profile/document pages need M2's login to use the real API from the browser

### 2026-09-24 | Self-serve milestones and conflict-proof layout
- **Milestone:** none (repo maintenance, branch `fix/branch-cleanup`, PR into `develop`)
- **Status:** Done
- **What changed:**
  - `workspace/milestones/M0…M6-*.md` (new): one file per milestone with its Claim block (owners, status, branch, depends on), scope, done-when, tasks and notes. Claims and task updates for different milestones can no longer conflict
  - `workspace/TASKS.md` deleted (tasks moved into the milestone files); `workspace/MILESTONES.md` is now a static overview (index, dependencies, deferred, open questions); changelog table dropped (git history covers it)
  - `workspace/WORKFLOW.md`: roles (owners self-serve; any non-owner reviews and merges; project lead only releases `develop` → `main`); "How we avoid merge conflicts" rules (own files only, sync same day, alphabetical inserts in registry files, one migration head, fast reviews); daily sync check; package-lock and multiple-heads fixes
  - `frontend/src/i18n/en.json` split into `frontend/src/i18n/en/<namespace>.json` (24 files, auto-loaded via `import.meta.glob` in `i18n/index.js`)
  - `CLAUDE.md`, `README.md`, `docs/PROJECT_STRUCTURE.md`: updated to match
- **Database:** none
- **Commits:**
  - `docs(workflow): self-serve milestones, per-milestone files, conflict-avoidance rules`
- **How to test:** four checks in WORKFLOW.md pass; `grep -H -e "Owners:" -e "Status:" workspace/milestones/*.md` lists every milestone
- **Notes / follow-ups:** none

### 2026-09-24 | Branch cleanup and merge process
- **Milestone:** none (repo maintenance, branch `fix/branch-cleanup`, PR into `develop`)
- **Status:** Done
- **What changed:**
  - Removed `.github/workflows/ci.yml` again: a squash merge (PR #10) had silently re-added it
  - Merged `main` into the branch with no file changes (history sync), so the release PR `develop` → `main` merges without conflicts; `main` had only an old front end snapshot from PR #7
  - To do after merge: delete the finished `m1-foundation` branch (merged four times via PRs #7–#10)
  - `workspace/WORKFLOW.md`: rewritten as a fixed step-by-step process: 7 golden rules (merge commits only, two PR directions, one PR per branch, reviewer merges, no "Update branch", no force-push), local sync from `develop`, review/merge steps, troubleshooting table, repo settings (merge commits only)
  - `CLAUDE.md`: Git rules updated to match
- **Database:** none
- **Commits:**
  - `chore: remove ci.yml re-added by a squash merge (no CI in this project)`
  - `Merge main into develop: history sync only, develop's files unchanged`
  - `docs(workflow): merge-commit-only process to stop merge conflicts loops`
- **How to test:** after both PRs merge, `git diff origin/main origin/develop` is empty
- **Notes / follow-ups:** Repo admin must apply the new Pull Request settings (see WORKFLOW.md → Repo settings)

### 2026-09-24 | Remove GitHub Actions; local checks instead
- **Milestone:** M1 (branch m1-foundation)
- **Status:** Done
- **What changed:**
  - Deleted `.github/workflows/ci.yml` (team decision: no CI)
  - `workspace/WORKFLOW.md`: new "Checks (there is no CI)" section (one-time setup incl. `pre-commit install`, four pre-PR checks); reviewer re-runs the checks; only the reviewer merges, after approving; removed the CI branch-protection step; checklist updated
  - `CLAUDE.md`, `README.md`, `docs/PROJECT_STRUCTURE.md`, `workspace/MILESTONES.md`, `workspace/TASKS.md` (T-007 dropped), `backend/pyproject.toml` comment: CI references removed
  - Fixed a corrupted `.venv\Scripts\activate` line in README and WORKFLOW (an invisible control character had replaced `\a`)
- **Database:** none
- **Commits:**
  - `chore: remove GitHub Actions CI; document local checks [M1]`
- **How to test:** follow WORKFLOW.md → Checks; all four pass
- **Notes / follow-ups:** none

### 2026-09-24 | M1 fix: CI pytest import error
- **Milestone:** M1 (branch m1-foundation)
- **Status:** Done
- **What changed:**
  - `backend/pyproject.toml`: `pythonpath = ["."]` for pytest. CI runs plain `pytest`, which doesn't add the working directory to the import path (`python -m pytest` does, which is why it passed locally).
- **Database:** none
- **Commits:**
  - `fix(ci): let pytest import the app package [T-006]`
- **How to test:** `cd backend && pytest` (plain command, as CI runs it): 39 passed
- **Notes / follow-ups:** none

### 2026-09-24 | Frontend: Tailwind v4 + 4-item dropdowns (M1/M4)
- **Milestone:** M1 + M4 frontend (branch m1-foundation)
- **Status:** Done
- **What changed:**
  - `frontend/src/index.css`: new single stylesheet. Tailwind v4 import; `@theme` removes the default palette and all shadows and defines only the 8 brand colours, Instrument Sans, radii and page width; base styles; `page` and `dropdown-list` utilities
  - Deleted `src/styles/` (tokens.css, global.css) and all 22 `*.module.css` files; every component and page now styles with Tailwind classes
  - `src/components/forms/Select.jsx` (new): accessible custom dropdown (WAI-ARIA select-only combobox: arrows, Home/End, Enter/Space, Escape, type-ahead) that always shows 4 options and scrolls beyond; `SelectField` now wraps it; `MoreFilters` uses it; no native `<select>` left
  - `SelectField` `onChange` now receives the value (not an event); callers updated (gender, province, district, qualification, search filters)
  - `src/utils/cx.js` (new): class-name joiner
  - `DocumentUpload`: new `divider` prop (used by the eligibility check list)
  - Tests: `Select.test.jsx` (5 tests); search test updated for the custom dropdown; jsdom `scrollIntoView` stub in `setupTests.js` (26 tests total)
  - `vite.config.js` (Tailwind plugin), `.prettierrc.json` (Tailwind class sorting)
  - `CLAUDE.md`, `docs/PROJECT_STRUCTURE.md`: Tailwind + single-stylesheet rules, dropdown rule, no conflicting utilities
  - `workspace/TASKS.md`, `workspace/MILESTONES.md`: T-008 moved out of M1 to the Open questions table
- **Database:** none
- **Dependencies:** dev: `tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3, `prettier-plugin-tailwindcss` 0.8.1 (requested move to Tailwind v4)
- **Commits:**
  - `refactor(frontend): Tailwind v4 single stylesheet and 4-item Select dropdown [M1]`
- **How to test:** `cd frontend && npm install && npm run dev`; open any dropdown (hero filters, sort/type/qualification/deadline, profile gender/province/district/qualification) and check that 4 options show and the rest scroll. `npm test`, `npm run lint`, `npm run build` pass.
- **Notes / follow-ups:** Screenshots caught two regressions from utility conflicts (timeline last marker offset, current step not bold), both fixed; rule added to CLAUDE.md.

### 2026-09-24 | M1 backend: Flask app, database, data model, seed, tests, CI (T-002, T-003, T-005–T-007, T-010–T-018)
- **Milestone:** M1 (branch m1-foundation)
- **Status:** Done, except T-008 (open questions, needs stakeholders)
- **What changed:**
  - `backend/app/__init__.py`, `config.py`, `extensions.py`, `commands.py`, `wsgi.py`: app factory, env-based config (fails fast if secrets/DB URL missing), SQLAlchemy naming convention, `flask seed`
  - `backend/app/controllers/health_controller.py`, `controllers/errors.py`, `utils/errors.py`: `GET /api/health`; every error returned as `{code, message}` (matches frontend `errors.<code>`)
  - `backend/app/models/`: `reference.py` (departments, provinces, districts, qualification levels, document types), `staff_user.py`, `candidate.py` (account + permanent profile), `profile_records.py` (education, experience, registrations, publications, references), `document.py`, `job.py` (job, requirement, quotas, required documents, domicile provinces), `approval.py`, `application.py` (application, snapshot, status events), `audit_log.py`, `enums.py`, `base.py`
  - Domain rules as DB constraints: unique CNIC + format check, one profile per account, one application per profile per job, one current document per type (partial unique index), BPS 1–22, closing after opening, valid age range, statuses limited to §4.9 (no "withdrawn")
  - `backend/app/services/`: `health_service.py`, `audit_service.py` (T-017 helper), `storage_service.py` (T-013: type by file signature, 2 MB limit, random names), `reference_seed_service.py` (T-018, idempotent upsert, same codes as frontend mocks)
  - `backend/migrations/`: Alembic setup; `49eef685e076_t_010_initial_data_model.py` (hand-added `application_no_seq`); `env.py` deprecated call removed
  - `backend/tests/`: conftest rebuilds the test DB from migrations each run; 39 tests across models, services, controllers
  - `docker-compose.yml`, `backend/scripts/create_test_db.sql`: PostgreSQL 16 on host port 5433 + test database
  - `backend/requirements.txt`, `requirements-dev.txt`, `pyproject.toml`, `.env.example`
  - `.pre-commit-config.yaml` (ruff, black, eslint, prettier), `.github/workflows/ci.yml` (backend + frontend jobs)
  - `README.md` (database, backend, hooks setup), `docs/PROJECT_STRUCTURE.md` (backend items done; migration gotchas), `workspace/TASKS.md`
- **Database:** migration `49eef685e076` (all M1 tables); `flask db check` reports no drift; downgrade/upgrade round trip tested
- **Dependencies:** Flask, Flask-SQLAlchemy, SQLAlchemy, Flask-Migrate/Alembic, flask-marshmallow, marshmallow(-sqlalchemy), Flask-JWT-Extended, psycopg 3, python-dotenv; dev: pytest, ruff, black, pre-commit. All in CLAUDE.md's stack.
- **Env vars:** `DATABASE_URL`, `TEST_DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, `UPLOAD_FOLDER`, `FLASK_APP`, `FLASK_ENV`
- **Commits:**
  - `feat(backend): Flask app, PostgreSQL data model, seed, tests and CI [T-002]`
- **How to test:** `docker compose up -d db`, then in `backend/`: `flask db upgrade && flask seed && pytest` (39 passed); `flask run` → `/api/health` returns `{"status": "ok", "database": true}`, also via the Vite proxy at `localhost:5173/api/health`
- **Notes / follow-ups:**
  - Found and fixed: a CHECK that evaluates to NULL passes in SQL; the experience-dates rule now requires `end_date IS NOT NULL` for past jobs
  - District list is a starter set; load the full official list before launch
  - CI workflow runs for the first time on the next push/PR; check the Actions tab

### 2026-09-24 | Frontend: scaffold, brand theme and candidate pages (T-004, T-005, T-009, T-025, T-045–T-048, T-066–T-068)
- **Milestone:** M1 + M4 frontend (branch m1-foundation)
- **Status:** Done, except T-005 (Python half) and T-068 (admin status UI)
- **What changed:**
  - `frontend/package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.env.example`, `index.html`: Vite + React app, dev proxy `/api` → Flask :5000, Vitest config
  - `frontend/src/styles/`: `tokens.css` (8 brand colours, Instrument Sans, spacing) and `global.css`, per `docs/pakistan-railways-brand-guidelines.md`
  - `frontend/src/api/`: Axios client + `jobs`, `reference`, `auth`, `profile`, `documents`, `applications` modules; `api/mocks/` in-browser mock backend (localStorage) with sample jobs and a mock eligibility check
  - `frontend/src/components/`: common (Button, Badge, StatusBadge, Alert, PageState, Icon, Logo placeholder, DepartmentMark, JobSummary, ApplySteps, ProgressBar, ErrorBoundary), forms (TextField, SelectField, CheckboxField, CnicInput, DocumentUpload, OtpStep), layout (AppLayout, SiteHeader, SiteFooter, AuthCard)
  - `frontend/src/pages/public/`: JobSearchPage (landing + search), JobDetailsPage, SignupPage, LoginPage, NotFoundPage
  - `frontend/src/pages/candidate/`: ProfilePage (8 sections), ApplicationCheckPage, ApplicationReviewPage, MyApplicationsPage, ApplicationDetailPage (status timeline)
  - `frontend/src/context/`, `hooks/`, `routes/`, `i18n/` (en.json + `t()`), `utils/`
  - Tests: validators, format, i18n, mock eligibility, JobSearchPage (21 tests)
  - Job search page revisions: green hero with a search card (keyword + BPS grade, department, location), secondary filters beside the result count, vacancies on every row, Ember Red edge on jobs closing within 7 days, department badges removed from rows; `SearchFilters.jsx` replaced by `SearchCard.jsx` + `MoreFilters.jsx`, `filterKeys.js` renamed `filters.js`
  - Removed `.gitkeep` from frontend folders that now have files
  - `docs/pakistan-railways-brand-guidelines.md`: added (from Ali)
  - `docs/PROJECT_STRUCTURE.md`, `CLAUDE.md`, `README.md`: frontend layout, brand/mock-mode rules, setup steps
  - `workspace/TASKS.md`: T-004, T-009, T-025, T-045–T-048, T-066, T-067 done; T-005, T-068 in progress
- **Database:** none
- **Dependencies:** react, react-dom, react-router-dom, axios (stack in CLAUDE.md); dev: vite, @vitejs/plugin-react, eslint (+ @eslint/js, react-hooks, react-refresh, globals), prettier, vitest, jsdom, @testing-library/react, jest-dom, user-event. The Vite template's `oxlint` was replaced with ESLint to match CLAUDE.md.
- **Env vars:** `VITE_USE_MOCKS` (default true)
- **Commits:**
  - `feat(frontend): React scaffold, brand theme and candidate pages on mock API [T-004]`
- **How to test:** `cd frontend && npm install && npm run dev`; sign up with any valid CNIC/mobile, OTP 123456. `npm test`, `npm run lint`, `npm run build` all pass.
- **Notes / follow-ups:**
  - Logo is a text placeholder (`components/common/Logo.jsx`); swap in the official lockup when files are available.
  - Signup CAPTCHA is a placeholder checkbox until T-020.
  - Fee payment (T-063, proposed) is shown as a note only.
  - Backend owners: the endpoint paths and JSON shapes the UI expects are in `src/api/*.js` and `src/api/mocks/`.

### 2026-09-24 | M0 closed
- **Milestone:** M0 (merged to `develop` and `main` via PRs #2–#6)
- **Status:** Done
- **What changed:**
  - `workspace/MILESTONES.md`: M0 set to Done; M1 renamed "App setup and data model" (branch `m1-foundation`) and given the setup "done when" criteria
  - `workspace/TASKS.md`: unfinished setup tasks T-002 to T-009 moved from M0 to M1
- **Database:** none
- **Commits:**
  - `chore(milestones): close M0, move setup tasks to M1 [M0]`
- **How to test:** n/a
- **Notes / follow-ups:** M1 is ready to claim.

### 2026-09-24 | M0 Workflow and scope re-plan
- **Milestone:** M0 (branch m0-project-setup)
- **Status:** Done
- **What changed:**
  - `docs/railway-job-portal-master-flow.md`: removed corrigendum (§3.4, data model row, diagram node); published jobs are final; added current-scope note (up to §4.9)
  - `workspace/MILESTONES.md`: rewritten as a claim board of phases M0–M6 with owners, branches, dependencies; §5/§6 moved to Deferred; M0 claimed by Ali
  - `workspace/TASKS.md`: tasks re-planned per phase, split into Backend / Frontend / Shared; corrigendum and screening tasks removed; M1–M6 renumbered
  - `workspace/WORKFLOW.md`: rewritten for milestone claiming, `develop` integration branch, squash into `develop`, merge-commit + tag into `main`, repo settings
  - `CLAUDE.md`: new mandatory steps, agent rules, scope, domain rule 9 (no corrigendum), Git branch rules; team table without branch prefixes
  - `docs/PROJECT_STRUCTURE.md`: dropped `corrigendum` from domain vocabulary
  - `workspace/logs/*.md`: template uses Milestone instead of Branch; fixed WORKFLOW anchor link
  - Removed edit/withdraw application: master flow §4.8, diagram node C23 and open question 4 removed; MILESTONES.md records question 4 as answered "No"; T-066 (edit/withdraw) dropped and M6 frontend tasks renumbered T-066–T-068; CLAUDE.md domain rule 3 now forbids edit/withdraw endpoints
- **Database:** none
- **Commits:**
  - `chore(milestones): re-plan phases and claim M0 [M0]` (on `develop`)
  - `docs(workflow): milestone-based workflow with develop branch [M0]`
- **How to test:** read WORKFLOW.md end to end; check MILESTONES.md dependencies match TASKS.md
- **Notes / follow-ups:** Repo admin must apply the GitHub settings in WORKFLOW.md (default branch `develop`, protection rules). Open question: how to handle a mistake in a published job now that there's no corrigendum.

### 2026-09-24 | T-001 Repo structure
- **Status:** Done (pending review)
- **Branch:** ali/T-001-repo-structure
- **What changed:**
  - `backend/app/{models,schemas,controllers,controllers/admin,services,scheduler,utils}/__init__.py`: MVC package skeleton; each docstring says what belongs in that layer
  - `backend/tests/{models,services,controllers}/`, `backend/scripts/`: empty folders (`.gitkeep`)
  - `frontend/public/`, `frontend/src/{api,pages/{public,candidate,admin},components/{common,forms,layout},hooks,context,routes,i18n,utils,styles,assets}/`: empty folders (`.gitkeep`)
  - `docs/PROJECT_STRUCTURE.md`: full layout, "where does it go?" table, layer import rules, naming, repo hygiene rules
  - `CLAUDE.md`: real repo layout; new §7 "Keeping the repo clean" for agents
  - `workspace/WORKFLOW.md`: structure/hygiene added to the work step, review step and checklist
  - `README.md`: project overview and links (setup steps come with T-002/T-003/T-004)
  - `.gitattributes`: LF line endings for everyone (fixes CRLF warnings on Windows)
  - `.editorconfig`: shared indentation/charset settings
  - `workspace/TASKS.md`: reformatted for readability: 4 aligned columns (ID, Task, Owner, Status), details moved to per-milestone notes; branch/dates now live in work logs. `WORKFLOW.md`, `CLAUDE.md`, `MILESTONES.md` updated to match
- **Database:** none
- **Commits:**
  - `chore(repo): add MVC folder structure and repo hygiene guide [T-001]`
- **How to test:** `git ls-files backend frontend` shows the skeleton; open `docs/PROJECT_STRUCTURE.md`
- **Notes / follow-ups:** No app code yet. Flask factory/config is T-002, docker-compose + migrations T-003, Vite scaffold T-004 (Vite will add `index.html`, `package.json`, `src/main.jsx`; delete `.gitkeep` files as folders get real files).

