# M6: Application flow and tracking

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** Ali
- **Status:** In progress
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
| T-060 | Eligibility engine service                        | Ali   | DONE   |
| T-061 | Application check API (missing items only)        | Ali   | DONE   |
| T-062 | Submit API: snapshot, application ID              | Ali   | DONE   |
| T-063 | [P] Fee payment (online / challan)                | -     | TODO   |
| T-064 | Application tracking API (status timeline)        | Ali   | DONE   |
| T-065 | Admin: applications per job + status update API   | Ali   | DONE   |
| T-161 | OTP re-check before applying (wizard steps 1-2)   | Ali   | DONE   |
| T-162 | Candidate dashboard API (counts + latest updates) | Ali   | DONE   |
| T-163 | [P] Prefill name/DOB from uploaded CNIC (OCR)     | -     | TODO   |

**Frontend**

| ID    | Task                                    | Owner | Status      |
|-------|-----------------------------------------|-------|-------------|
| T-066 | Application check UI                    | Ali   | DONE        |
| T-067 | Review and submit UI (declaration, fee) | Ali   | DONE        |
| T-068 | Tracking UI + admin status update UI    | Ali   | DONE        |
| T-069 | Candidate dashboard page                | Malaika, Ali| DONE        |
| T-160 | Apply wizard to match Figma (6 steps)   | Malaika, Ali| DONE        |

## Notes

- T-060: core logic; compares JobRequirement to profile, needs thorough tests.
- T-061: items filled here are saved back to the profile.
- T-062: one application per CNIC per job; profile data frozen into the snapshot; no edit or withdraw after submit.
- T-065: manual status changes until automated screening (deferred); every change writes a StatusEvent.
- T-066, T-067: UI built early on mock data; the mock eligibility check (`eligibilityMock.js`) shows T-060 the expected output.
- T-066 to T-068: submitted applications are final; no edit or withdraw UI.

### Figma candidate journey (T-069, T-160 to T-163)

Design: [docs/pakrail-candidate-journey.html](../../docs/pakrail-candidate-journey.html), screens `apply-1` to `apply-6` and `dashboard`.

- **Already built:** the application check (T-066), review and submit with declaration (T-067) and the candidate tracking timeline (T-068). T-160 and T-069 reshape these; they don't start from scratch.
- T-160: one wizard shell: "Applying for" card with View Details, a 6-step stepper (Identity, OTP, Profile, Documents, Review, Confirm), Back / Continue (disabled until valid). Profile step: CNIC front + back upload, then personal info (age calculated, read-only). Documents step: upload/replace rows with file name and size. Review: read-only summary + disclaimer "Changes cannot be made after submission". Confirm: "Application Submitted!" → Go To Dashboard.
  - **Domain rule 8 wins over the design:** the Profile and Documents steps show only what this job still needs from the candidate (T-061), not the whole profile or all 7 documents. A candidate whose profile is complete skips straight to Review.
- T-161: steps 1-2 re-check CNIC + mobile with an OTP although the candidate is logged in. Uses M2's OTP service (T-021) with a new purpose `apply`. Blocked by open question 7.
- T-069 + T-162 (`dashboard`): "Welcome, <name>"; stat cards (My applications, Drafts to finish, Under review, Action required, Approved); My applications table (Job ID, post, scale, application reference, date, status, View) with pagination; Latest updates feed from `StatusEvent`s. Replaces `MyApplicationsPage` as the signed-in landing page. Card and badge meanings blocked by open question 6.
- T-163: the design prefills personal info "from CNIC where possible". Needs an OCR service; proposed only, don't build until approved. The candidate must still be able to type the values.

### Core flow done (T-060 to T-062, T-064, T-065, T-068)

- `eligibility_service.check()`: education (qualification rank + minimum marks), experience (summed, current jobs up to today), age on the cutoff or closing date, domicile, required documents. Items are `met` / `missing` (with the profile section to fix) / `not_met`, the same shape the mock used.
- Candidate API: `GET /api/jobs/<id>/application-check`, `POST /api/jobs/<id>/applications` (`declarationAccepted`), `GET /api/applications`, `GET /api/applications/<PR-number>`. The application's public id is its number.
- Submit: job must be open, one application per candidate per job (also a database constraint), declaration accepted, every item met. The snapshot freezes personal, contact, domicile, education, experience and additional details, the age on the reference date, the eligibility result and the required documents; later profile edits don't change it. First `StatusEvent` is `submitted`. No edit or withdraw.
- Staff API: `GET /api/admin/jobs/<id>/applications` (`?status=`), `GET /api/admin/applications/<PR-number>`, `POST /api/admin/applications/<PR-number>/status` (admins only; forward along §4.9 or to rejected; rejected and offer are final). Each change writes a `StatusEvent` (with an optional note the candidate sees) and an audit entry.
- Staff UI: "View applications" on a published or closed job opens `/admin/jobs/:id/applications`, with a status filter and a status-change form for admins.
- Still open: T-063 fee payment ([P]); T-069, T-160 to T-163 (design, blocked by open questions 6 and 7; T-163 proposed).

### Design work done (T-069, T-160 to T-162)

- Screens follow Malaika's design (commit `7f1b755`), connected to the real API.
- T-160 + T-161, apply wizard (`/jobs/:id/apply`): 1 identity (CNIC + network + mobile, must be the registered ones), 2 SMS code (`POST /api/jobs/<id>/apply-code` and `/apply-code/verify`, which returns an `applyPass` valid 30 minutes for that job), 3 profile (the one-page form, saved to the profile), 4 documents (the job's documents plus proofs for claimed trade / quota / age relaxation), 5 review (eligibility result; submit disabled until complete and eligible), 6 confirmation with the application number. `POST /api/jobs/<id>/applications` requires the `applyPass`. The separate review page was removed.
- T-069 + T-162, dashboard (`/applications`): stats, applications table with pages, latest updates. Built from `GET /api/applications` (no extra API needed). Status groups: Under review = submitted, under review; Action required = document verification, medical; Approved = shortlisted onwards; Rejected. "Drafts to finish" is always 0 (applications only exist once submitted).
- OTP limits now count per purpose, so signing up and then applying straight away works.
- Still open: T-063 fee payment and T-163 CNIC reading (both proposed).
