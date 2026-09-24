# Task Board

Claim a task before you write any code. Full steps are in [WORKFLOW.md](WORKFLOW.md).

**To claim:** pull `main` → put your name in **Owner** and set **Status** to `IN PROGRESS` → commit and push to `main`.

| Status        | Meaning                           |
|---------------|-----------------------------------|
| `TODO`        | Free to pick up                   |
| `IN PROGRESS` | Someone is working on it          |
| `BLOCKED`     | Stuck; reason in the notes below  |
| `IN REVIEW`   | Pull request is open              |
| `DONE`        | Merged into `main`                |

- **Owner** is one of: Ali, Anum, Hadi, Malaika, Umaima. `-` means unassigned.
- **[P]** means the feature is still *proposed* in the flow doc. Confirm scope before building it.
- **New task?** Add a row in the right milestone with the next free ID, and a note if it needs one.
- Branch names and dates go in your work log (`workspace/logs/<name>.md`), not here.

---

## M0: Project setup

| ID    | Task                                                       | Owner | Status      |
|-------|------------------------------------------------------------|-------|-------------|
| T-001 | Repo structure, .gitignore, README                         | Ali   | IN PROGRESS |
| T-002 | Flask app factory, config, extensions, /api/health         | -     | TODO        |
| T-003 | PostgreSQL (docker-compose), .env.example, first migration | -     | TODO        |
| T-004 | React (Vite) scaffold: router, API client, layout          | -     | TODO        |
| T-005 | Lint/format: Ruff, Black, ESLint, Prettier, pre-commit     | -     | TODO        |
| T-006 | Test setup: pytest + test DB, Vitest + RTL                 | -     | TODO        |
| T-007 | CI on pull requests (GitHub Actions)                       | -     | TODO        |
| T-008 | Get answers to open questions 1-4                          | -     | TODO        |

**Notes**
- T-001: README setup steps get filled in by T-002, T-003, T-004.
- T-008: record decisions in MILESTONES.md.

---

## M1: Data model

| ID    | Task                                                    | Owner | Status |
|-------|---------------------------------------------------------|-------|--------|
| T-010 | CandidateAccount + CandidateProfile (unique CNIC)       | -     | TODO   |
| T-011 | Profile section models                                  | -     | TODO   |
| T-012 | Document model + file storage                           | -     | TODO   |
| T-013 | Job + JobRequirement models                             | -     | TODO   |
| T-014 | ApprovalRecord + Corrigendum models                     | -     | TODO   |
| T-015 | Application, ApplicationSnapshot, StatusEvent models    | -     | TODO   |
| T-016 | AuditLog model + helper                                 | -     | TODO   |
| T-017 | Seed data (departments, BPS, districts, qualifications) | -     | TODO   |

**Notes**
- T-011: personal, contact/address, domicile, education, experience, skills, additional eligibility.
- T-012: enforce file size and format limits.
- T-015: unique constraint on (candidate, job).

---

## M2: Authentication

| ID    | Task                                         | Owner | Status |
|-------|----------------------------------------------|-------|--------|
| T-020 | Candidate signup API (CNIC, mobile, CAPTCHA) | -     | TODO   |
| T-021 | OTP service (expiry, rate limit, SMS stub)   | -     | TODO   |
| T-022 | Candidate OTP login, JWT, account recovery   | -     | TODO   |
| T-023 | Staff login + roles                          | -     | TODO   |
| T-024 | Signup / OTP / login pages                   | -     | TODO   |
| T-025 | [P] NADRA CNIC verification interface        | -     | TODO   |

**Notes**
- T-020: CNIC format + duplicate check; signup creates the permanent profile.
- T-023: roles are job creator, approver, screening staff, admin. Depends on open question 2.
- T-025: stub until NADRA integration is available.

---

## M3: Job creation, approval, publication

| ID    | Task                                             | Owner | Status |
|-------|--------------------------------------------------|-------|--------|
| T-030 | Job draft API (requirements, quotas, fee, dates) | -     | TODO   |
| T-031 | Admin UI: create / edit job                      | -     | TODO   |
| T-032 | Approval workflow API (N-of-M, audit)            | -     | TODO   |
| T-033 | Admin UI: approval inbox + review                | -     | TODO   |
| T-034 | Publish: lock, ad number, schedule, auto-close   | -     | TODO   |
| T-035 | [P] Corrigendum flow + applicant notification    | -     | TODO   |

