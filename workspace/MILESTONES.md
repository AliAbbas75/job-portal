# Milestones

Development is split into **phases (milestones)**. You claim a **milestone**, not a single task. Its tasks in [TASKS.md](TASKS.md) are the checklist for "done". How to claim and release: [WORKFLOW.md](WORKFLOW.md).

**Current scope:** the master flow up to **§4.9 Application Tracking** ([docs/railway-job-portal-master-flow.md](../docs/railway-job-portal-master-flow.md)). Screening (§5) and cross-cutting work (§6) are listed under [Deferred](#deferred-out-of-current-scope).

## Claim board

This table is the only thing pushed directly to `develop`. Everything else goes through a milestone pull request.

| ID | Milestone                           | Owners | Branch                | Status      | Depends on |
|----|-------------------------------------|--------|-----------------------|-------------|------------|
| M0 | Project setup                       | Ali    | `m0-project-setup`    | Done        | -          |
| M1 | App setup and data model            | Ali    | `m1-foundation`       | Done        | M0         |
| M2 | Authentication                      | -      | `m2-authentication`   | Not started | M1         |
| M3 | Job creation, approval, publishing  | -      | `m3-job-admin`        | Not started | M1, T-023  |
| M4 | Candidate portal: jobs and profile  | Ali    | `m4-candidate-portal` | In progress | M1         |
| M5 | BPS-15+ resume tier                 | -      | `m5-resume-tier`      | Not started | M4         |
| M6 | Application flow and tracking       | -      | `m6-applications`     | Not started | M3, M4     |

- **Owners:** one or more of Ali, Anum, Hadi, Malaika, Umaima, comma-separated. The first name is the lead, who opens the pull requests.
- **Status:** `Not started` → `In progress` → `In review` (PR into `develop` open) → `Done` (merged into `develop` and released to `main`)
- **Depends on:** don't claim a milestone until these are `Done`. M3 only needs staff roles (T-023) from M2, so it can run alongside M2.

```
M0 → M1 ─┬→ M2 ──(T-023)──┐
         ├→ M3 ←──────────┘ ─┐
         └→ M4 ─┬────────────┴→ M6
                └→ M5
```

Up to three milestones can run at once (M2, M3, M4, then M5 and M6). With five people, share milestones as co-owners rather than waiting.

---

## Milestone details

Section numbers (§) refer to the master flow.

### M0: Project setup ✅
Repo structure, team workflow, task board, structure guide, and product flow updates.

### M1: App setup and data model
Flask and React skeletons, PostgreSQL, tooling and CI, then all in-scope entities from §7 as SQLAlchemy models with migrations and seed data.

**Done when**
- `flask run` serves `/api/health`; `npm run dev` shows the app shell calling it.
- A new team member can go from clone to running both apps using only the README.
- CI runs lint and tests on pull requests into `develop` and `main`.
- `flask db upgrade` builds the full schema on an empty database.
- Unique constraints exist for CNIC and for (candidate, job) applications.
- The application status list includes the expanded §4.9 statuses, so later phases need no schema change.
- The seed script loads departments, BPS scales, provinces/districts and qualification lists.

### M2: Authentication (§4.3)
Candidate signup and OTP login; staff login with roles.

**Done when**
- A candidate can sign up, receive an OTP (stubbed SMS in dev) and log in, and a permanent profile exists.
- Duplicate CNIC is rejected. OTP requests are rate-limited.
- Staff roles (job creator, approver, admin) gate the admin API and admin pages.

### M3: Job creation, approval, publishing (§3.1–3.3)
**Done when**
- A job can be drafted with structured requirements, approved by the configured approvers, and appears on the public portal on its opening date.
- Returned jobs go back to draft with comments. Rejected jobs are closed.
- **Published jobs can't be edited** (no corrigendum).
- Every admin action has an audit record.

### M4: Candidate portal: jobs and profile (§4.1, 4.2, 4.4)
**Done when**
- Candidates can search and filter jobs and view job details on a phone-width screen.
- Every profile section can be filled and edited; documents uploaded once can be reused.
- Age is calculated from DOB, never entered.

### M5: BPS-15+ resume tier (§4.5)
**Done when**
- An uploaded resume prefills the structured profile; the candidate confirms each section.
- Parse failures land in the builder with whatever was extracted.
- The builder writes the same structured data and exports a PDF.
- Eligibility still uses only structured fields.

### M6: Application flow and tracking (§4.6–4.9)
The core of the portal.

**Done when**
- For a given job, the application check lists only the missing items; filling them saves back to the profile.
- Submitting creates an application ID and a frozen snapshot; later profile edits don't change it.
- A second application to the same job is rejected. Submitted applications can't be edited or withdrawn.
- Candidates see their status timeline. Staff can move an application through the §4.9 statuses by hand (automated screening comes later).

---

## Deferred (out of current scope)

These wait until M6 is done. They'll be broken into tasks when a new milestone is planned for them.

- **Screening and selection (§5):** auto-screening at deadline, manual scrutiny, shortlist, objection windows, admit cards, test/interview results, quota-wise merit list, document verification, medical, offer letter
- **Notifications (§6):** SMS + email on every status change (OTP SMS is in scope, in M2)
- **Urdu / English** support with RTL layout
- **Reports** per job, and an admin audit-trail viewer
- **Security review, low-bandwidth performance, production deployment**

## Open questions (from §9)

These are decisions for stakeholders, not a milestone task (formerly T-008). Record each decision here, and as a note on the affected tasks in TASKS.md.

| # | Question | Blocks | Decision | Decided on |
|---|----------|--------|----------|------------|
| 1 | Is BPS-15 the right tier boundary, or BPS-16? | M5 (tier split) | | |
| 2 | Who creates the job: the requesting department or a central recruitment cell? | T-023, T-030 (roles) | | |
| 3 | Is the written test in-house or by an external agency? | Deferred (§5) | | |
| 4 | Can a candidate edit or withdraw an application before the deadline? | - | **No.** Submitted applications are final. | 2026-09-24 |

## Milestone changelog

Add a line whenever a milestone changes status, owners or scope.

| Date       | Milestone | Change | By |
|------------|-----------|--------|----|
| 2026-09-24 | All       | Milestones created from master flow draft | Ali |
| 2026-09-24 | All       | Re-planned as phases up to §4.9; corrigendum removed; §5 and §6 deferred; milestone-based claiming | Ali |
| 2026-09-24 | M0        | Claimed by Ali | Ali |
| 2026-09-24 | M6        | Edit/withdraw application removed (open question 4 answered: no) | Ali |
| 2026-09-24 | M0        | Done (repo structure + workflow). Setup tasks T-002 to T-009 moved to M1 | Ali |
| 2026-09-24 | M1        | Renamed "App setup and data model", branch `m1-foundation` | Ali |
| 2026-09-24 | M1, M4    | Claimed by Ali for frontend work; backend tasks open for co-owners. M4 UI starts early on mock API data | Ali |
| 2026-09-24 | M1        | All tasks done by Ali (frontend + backend); T-008 moved out of M1 to the Open questions table | Ali |
| 2026-09-24 | M1        | Done; PR into `develop` for review by Malaika | Ali |
