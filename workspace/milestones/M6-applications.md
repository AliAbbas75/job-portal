# M6: Application flow and tracking

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** -
- **Status:** Not started
- **Branch:** `m6-applications`
- **Depends on:** M3, M4

## Scope

Master flow §4.6–4.9. Application check, review and submit, snapshot, tracking. The core of the portal.

## Done when

- For a given job, the application check lists only the missing items; filling them saves back to the profile.
- Submitting creates an application ID and a frozen snapshot; later profile edits don't change it.
- A second application to the same job is rejected. Submitted applications can't be edited or withdrawn.
- Candidates see their status timeline. Staff can move an application through the §4.9 statuses by hand (automated screening comes later).

## Tasks

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

## Notes

- T-060: core logic; compares JobRequirement to profile, needs thorough tests.
- T-061: items filled here are saved back to the profile.
- T-062: one application per CNIC per job; profile data frozen into the snapshot; no edit or withdraw after submit.
- T-065: manual status changes until automated screening (deferred); every change writes a StatusEvent.
- T-066, T-067: UI built early on mock data; the mock eligibility check (`eligibilityMock.js`) shows T-060 the expected output.
- T-068: candidate tracking UI done; admin status update UI still to do (needs the admin area).
- T-066 to T-068: submitted applications are final; no edit or withdraw UI.
