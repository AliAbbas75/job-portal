# M1: App setup and data model

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** Ali
- **Status:** Done
- **Branch:** `m1-foundation`
- **Depends on:** M0

## Scope

Flask and React skeletons, PostgreSQL, tooling, then all in-scope entities from §7 as SQLAlchemy models with migrations and seed data.

## Done when

- `flask run` serves `/api/health`; `npm run dev` shows the app shell calling it.
- A new team member can go from clone to running both apps using only the README.
- Pre-commit hooks and the local pre-PR checks (WORKFLOW.md) pass.
- `flask db upgrade` builds the full schema on an empty database.
- Unique constraints exist for CNIC and for (candidate, job) applications.
- The application status list includes the expanded §4.9 statuses, so later phases need no schema change.
- The seed script loads departments, BPS scales, provinces/districts and qualification lists.

## Tasks

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

## Notes

- Do T-002 to T-004 first; everything else builds on them. They also fill in the README setup steps.
- T-007 (CI) dropped: the project doesn't use GitHub Actions. Checks run locally (see WORKFLOW.md).
- T-011: personal, contact/address, domicile, education, experience, skills, additional eligibility.
- T-012: professional registration, publications, references, statement of purpose.
- T-013: enforce file size and format limits.
- T-014: include quotas, fee, opening/closing dates, status, advertisement number.
- T-016: unique (candidate, job); status list covers all expanded §4.9 statuses.
- T-015: also added a `StaffUser` model (approvers and audit entries need it); login and roles stay in T-023.
- Former T-008 (open questions) moved out of M1: tracked in the Open questions table in MILESTONES.md.
