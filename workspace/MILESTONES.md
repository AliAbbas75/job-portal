# Milestones

Each milestone groups tasks in [TASKS.md](TASKS.md). A milestone is **Done** only when all its tasks are `DONE` and its exit criteria are met.

Section numbers (§) refer to [docs/railway-job-portal-master-flow.md](../docs/railway-job-portal-master-flow.md).

| ID | Milestone | Tasks | Status | Target date | Lead |
|----|-----------|-------|--------|-------------|------|
| M0 | Project setup | T-001 – T-008 | Not started | TBD | |
| M1 | Data model | T-010 – T-017 | Not started | TBD | |
| M2 | Authentication | T-020 – T-025 | Not started | TBD | |
| M3 | Job creation, approval, publication | T-030 – T-035 | Not started | TBD | |
| M4 | Candidate portal: jobs and profile | T-040 – T-046 | Not started | TBD | |
| M5 | Application flow | T-050 – T-056 | Not started | TBD | |
| M6 | BPS-15+ resume tier | T-060 – T-064 | Not started | TBD | |
| M7 | Screening and selection | T-070 – T-076 | Not started | TBD | |
| M8 | Cross-cutting and release | T-080 – T-086 | Not started | TBD | |

Status values: `Not started`, `In progress`, `Done`.

---

## M0: Project setup
Repo structure, Flask and React skeletons, PostgreSQL, tooling, CI.

**Exit criteria**
- `flask run` serves `/api/health`; `npm run dev` shows the app shell calling it.
- A new team member can go from clone to running both apps using only the README.
- CI runs lint and tests on every pull request.
- Open questions below have an owner and a date.

## M1: Data model
All entities from §7 as SQLAlchemy models with migrations and seed data.

**Exit criteria**
- `flask db upgrade` builds the full schema on an empty database.
- Unique constraints exist for CNIC and (candidate, job) applications.
- Seed script loads departments, BPS scales, provinces/districts and qualification lists.

## M2: Authentication
Candidate signup/login with CNIC, mobile, CAPTCHA and OTP (§4.3); staff login with roles.

**Exit criteria**
- A candidate can sign up, receive an OTP (stubbed SMS in dev), log in, and a permanent profile exists.
- Duplicate CNIC is rejected. OTP requests are rate-limited.
- Staff roles (job creator, approver, screening staff, admin) gate the admin API.

## M3: Job creation, approval, publication
Admin flow (§3).

**Exit criteria**
- A job can be drafted with structured requirements, approved by the configured approvers, and appears on the public portal on its opening date.
- Approved jobs can't be edited; returned jobs go back to draft with comments.
- Every admin action has an audit record.

## M4: Candidate portal: jobs and profile
Job search, job details, permanent section-based profile, document vault (§4.1, 4.2, 4.4).

**Exit criteria**
- Candidates can search and filter jobs and view job details on a phone-width screen.
- Every profile section can be filled and edited; documents uploaded once can be reused.

## M5: Application flow
Application check, review, submit, snapshot, tracking (§4.6 – 4.9). This is the core of the portal.

**Exit criteria**
- For a given job, the application check lists only the missing items; filling them saves back to the profile.
- Submitting creates an application ID and a frozen snapshot; later profile edits don't change it.
- A second application to the same job is rejected.
- Candidates see their application status timeline.

## M6: BPS-15+ resume tier
Resume upload and parsing, builder, confirmation, higher-tier sections (§4.5).

**Exit criteria**
- An uploaded resume prefills the structured profile; the candidate confirms each section.
- The builder produces the same structured data and exports a PDF.
- Eligibility still uses only structured fields.

## M7: Screening and selection
Post-deadline pipeline (§5).

**Exit criteria**
- At the deadline, applications are auto-screened; flagged cases go to manual scrutiny.
- Shortlist, admit cards, merit list (quota-wise) and later stages can be driven end to end for a test job.

## M8: Cross-cutting and release
Notifications, Urdu/English, reports, audit viewer, security, deployment (§6).

**Exit criteria**
- Every status change sends SMS and email (real providers or configured stubs).
- The candidate portal is fully usable in Urdu and English.
- Security review items are closed; production deployment is documented and repeatable.

---

## Open questions (from §9)

These block some tasks. Record the decision here and as a note on the affected tasks in TASKS.md when it's made.

| # | Question | Blocks | Decision | Decided on |
|---|----------|--------|----------|------------|
| 1 | Is BPS-15 the right tier boundary, or BPS-16? | T-060 – T-064 (tier split config) | | |
| 2 | Who creates the job: the requesting department or a central recruitment cell? | T-023, T-030 (roles) | | |
| 3 | Is the written test in-house or by an external agency? | T-073, T-074 | | |
| 4 | Can a candidate edit or withdraw an application before the deadline? | T-056 | | |

## Milestone changelog

Add a line whenever a milestone changes status or target date.

| Date | Milestone | Change | By |
|------|-----------|--------|----|
| 2026-09-24 | All | Milestones created from master flow draft | Ali |
