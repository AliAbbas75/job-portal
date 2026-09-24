# Task Board

The checklist for each milestone. You claim a **milestone** in [MILESTONES.md](MILESTONES.md), not a task here. Full steps: [WORKFLOW.md](WORKFLOW.md).

**This file is only edited on milestone branches.** Changes reach `develop` with the milestone pull request. Never push it to `develop` or `main` directly.

| Status        | Meaning                            |
|---------------|------------------------------------|
| `TODO`        | Not started                        |
| `IN PROGRESS` | A milestone owner is working on it |
| `BLOCKED`     | Stuck; reason in the notes below   |
| `DONE`        | Finished on the milestone branch   |

- **Owner:** which milestone owner is doing the task (co-owners split tasks this way). `-` means unassigned.
- **[P]** means the feature is still *proposed* in the flow doc. Confirm scope before building it.
- **New task?** Add a row in the right milestone and area with the next free ID, plus a note if needed.
- Scope is the master flow up to §4.9. Deferred work is listed in MILESTONES.md.

---

## M0: Project setup

**Shared**

| ID    | Task                               | Owner | Status |
|-------|------------------------------------|-------|--------|
| T-001 | Repo structure, .gitignore, README | Ali   | DONE   |

**Notes**
- M0 is done. Its remaining setup tasks (T-002 to T-009) moved to M1.

---

## M1: App setup and data model (§7)

**Backend**

| ID    | Task                                                       | Owner | Status |
|-------|------------------------------------------------------------|-------|--------|
| T-002 | Flask app factory, config, extensions, /api/health         | Ali   | DONE   |
| T-003 | PostgreSQL (docker-compose), .env.example, first migration | Ali   | DONE   |
| T-006 | pytest setup with a test database                          | Ali   | DONE   |
| T-010 | CandidateAccount + CandidateProfile (unique CNIC)          | Ali   | DONE   |
| T-011 | Profile section models                                     | Ali   | DONE   |
| T-012 | BPS-15+ section models                                     | Ali   | DONE   |
| T-013 | Document model + file storage service                      | Ali   | DONE   |
| T-014 | Job + JobRequirement models                                | Ali   | DONE   |
| T-015 | ApprovalRecord model                                       | Ali   | DONE   |
| T-016 | Application, ApplicationSnapshot, StatusEvent              | Ali   | DONE   |
| T-017 | AuditLog model + helper                                    | Ali   | DONE   |
| T-018 | Seed data (departments, BPS, districts, qualifications)    | Ali   | DONE   |

**Frontend**

| ID    | Task                                              | Owner | Status |
|-------|---------------------------------------------------|-------|--------|
| T-004 | React (Vite) scaffold: router, API client, layout | Ali   | DONE   |
| T-009 | Vitest + React Testing Library setup              | Ali   | DONE   |

**Shared**

| ID    | Task                                                   | Owner | Status |
|-------|--------------------------------------------------------|-------|--------|
| T-005 | Lint/format: Ruff, Black, ESLint, Prettier, pre-commit | Ali   | DONE   |
| T-007 | CI on pull requests (GitHub Actions)                   | Ali   | DONE   |

**Notes**
- Do T-002 to T-004 first; everything else builds on them. They also fill in the README setup steps.
- T-007: run on pull requests into `develop` and `main`.
- T-011: personal, contact/address, domicile, education, experience, skills, additional eligibility.
- T-012: professional registration, publications, references, statement of purpose.
- T-013: enforce file size and format limits.
- T-014: include quotas, fee, opening/closing dates, status, advertisement number.
- T-016: unique (candidate, job); status list covers all expanded §4.9 statuses.
- T-015: also added a `StaffUser` model (approvers and audit entries need it); login and roles stay in T-023.
- Former T-008 (open questions) moved out of M1: tracked in the Open questions table in MILESTONES.md.

---

## M2: Authentication (§4.3)

**Backend**

| ID    | Task                                         | Owner | Status |
|-------|----------------------------------------------|-------|--------|
| T-020 | Candidate signup API (CNIC, mobile, CAPTCHA) | -     | TODO   |
| T-021 | OTP service (expiry, rate limit, SMS stub)   | -     | TODO   |
| T-022 | Candidate OTP login, JWT, account recovery   | -     | TODO   |
| T-023 | Staff login + roles                          | -     | TODO   |
| T-024 | [P] NADRA CNIC verification interface        | -     | TODO   |

**Frontend**

| ID    | Task                            | Owner | Status |
|-------|---------------------------------|-------|--------|
| T-025 | Signup / OTP / login pages      | Ali   | DONE   |
| T-026 | Staff login page + route guards | -     | TODO   |

**Notes**
- T-020: CNIC format + duplicate check; signup creates the permanent profile.
- T-023: roles are job creator, approver, admin. Do this first; M3 depends on it. Depends on open question 2.
- T-024: stub until NADRA integration is available.
- T-025: built on the mock API (`src/api/mocks/authMock.js`). T-020 to T-022 must match its request/response shapes.

