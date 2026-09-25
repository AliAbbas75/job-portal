# M2: Authentication

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** Ali
- **Status:** In progress
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
| T-020 | Candidate signup API (CNIC, mobile, CAPTCHA) | Ali   | DONE   |
| T-021 | OTP service (expiry, rate limit, SMS stub)   | Ali   | DONE   |
| T-022 | Candidate OTP login, JWT, account recovery   | Ali   | DONE   |
| T-023 | Staff login + roles                          | Ali   | DONE   |
| T-024 | [P] NADRA CNIC verification interface        | -     | TODO   |
| T-028 | Telecom operator on account + OTP requests   | -     | TODO   |

**Frontend**

| ID    | Task                                   | Owner | Status |
|-------|----------------------------------------|-------|--------|
| T-025 | Signup / OTP / login pages             | Ali   | DONE   |
| T-026 | Staff login page + route guards        | -     | TODO   |
| T-027 | Auth screens to match the Figma design | -     | TODO   |

## Notes

- T-020: CNIC format + duplicate check; signup creates the permanent profile.
- T-022: issue the token M4's APIs already accept: Flask-JWT-Extended access token, identity = candidate account id as a string, claim `{"role": "candidate"}` (see `backend/app/controllers/auth_guard.py`).
- T-023: roles are job creator, approver, admin. Staff accounts have an optional department; whether job creators are limited to their department is open question 2 (decide in M3).
- T-024: stub until NADRA integration is available.
- T-025: signup, OTP and login already work (mock API). T-027 restyles them to the design.
- T-025: built on the mock API (`src/api/mocks/authMock.js`). T-020 to T-022 must match its request/response shapes.
- **Figma candidate journey** ([docs/pakrail-candidate-journey.html](../../docs/pakrail-candidate-journey.html)), screens `login`, `register`, `otp`, `otp-success`:
  - T-027: telecom operator dropdown (Jazz, Telenor, Ufone, Zong) and CAPTCHA on **both** signup and login; 6-box OTP input; signup ends on a "Success! … Login Now" screen instead of signing in straight away; "Remember me" on login. Logged-in header buttons (Dashboard / Log out) are in M4 T-141.
  - T-028: store the operator on `CandidateAccount` (migration) and accept it in `/auth/<purpose>/otp`; "Remember me" gives a longer-lived token.
  - The design's "Forgot Password?" link is not built: candidates have no password (login is always a fresh OTP).
