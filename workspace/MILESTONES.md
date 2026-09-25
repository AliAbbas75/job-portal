# Milestones

Development is split into **milestones** (phases). Each milestone has its own file in [milestones/](milestones/) holding its claim (owners, status), scope, "done when" criteria and task list. How to claim, work and finish: [WORKFLOW.md](WORKFLOW.md).

**Current scope:** the master flow up to **§4.9 Application Tracking** ([docs/railway-job-portal-master-flow.md](../docs/railway-job-portal-master-flow.md)). Screening (§5) and cross-cutting work (§6) are listed under [Deferred](#deferred-out-of-current-scope).

This page rarely changes. Owners and status live in each milestone file, so claims never collide.

## All milestones

| ID | Milestone | Depends on |
|----|-----------|------------|
| M0 | [Project setup](milestones/M0-project-setup.md) | - |
| M1 | [App setup and data model](milestones/M1-foundation.md) | M0 |
| M2 | [Authentication](milestones/M2-authentication.md) | M1 |
| M3 | [Job creation, approval, publishing](milestones/M3-job-admin.md) | M1, and T-023 from M2 |
| M4 | [Candidate portal: jobs and profile](milestones/M4-candidate-portal.md) | M1 |
| M5 | [BPS-15+ resume tier](milestones/M5-resume-tier.md) | M4 |
| M6 | [Application flow and tracking](milestones/M6-applications.md) | M3, M4 |

**See who's on what** without opening every file:
```bash
grep -H -e "Owners:" -e "Status:" workspace/milestones/*.md
```

**Task IDs:** each milestone uses its own range (M4: T-040 to T-049). When a range is full, continue at 100 + its start (M4: T-140 to T-149).

**UI design:** the Figma candidate journey is summarised in [docs/pakrail-candidate-journey.html](../docs/pakrail-candidate-journey.html) (open it in a browser; a screen list is bottom-right). Its tasks are in M2 (T-027, T-028), M4 (T-049, T-140 to T-149) and M6 (T-069, T-160 to T-163).

**Status values:** `Not started` → `In progress` → `Done` (set by the owners in the milestone file when every task is `DONE`).

```
M0 → M1 ─┬→ M2 ──(T-023)──┐
         ├→ M3 ←──────────┘ ─┐
         └→ M4 ─┬────────────┴→ M6
                └→ M5
```

Don't start a milestone until its dependencies are `Done`. M3 only needs staff roles (T-023) from M2, so it can run alongside M2. Up to three milestones can run at once; with five people, join one as a co-owner rather than waiting.

## Deferred (out of current scope)

These wait until M6 is done. A new milestone file will be added for them when they're planned.

- **Screening and selection (§5):** auto-screening at deadline, manual scrutiny, shortlist, objection windows, admit cards, test/interview results, quota-wise merit list, document verification, medical, offer letter
- **Notifications (§6):** SMS + email on every status change (OTP SMS is in scope, in M2)
- **Urdu / English** support with RTL layout
- **Reports** per job, and an admin audit-trail viewer
- **Security review, low-bandwidth performance, production deployment**

## Open questions (from §9)

Decisions for stakeholders, not milestone tasks. When one is decided, the project lead records it here and adds a note in the affected milestone files.

| # | Question | Blocks | Decision | Decided on |
|---|----------|--------|----------|------------|
| 1 | Is BPS-15 the right tier boundary, or BPS-16? | M5 (tier split) | | |
| 2 | Who creates the job: the requesting department or a central recruitment cell? | T-023, T-030 (roles) | | |
| 3 | Is the written test in-house or by an external agency? | Deferred (§5) | | |
| 4 | Can a candidate edit or withdraw an application before the deadline? | - | **No.** Submitted applications are final. | 2026-09-24 |
| 5 | Upload size limit: the Figma design says 5 MB, the code enforces 2 MB. Which one? | T-149, T-160 | | |
| 6 | Dashboard statuses: the design shows Under Review / Approved / Rejected and cards "Drafts to finish" and "Action required". How do these map to the §4.9 statuses? (There are no draft applications today.) | T-069, T-162 | | |
| 7 | Should a logged-in candidate verify an OTP again for every application (design wizard steps 1-2)? | T-161 | | |
| 8 | Quota categories and age relaxation: the design lists son of railway employee, ex-serviceman and orphans quotas as percentages, and one age-relaxation claim. What is the official list and rules? | T-148, T-149 | | |
