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

**Frontend**

| ID    | Task                            | Owner | Status |
|-------|---------------------------------|-------|--------|
| T-025 | Signup / OTP / login pages      | Ali   | DONE   |
| T-026 | Staff login page + route guards | Ali   | DONE   |

## Notes

- T-020: CNIC format + duplicate check; signup creates the permanent profile.
- T-022: issue the token M4's APIs already accept: Flask-JWT-Extended access token, identity = candidate account id as a string, claim `{"role": "candidate"}` (see `backend/app/controllers/auth_guard.py`).
- T-023: roles are job creator, approver, admin. Staff accounts have an optional department; whether job creators are limited to their department is open question 2 (decide in M3).
- T-024: stub until NADRA integration is available.
- T-025: built on the mock API (`src/api/mocks/authMock.js`). T-020 to T-022 match its request/response shapes.
- Done (T-020 to T-023, T-026):
  - Endpoints: `POST /api/auth/<signup|login>/otp`, `POST /api/auth/<signup|login>/verify`, `GET /api/auth/session`, `POST /api/auth/logout`; staff: `POST /api/admin/auth/login`, `GET /api/admin/auth/session`, `POST /api/admin/auth/logout`.
  - OTP: 6 digits, only a keyed hash stored, 5-minute expiry, 60 s before a resend, at most 5 codes per CNIC or mobile per hour, 5 wrong tries per code. SMS is a stub (`SMS_BACKEND=console` prints it in development); a real gateway is still to be chosen, and production refuses to send until then.
  - CAPTCHA: Cloudflare Turnstile checked on the server when `CAPTCHA_SECRET_KEY` is set (skipped in development; production refuses to run without it). The signup page still shows the checkbox placeholder and sends no token; the real widget comes with T-027.
  - Staff passwords: Argon2id (`argon2-cffi`), 12+ characters. Accounts are created with `flask create-staff` (no admin screen yet).
  - Logout revokes the token (`revoked_tokens` table). Migration `4a947c997756` adds `otp_challenges` and `revoked_tokens`.
  - T-022: account recovery isn't built. It is **[Proposed]** in master flow §4.3 and needs a stakeholder decision (e.g. how to change a lost mobile number).
  - Not yet: per-IP rate limiting (Nginx/Cloudflare at deployment) and a lockout after repeated wrong staff passwords.
