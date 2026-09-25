# M3: Job creation, approval, publishing

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** -
- **Status:** Not started
- **Branch:** `m3-job-admin`
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
| T-030 | Job draft API (requirements, quotas, fee, dates) | -     | TODO   |
| T-031 | Approval workflow API (N-of-M, audit)            | -     | TODO   |
| T-032 | Publish: lock, ad number, schedule, auto-close   | -     | TODO   |

**Frontend**

| ID    | Task                                       | Owner | Status |
|-------|--------------------------------------------|-------|--------|
| T-033 | Admin: create / edit job form              | -     | TODO   |
| T-034 | Admin: approval inbox + review             | -     | TODO   |
| T-035 | Admin: job list with status + publish view | -     | TODO   |

## Notes

- Staff login and roles are ready (M2 T-023, T-026): protect endpoints with `@staff_required(...)` and pages with `<RequireStaff roles={[...]}>` (see CLAUDE.md). Add admin pages under the `/admin` routes next to `AdminHomePage`.
- T-031: approve / return with comments / reject.
- T-032: attach newspaper advertisement. Published jobs are final (no corrigendum).
- T-030, T-033: the Figma candidate journey ([docs/pakrail-candidate-journey.html](../../docs/pakrail-candidate-journey.html)) shows extra job fields that the job form must capture: post category/trade (e.g. Carpenter, Gateman), gender, eligibility criteria bullets, quota percentages per category, and the advertisement file. The data model for them is M4 T-147/T-148.
