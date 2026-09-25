# M3: Job creation, approval, publishing

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** Ali
- **Status:** Done
- **Depends on:** M1, and T-023 from M2

## Scope

Master flow §3.1–3.3. Job drafting, approval and publishing.

## Done when

- A job can be drafted with structured requirements, approved by the configured approvers, and appears on the public portal on its opening date.
- Returned jobs go back to draft with comments. Rejected jobs are closed.
- **Published jobs can't be edited** (no corrigendum).
- Every admin action has an audit record.

## Tasks

**Backend**

| ID    | Task                                             | Owner | Status |
|-------|--------------------------------------------------|-------|--------|
| T-030 | Job draft API (requirements, quotas, fee, dates) | Ali   | DONE   |
| T-031 | Approval workflow API (N-of-M, audit)            | Ali   | DONE   |
| T-032 | Publish: lock, ad number, schedule, auto-close   | Ali   | DONE   |

**Frontend**

| ID    | Task                                       | Owner | Status |
|-------|--------------------------------------------|-------|--------|
| T-033 | Admin: create / edit job form              | Ali   | DONE   |
| T-034 | Admin: approval inbox + review             | Ali   | DONE   |
| T-035 | Admin: job list with status + publish view | Ali   | DONE   |

## Notes

- Staff login and roles are ready (M2 T-023, T-026): protect endpoints with `@staff_required(...)` and pages with `<RequireStaff roles={[...]}>` (see CLAUDE.md). Add admin pages under the `/admin` routes next to `AdminHomePage`.
- T-031: approve / return with comments / reject.
- T-032: attach newspaper advertisement. Published jobs are final (no corrigendum).
- T-030, T-033: the Figma candidate journey ([docs/pakrail-candidate-journey.html](../../docs/pakrail-candidate-journey.html)) shows extra job fields that the job form must capture: post category/trade (e.g. Carpenter, Gateman), gender, eligibility criteria bullets, quota percentages per category, and the advertisement file. The data model for them is M4 T-147/T-148.
- Done (T-030 to T-035):
  - API under `/api/admin/jobs`: list (`?status=`), create, get, update (draft/returned only), `/submit`, `/decision` (`approved` / `returned` / `rejected`, comments required to return or reject), `/publish` (optional advertisement number, else `PR/REC/<year>/<id>`).
  - Roles: job creators and admins draft and submit; approvers and admins decide; only admins publish. Nobody can approve a job they created.
  - N-of-M approval: `JOB_APPROVALS_REQUIRED` (default 1) different approvers. A return starts a fresh round.
  - Approved and published jobs can't be edited (`job_locked`). A published job shows on the portal from its opening date; `flask close-jobs` (run from cron every few minutes) sets past-deadline jobs to `closed`. The public search already hides them the moment the deadline passes.
  - Every step writes an audit entry (`job.created`, `job.updated`, `job.submitted`, `job.approved` / `job.returned` / `job.rejected`, `job.published`, `job.closed`).
  - Frontend: `/admin` (all jobs, status filter), `/admin/approvals` (inbox), `/admin/jobs/new` and `/admin/jobs/:id/edit` (form), `/admin/jobs/:id` (review, history, actions). Works in mock mode with the demo staff logins.
  - Open question 2 is still open: staff have an optional department, but jobs aren't limited to it yet. The advertisement file upload waits for M4 T-148.
