# M2: Authentication

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** -
- **Status:** Not started
- **Branch:** `m2-authentication`
- **Depends on:** M1

## Scope

Master flow §4.3. Candidate signup and OTP login; staff login with roles.

## Done when

- A candidate can sign up, receive an OTP (stubbed SMS in dev) and log in, and a permanent profile exists.
- Duplicate CNIC is rejected. OTP requests are rate-limited.
- Staff roles (job creator, approver, admin) gate the admin API and admin pages.

## Tasks

**Backend**

| ID    | Task                                         | Owner | Status |
|-------|----------------------------------------------|-------|--------|
| T-020 | Candidate signup API (CNIC, mobile, CAPTCHA) | -     | TODO   |
| T-021 | OTP service (expiry, rate limit, SMS stub)   | -     | TODO   |
| T-022 | Candidate OTP login, JWT, account recovery   | -     | TODO   |
| T-023 | Staff login + roles                          | -     | TODO   |
| T-024 | [P] NADRA CNIC verification interface        | -     | TODO   |

**Frontend**

| ID    | Task                            | Owner | Status |
|-------|---------------------------------|-------|--------|
| T-025 | Signup / OTP / login pages      | Ali   | DONE   |
| T-026 | Staff login page + route guards | -     | TODO   |

## Notes

- T-020: CNIC format + duplicate check; signup creates the permanent profile.
- T-023: roles are job creator, approver, admin. Do this first; M3 depends on it. Depends on open question 2.
- T-024: stub until NADRA integration is available.
- T-025: built on the mock API (`src/api/mocks/authMock.js`). T-020 to T-022 must match its request/response shapes.
