# M4: Candidate portal: jobs and profile

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** Ali, Malaika
- **Status:** In progress
- **Branch:** `m4-candidate-portal`
- **Depends on:** M1

## Scope

Master flow §4.1, 4.2, 4.4. Job search, job details, permanent profile, document vault.

## Done when

- Candidates can search and filter jobs and view job details on a phone-width screen.
- Every profile section can be filled and edited; documents uploaded once can be reused.
- Age is calculated from DOB, never entered.

## Tasks

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

## Notes

- T-040: filters are BPS, department, location, education, employment type, deadline.
- T-044: age from DOB as of closing date or advertisement cutoff date.
- T-048: client-side compression before upload.
- T-045 to T-048: UI built early on mock data. T-040 to T-043 must match the shapes in `src/api/mocks/`.
