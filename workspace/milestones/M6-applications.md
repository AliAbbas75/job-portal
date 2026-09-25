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

| ID    | Task                                              | Owner | Status |
|-------|---------------------------------------------------|-------|--------|
| T-060 | Eligibility engine service                        | -     | TODO   |
| T-061 | Application check API (missing items only)        | -     | TODO   |
| T-062 | Submit API: snapshot, application ID              | -     | TODO   |
| T-063 | [P] Fee payment (online / challan)                | -     | TODO   |
| T-064 | Application tracking API (status timeline)        | -     | TODO   |
| T-065 | Admin: applications per job + status update API   | -     | TODO   |
| T-161 | OTP re-check before applying (wizard steps 1-2)   | -     | TODO   |
| T-162 | Candidate dashboard API (counts + latest updates) | -     | TODO   |
| T-163 | [P] Prefill name/DOB from uploaded CNIC (OCR)     | -     | TODO   |

**Frontend**

| ID    | Task                                    | Owner | Status      |
|-------|-----------------------------------------|-------|-------------|
| T-066 | Application check UI                    | Ali   | DONE        |
| T-067 | Review and submit UI (declaration, fee) | Ali   | DONE        |
| T-068 | Tracking UI + admin status update UI    | Ali   | IN PROGRESS |
| T-069 | Candidate dashboard page                | -     | TODO        |
| T-160 | Apply wizard to match Figma (6 steps)   | -     | TODO        |

## Notes

- T-060: core logic; compares JobRequirement to profile, needs thorough tests.
- T-061: items filled here are saved back to the profile.
- T-062: one application per CNIC per job; profile data frozen into the snapshot; no edit or withdraw after submit.
- T-065: manual status changes until automated screening (deferred); every change writes a StatusEvent.
- T-066, T-067: UI built early on mock data; the mock eligibility check (`eligibilityMock.js`) shows T-060 the expected output.
- T-068: candidate tracking UI done; admin status update UI still to do (needs the admin area).
- T-066 to T-068: submitted applications are final; no edit or withdraw UI.

### Figma candidate journey (T-069, T-160 to T-163)

Design: [docs/pakrail-candidate-journey.html](../../docs/pakrail-candidate-journey.html), screens `apply-1` to `apply-6` and `dashboard`.

- **Already built:** the application check (T-066), review and submit with declaration (T-067) and the candidate tracking timeline (T-068). T-160 and T-069 reshape these; they don't start from scratch.
- T-160: one wizard shell: "Applying for" card with View Details, a 6-step stepper (Identity, OTP, Profile, Documents, Review, Confirm), Back / Continue (disabled until valid). Profile step: CNIC front + back upload, then personal info (age calculated, read-only). Documents step: upload/replace rows with file name and size. Review: read-only summary + disclaimer "Changes cannot be made after submission". Confirm: "Application Submitted!" → Go To Dashboard.
  - **Domain rule 8 wins over the design:** the Profile and Documents steps show only what this job still needs from the candidate (T-061), not the whole profile or all 7 documents. A candidate whose profile is complete skips straight to Review.
- T-161: steps 1-2 re-check CNIC + mobile with an OTP although the candidate is logged in. Uses M2's OTP service (T-021) with a new purpose `apply`. Blocked by open question 7.
- T-069 + T-162 (`dashboard`): "Welcome, <name>"; stat cards (My applications, Drafts to finish, Under review, Action required, Approved); My applications table (Job ID, post, scale, application reference, date, status, View) with pagination; Latest updates feed from `StatusEvent`s. Replaces `MyApplicationsPage` as the signed-in landing page. Card and badge meanings blocked by open question 6.
- T-163: the design prefills personal info "from CNIC where possible". Needs an OCR service; proposed only, don't build until approved. The candidate must still be able to type the values.
