# Task Board

**Claim before you code.** Read [WORKFLOW.md](WORKFLOW.md) first. To claim a task: pull `main`, fill Owner / Status / Branch / Started, then commit and push to `main` before starting.

- **Owner:** Ali, Anum, Hadi, Malaika or Umaima
- **Status:** `TODO` · `IN PROGRESS` · `BLOCKED` · `IN REVIEW` · `DONE`
- **Dates:** `YYYY-MM-DD`
- New tasks: add a row to the right milestone using the next free ID in that milestone's range. If the range is full, use T-1xx.
- Tasks marked **[P]** come from **[Proposed]** items in the flow doc. Confirm scope before building them as final.

To see who's working on what: search this file for `IN PROGRESS`.

---

## M0: Project setup

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-001 | Repo structure (`backend/`, `frontend/`, `docs/`), `.gitignore`, README with setup steps | | TODO | | | | |
| T-002 | Flask app factory, config (dev/test/prod), extensions (SQLAlchemy, Migrate, Marshmallow, JWT), `/api/health` | | TODO | | | | |
| T-003 | PostgreSQL via docker-compose, `.env.example`, initial Alembic migration | | TODO | | | | |
| T-004 | React (Vite) scaffold: router, Axios API client, layout shell | | TODO | | | | |
| T-005 | Lint/format: Ruff + Black, ESLint + Prettier, pre-commit hooks | | TODO | | | | |
| T-006 | Test setup: pytest with test DB fixtures, Vitest + React Testing Library | | TODO | | | | |
| T-007 | GitHub Actions CI: lint + tests on pull requests | | TODO | | | | |
| T-008 | Get answers to open questions 1–4, record in MILESTONES.md | | TODO | | | | |

## M1: Data model

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-010 | Models: `CandidateAccount`, `CandidateProfile` (CNIC unique) | | TODO | | | | |
| T-011 | Profile section models: personal, contact/address, domicile, education, experience, skills, additional eligibility | | TODO | | | | |
| T-012 | `Document` model + file storage service (size/format limits) | | TODO | | | | |
| T-013 | `Job` + `JobRequirement` (structured eligibility rules) models | | TODO | | | | |
| T-014 | `ApprovalRecord`, `Corrigendum` models | | TODO | | | | |
| T-015 | `Application` (unique candidate+job), `ApplicationSnapshot`, `StatusEvent` models | | TODO | | | | |
| T-016 | `AuditLog` model + helper to record admin actions | | TODO | | | | |
| T-017 | Seed data: departments, BPS scales, provinces/districts → quota zones, qualification levels/disciplines | | TODO | | | | |

## M2: Authentication

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-020 | Candidate signup API: CNIC format + duplicate check, mobile, CAPTCHA; creates permanent profile | | TODO | | | | |
| T-021 | OTP service: generate/verify, expiry, rate limiting, SMS provider interface (dev stub) | | TODO | | | | |
| T-022 | Candidate OTP login, JWT sessions, OTP-based account recovery | | TODO | | | | |
| T-023 | Staff auth + roles (job creator, approver, screening staff, admin) | | TODO | | | | Depends on open question 2 |
| T-024 | Frontend: signup, OTP, login pages | | TODO | | | | |
| T-025 | [P] NADRA CNIC verification interface (stub until integration is available) | | TODO | | | | |

## M3: Job creation, approval, publication

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-030 | Job draft CRUD API: details, structured requirements, documents, quotas, fee, dates | | TODO | | | | |
| T-031 | Admin UI: create/edit job form | | TODO | | | | |
| T-032 | Approval workflow API: configurable N-of-M, approve/return/reject with comments, audit | | TODO | | | | |
| T-033 | Admin UI: approval inbox and job review screen | | TODO | | | | |
| T-034 | Publish: lock job, advertisement number, attach newspaper ad, scheduled publish and auto-close | | TODO | | | | |
| T-035 | [P] Corrigendum: API + UI + approval + applicant notification | | TODO | | | | |

## M4: Candidate portal: jobs and profile

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-040 | Public job search API: filters (BPS, department, location, education, type, deadline), pagination | | TODO | | | | |
| T-041 | Landing page, latest jobs, search + filters UI | | TODO | | | | |
| T-042 | Job details page with Apply | | TODO | | | | |
| T-043 | Profile section APIs (CRUD per section) + edit history | | TODO | | | | |
| T-044 | Profile UI: section-based forms, mobile-first | | TODO | | | | |
| T-045 | Document vault UI: upload once, reuse, client-side compression | | TODO | | | | |
| T-046 | Age calculation utility (DOB vs closing/cutoff date) + tests | | TODO | | | | |

## M5: Application flow

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-050 | Eligibility engine service: `JobRequirement` vs profile, per-rule pass/fail/missing | | TODO | | | | Core logic, needs thorough tests |
| T-051 | Application check API + UI: show only missing items, save back to profile | | TODO | | | | |
| T-052 | Review and submit UI: section-wise edit, documents, eligibility confirmation, declaration | | TODO | | | | |
| T-053 | Submit API: snapshot creation, application ID, one application per CNIC per job | | TODO | | | | |
| T-054 | [P] Fee payment: online or challan upload | | TODO | | | | |
| T-055 | Application tracking API + UI (status timeline from `StatusEvent`) | | TODO | | | | |
| T-056 | Edit/withdraw application before deadline | | BLOCKED | | | | Waiting on open question 4 |

## M6: BPS-15+ resume tier

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-060 | Resume upload + parser service → prefill profile with confidence scores | | TODO | | | | |
| T-061 | Parsed-section confirmation UI, low-confidence fields highlighted, fallback to builder | | TODO | | | | |
| T-062 | Resume builder UI writing to the same profile schema | | TODO | | | | |
| T-063 | Resume PDF export | | TODO | | | | |
| T-064 | Higher-tier sections: professional registration, publications, references, statement of purpose | | TODO | | | | |

## M7: Screening and selection

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-070 | Auto-screening job at deadline (reuses eligibility engine) | | TODO | | | | |
| T-071 | Manual scrutiny UI for flagged applications | | TODO | | | | |
| T-072 | Shortlist publication + objection window | | TODO | | | | |
| T-073 | Admit card / roll number slip PDF, test center selection | | TODO | | | | Depends on open question 3 |
| T-074 | Test/interview result entry | | TODO | | | | Depends on open question 3 |
| T-075 | Quota-wise merit list generation, publication, objection window | | TODO | | | | |
| T-076 | Document verification, medical, offer letter stages | | TODO | | | | |

## M8: Cross-cutting and release

| ID | Task | Owner | Status | Branch | Started | Done | Notes |
|----|------|-------|--------|--------|---------|------|-------|
| T-080 | Notification service: SMS + email on every `StatusEvent` | | TODO | | | | |
| T-081 | Urdu/English i18n, RTL layout for Urdu | | TODO | | | | |
| T-082 | Per-job reports: received, eligible, shortlisted, quota-wise | | TODO | | | | |
| T-083 | Admin audit trail viewer | | TODO | | | | |
| T-084 | Security review: uploads, rate limits, authorization, PII handling | | TODO | | | | |
| T-085 | Performance and low-bandwidth optimization | | TODO | | | | |
| T-086 | Deployment: Docker images, environment config, DB backups | | TODO | | | | |