---

## M3: Job creation, approval, publishing (§3.1–3.3)

**Backend**

| ID    | Task                                             | Owner | Status |
|-------|--------------------------------------------------|-------|--------|
| T-030 | Job draft API (requirements, quotas, fee, dates) | -     | TODO   |
| T-031 | Approval workflow API (N-of-M, audit)            | -     | TODO   |
| T-032 | Publish: lock, ad number, schedule, auto-close   | -     | TODO   |

**Frontend**

| ID    | Task                                       | Owner | Status |
|-------|--------------------------------------------|-------|--------|
| T-033 | Admin: create / edit job form              | -     | TODO   |
| T-034 | Admin: approval inbox + review             | -     | TODO   |
| T-035 | Admin: job list with status + publish view | -     | TODO   |

**Notes**
- T-031: approve / return with comments / reject.
- T-032: attach newspaper advertisement. Published jobs are final (no corrigendum).

---

## M4: Candidate portal: jobs and profile (§4.1, 4.2, 4.4)

**Backend**

| ID    | Task                                     | Owner | Status |
|-------|------------------------------------------|-------|--------|
| T-040 | Job search API with filters + pagination | -     | TODO   |
| T-041 | Job details API                          | -     | TODO   |
| T-042 | Profile section APIs + edit history      | -     | TODO   |
| T-043 | Document vault API (upload once, reuse)  | -     | TODO   |
| T-044 | Age calculation utility + tests          | -     | TODO   |

**Frontend**

| ID    | Task                                 | Owner | Status |
|-------|--------------------------------------|-------|--------|
| T-045 | Landing page, latest jobs, search UI | Ali   | DONE   |
| T-046 | Job details page                     | Ali   | DONE   |
| T-047 | Profile section forms (mobile-first) | Ali   | DONE   |
| T-048 | Document vault UI                    | Ali   | DONE   |

**Notes**
- T-040: filters are BPS, department, location, education, employment type, deadline.
- T-044: age from DOB as of closing date or advertisement cutoff date.
- T-048: client-side compression before upload.
- T-045 to T-048: UI built early on mock data. T-040 to T-043 must match the shapes in `src/api/mocks/`.

---

## M5: BPS-15+ resume tier (§4.5)

**Backend**

| ID    | Task                                     | Owner | Status |
|-------|------------------------------------------|-------|--------|
| T-050 | Resume upload + parser, prefill profile  | -     | TODO   |
| T-051 | Resume builder API (same profile schema) | -     | TODO   |
| T-052 | Resume PDF export                        | -     | TODO   |
| T-053 | BPS-15+ section APIs                     | -     | TODO   |

**Frontend**

| ID    | Task                                    | Owner | Status |
|-------|-----------------------------------------|-------|--------|
| T-054 | Resume upload + confirm parsed sections | -     | TODO   |
| T-055 | Resume builder UI                       | -     | TODO   |
| T-056 | BPS-15+ section forms                   | -     | TODO   |

**Notes**
- T-050: store a confidence score per parsed field.
- T-054: highlight low-confidence fields; fall back to the builder if parsing fails.
- Tier boundary depends on open question 1.

---

## M6: Application flow and tracking (§4.6–4.9)

**Backend**

| ID    | Task                                            | Owner | Status |
|-------|-------------------------------------------------|-------|--------|
| T-060 | Eligibility engine service                      | -     | TODO   |
| T-061 | Application check API (missing items only)      | -     | TODO   |
| T-062 | Submit API: snapshot, application ID            | -     | TODO   |
| T-063 | [P] Fee payment (online / challan)              | -     | TODO   |
| T-064 | Application tracking API (status timeline)      | -     | TODO   |
| T-065 | Admin: applications per job + status update API | -     | TODO   |

**Frontend**

| ID    | Task                                    | Owner | Status      |
|-------|-----------------------------------------|-------|-------------|
| T-066 | Application check UI                    | Ali   | DONE        |
| T-067 | Review and submit UI (declaration, fee) | Ali   | DONE        |
| T-068 | Tracking UI + admin status update UI    | Ali   | IN PROGRESS |

**Notes**
- T-060: core logic; compares JobRequirement to profile, needs thorough tests.
- T-061: items filled here are saved back to the profile.
- T-062: one application per CNIC per job; profile data frozen into the snapshot; no edit or withdraw after submit.
- T-065: manual status changes until automated screening (deferred); every change writes a StatusEvent.
- T-066, T-067: UI built early on mock data; the mock eligibility check (`eligibilityMock.js`) shows T-060 the expected output.
- T-068: candidate tracking UI done; admin status update UI still to do (needs the admin area).
- T-066 to T-068: submitted applications are final; no edit or withdraw UI.