**Notes**
- T-032: approve / return with comments / reject.
- T-034: attach newspaper advertisement.

---

## M4: Candidate portal: jobs and profile

| ID    | Task                                     | Owner | Status |
|-------|------------------------------------------|-------|--------|
| T-040 | Job search API with filters + pagination | -     | TODO   |
| T-041 | Landing page, latest jobs, search UI     | -     | TODO   |
| T-042 | Job details page                         | -     | TODO   |
| T-043 | Profile section APIs + edit history      | -     | TODO   |
| T-044 | Profile UI (section forms, mobile-first) | -     | TODO   |
| T-045 | Document vault UI (upload once, reuse)   | -     | TODO   |
| T-046 | Age calculation utility + tests          | -     | TODO   |

**Notes**
- T-040: filters are BPS, department, location, education, employment type, deadline.
- T-045: client-side compression before upload.
- T-046: age from DOB as of closing date or advertisement cutoff date.

---

## M5: Application flow

| ID    | Task                                            | Owner | Status  |
|-------|-------------------------------------------------|-------|---------|
| T-050 | Eligibility engine service                      | -     | TODO    |
| T-051 | Application check API + UI (missing items only) | -     | TODO    |
| T-052 | Review and submit UI                            | -     | TODO    |
| T-053 | Submit API: snapshot, application ID            | -     | TODO    |
| T-054 | [P] Fee payment (online / challan)              | -     | TODO    |
| T-055 | Application tracking API + UI                   | -     | TODO    |
| T-056 | Edit / withdraw before deadline                 | -     | BLOCKED |

**Notes**
- T-050: core logic; compares JobRequirement to profile, needs thorough tests.
- T-051: items filled here are saved back to the profile.
- T-053: one application per CNIC per job.
- T-056: waiting on open question 4.

---

## M6: BPS-15+ resume tier

| ID    | Task                                    | Owner | Status |
|-------|-----------------------------------------|-------|--------|
| T-060 | Resume upload + parser, prefill profile | -     | TODO   |
| T-061 | Confirm parsed sections UI              | -     | TODO   |
| T-062 | Resume builder UI                       | -     | TODO   |
| T-063 | Resume PDF export                       | -     | TODO   |
| T-064 | Higher-tier profile sections            | -     | TODO   |

**Notes**
- T-061: highlight low-confidence fields; fall back to builder if parsing fails.
- T-064: professional registration, publications, references, statement of purpose.

---

## M7: Screening and selection

| ID    | Task                                         | Owner | Status |
|-------|----------------------------------------------|-------|--------|
| T-070 | Auto-screening at deadline                   | -     | TODO   |
| T-071 | Manual scrutiny UI                           | -     | TODO   |
| T-072 | Shortlist + objection window                 | -     | TODO   |
| T-073 | Admit card PDF + test centre                 | -     | TODO   |
| T-074 | Test / interview result entry                | -     | TODO   |
| T-075 | Quota-wise merit list + objection window     | -     | TODO   |
| T-076 | Document verification, medical, offer letter | -     | TODO   |

**Notes**
- T-070: reuses the eligibility engine (T-050).
- T-073, T-074: depend on open question 3.

---

## M8: Cross-cutting and release

| ID    | Task                                 | Owner | Status |
|-------|--------------------------------------|-------|--------|
| T-080 | SMS + email on every status change   | -     | TODO   |
| T-081 | Urdu / English (RTL for Urdu)        | -     | TODO   |
| T-082 | Per-job reports                      | -     | TODO   |
| T-083 | Admin audit trail viewer             | -     | TODO   |
| T-084 | Security review                      | -     | TODO   |
| T-085 | Low-bandwidth performance            | -     | TODO   |
| T-086 | Deployment (Docker, config, backups) | -     | TODO   |

**Notes**
- T-082: received, eligible, shortlisted, quota-wise breakdown.
- T-084: uploads, rate limits, authorization, personal data.
