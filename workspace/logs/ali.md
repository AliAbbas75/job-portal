# Work Log: Ali

Newest entries at the top. Template and rules: [../WORKFLOW.md](../WORKFLOW.md#step-4-work-and-log).

<!-- Copy this block for each entry:

### YYYY-MM-DD | T-### Task title
- **Status:** Done / Partial / In progress
- **Milestone:** M#
- **What changed:**
  - `path/to/file`: what and why
- **Database:** migrations, or "none"
- **Commits:**
  - `type(scope): summary [T-###]`
- **How to test:**
- **Notes / follow-ups:**

-->

### 2026-09-26 | M5 backend: resume upload + parse, builder sections, PDF export (T-050 to T-053)
- **Milestone:** M5
- **Status:** Partial (backend + API layer done; screens T-054 to T-056 are Malaika's)
- **What changed:**
  - Backend: `services/resume_parser_service.py` (rule-based: personal, contact, education level/year/marks/institution, experience ranges, skills, registrations, publications, references, statement; confidence per value), `services/resume_service.py` (text from PDF/DOCX, upload + parse, resume PDF), `controllers/resume_controller.py` (`POST /api/resume`, `GET /api/resume/pdf`), profile schemas/services for registrations, publications, references, statement of purpose; snapshots include them; `storage_service` accepts Word files only where asked (resumes); document type `resume`; `resumeTier` on jobs (`RESUME_TIER_MIN_BPS`, default 15). Tests: parser, upload DOCX/PDF, scanned PDF, type checks, sections, PDF, tier (154 backend tests).
  - Dependencies: `pypdf==6.19.0` (read PDF resumes), `python-docx==1.2.0` (read Word resumes), `fpdf2==2.8.8` (resume PDF export). All pure-Python; they pull in `lxml`, `Pillow`, `fonttools`, `defusedxml` (prebuilt wheels).
  - Frontend API layer: `src/api/resume.js` + `mocks/resumeMock.js`, new sections in `mocks/profileMock.js`, `resumeTier` in `mocks/jobsMock.js`, docs in `api/profile.js`; `src/api/resume.test.js` (51 frontend tests).
  - Docs: M5 file (spec for Malaika's screens), MILESTONES open question 1
- **Database:** none (tables from M1). Run `flask seed` for the `resume` document type, and `pip install -r requirements-dev.txt`.
- **Commits:**
  - `feat(resume): resume upload and parse, BPS-15+ sections, resume PDF [T-050]`
- **How to test:** four checks; `POST /api/resume` with a PDF or Word CV returns suggested sections; `GET /api/resume/pdf` downloads the profile as a PDF.
- **Notes / follow-ups:** screens T-054 to T-056 (Malaika). Parser is rule-based; unusual layouts give lower confidence, which the confirm screen highlights.

### 2026-09-26 | Lint fix in Malaika's admin page
- **Milestone:** none (fix)
- **Status:** Done
- **What changed:**
  - `frontend/src/pages/admin/AdminHomePage.jsx`: removed the unused `setChosenStatus` (the status filter has no control yet) and ran Prettier on this file only. No behaviour change. It was failing the lint and Prettier hooks.
- **Database:** none
- **Commits:**
  - `fix(admin): lint and format AdminHomePage [fix]`
- **How to test:** `cd frontend && npm run lint && npx prettier --check src`
- **Notes / follow-ups:** Malaika: pull before editing this file again.

### 2026-09-26 | M6 complete: application fee by bank challan (T-063); T-163 deferred
- **Milestone:** M6
- **Status:** Done (M6 complete)
- **What changed:**
  - Backend: `FeeStatus` enum; `Application.fee_amount`, `fee_status`, `fee_paid_at`, `fee_reference`, `fee_confirmed_by_id` (migration `e3f45ae9f155`); submit records the job's fee; `application_service.challan()` and `confirm_fee()`; `GET /api/applications/<no>/challan`, `POST /api/admin/applications/<no>/fee` (admins, audited); `fee` in application JSON, `feeReference` for staff; config + `.env.example` `FEE_BANK_NAME`, `FEE_ACCOUNT_TITLE`, `FEE_ACCOUNT_NO`, `FEE_DUE_DAYS`. Tests: fee challan + confirmation, no-fee case (146 backend tests).
  - Frontend: `pages/candidate/ChallanPage.jsx` (printable, 3 copies), `components/common/FeeBadge.jsx`, fee section on the application page, fee notice in the wizard review and "Print fee challan" on its confirmation, unpaid fees counted as "Action required" on the dashboard, "Confirm fee" on the staff applicant row; `api/applications.js` `getChallan`, `api/adminApplications.js` `confirmFee` + mocks; route `/applications/:id/challan`; header hidden when printing; i18n `fee.json`, new error codes. `vite.config.js`: tests always use the mock API (a local `.env.local` with `VITE_USE_MOCKS=false` was breaking them); dev server fixed to port 5180. `docker-compose.yml`: database restarts with Docker Desktop. Test for the fee confirmation (48 frontend tests).
  - Docs: M6 (Done), MILESTONES deferred list (online payment, CNIC OCR, NADRA)
- **Database:** migration `e3f45ae9f155`. Run `flask db upgrade`.
- **Commits:**
  - `feat(applications): application fee by bank challan; M6 complete [T-063]`
- **How to test:** four checks. Apply to a job with a fee (e.g. Assistant Director IT, Rs 800) → print the challan from the confirmation or the application page → as admin, Applications → Confirm fee.
- **Notes / follow-ups:** set the real fee account in the backend `.env` before launch. Malaika's `AdminHomePage.jsx` still fails lint/Prettier (unused `setChosenStatus`); left untouched.

### 2026-09-25 | Malaika's candidate screens merged and connected to the backend (M4 T-145, T-149; M6 T-069, T-160 to T-162)
- **Milestone:** M4, M6
- **Status:** Done for those tasks
- **What happened:** Malaika pushed a redesign of the header, signup/login, code step, profile, apply wizard and dashboard (commit `7f1b755`) while my design commit was unpushed. Decision (Ali): her screens and flow win, the backend adapts. Her screens were static (hard-coded sample person, no submit call, login check removed, silent demo-data fallbacks, password fields, colours outside the palette), so each was rebuilt on her layout and text with real data, brand colours and `i18n`. Candidate login stays SMS-code only (no passwords).
- **What changed:**
  - Backend: `QuotaClaim`, `AgeRelaxationClaim`, `TradeCertificate`, `MobileOperator.ONIC`, `OtpPurpose.APPLY`; profile columns for highest education, trade certificate and claims; `PUT /api/profile/summary` (`SummaryInput`, `profile_service.update_summary`); profile JSON `claims`; reference lists; 3 document types; `GET /api/documents/<id>/file`; apply-code endpoints + `applyPass` required to submit (`application_service`, `application_schema`, `application_controller`); eligibility counts the highest level without full records; OTP limits per purpose; 5 MB uploads. Migration `69cb5fc8dd8f` (also widens the operator and OTP-purpose checks). Tests: `test_profile_summary.py`, apply-code and pass tests, per-purpose OTP test (143 backend tests).
  - Frontend (her design): `SiteHeader` (account menu; "Reset Password" removed), `AuthCard`, `OtpStep` (6 boxes, auto-verify, success screen), `SignupPage`, `LoginPage`, `MyApplicationsPage` (dashboard), `ProfilePage/` (`ProfileForm`, `ProfilePicture`, index with education/experience/documents below), `ApplicationCheckPage/` (wizard: `index`, `IdentityStep`, `DocumentsStep`, `ReviewStep`, test), `ApplySteps`, `JobsByCategoryAndBps` (live counts), `AppLayout` (footer on every page); new `components/forms/{IconField,ProfileFields}.jsx`, `components/layout/CandidateTabs.jsx`, `utils/{age,profileForm}.js`; `RequireCandidate` login check restored; `api/profile.js` fallbacks removed; `api/applications.js` apply-code calls; `api/documents.js` file download; mocks updated (summary, claims, apply code, 5 MB, highest-education rule). Moved `FaqSection` back to `components/layout/`. Deleted: `ApplicationReviewPage/`, `ProfilePage/{Personal,Contact,Domicile,Additional,Skills}Section.jsx`, `SectionForm.jsx`, `sections.js`, `ApplicationCheckPage/CheckItem.jsx`, `components/forms/OtpInput.jsx`, `HomePage/JobCountCards.jsx`, i18n `applications`, `apply`, `check`, `login`, `review`, `signup`. New i18n: `auth`, `dashboard`, `profileForm`, `wizard`. Tests updated/added (47 frontend tests).
  - Docs: M4, M6, MILESTONES (open questions 5, 6, 7 decided)
- **Database:** migration `69cb5fc8dd8f`. Run `flask db upgrade` and `flask seed`.
- **Commits:**
  - `feat(ui): Malaika's candidate screens on the real API; profile claims, apply identity check [T-160]`
- **How to test:** four checks. Mock mode: sign up (code 123456), fill My profile, apply to Ticket Checker (code 123456 again), see it on the dashboard. Real API: the same with codes from the `flask run` log.
- **Notes / follow-ups:** open question 8 (quota and age-relaxation rules) still open. Tell Malaika her screens were kept and why the internals changed.

### 2026-09-25 | Figma design: header, home, Available jobs, job details, auth screens, categories (M4 T-141 to T-144, T-146, T-147; M2 T-027, T-028)
- **Milestone:** M4, M2
- **Status:** Done for those tasks (M2 complete; M4 still has T-145, T-148, T-149)
- **What changed:**
  - Backend: `JobCategory` model (`models/reference.py`), `Job.category_code` + relationship, seed `JOB_CATEGORIES`, reference API `jobCategories`, job search `category` and `scale` filters, stats `byCategory` / `byBps`, job JSON `category` / `categoryName`, admin job input requires `category`; demo jobs get categories. `MobileOperator` enum + `CandidateAccount.mobile_operator`; OTP request takes `operator` (required for signup) and checks the CAPTCHA for login too; verify takes `operator` and `remember` (30-day token). Migrations `904db39c53bf` (T-147) and `7205f1a38036` (T-028). Tests updated/added (134 backend tests).
  - Frontend layout: `SiteHeader.jsx` (rewritten), `SiteFooter.jsx` (rewritten, brand colours, i18n), `AppLayout.jsx` (FAQ moved to the home page); deleted `components/layout/FaqSection.jsx`, the FAQ utilities in `index.css`, and `pages/public/JobSearchPage/{HomeHero,SearchCard,MoreFilters,JobListItem}.jsx`
  - New: `pages/public/HomePage/` (`index.jsx`, `HowItWorks.jsx`, `JobCountCards.jsx`, `FaqSection.jsx`, test), `components/common/{JobsTable,Pagination,Countdown,ShareButton}.jsx`, `components/forms/{Captcha,OperatorField,OtpInput}.jsx`, `utils/jobCode.js`, `pages/public/SignupPage.test.jsx`, i18n `home`, `faq`, `countdown`, `share`, `operators`, `captcha`
  - Changed: `pages/public/JobSearchPage/` (now `/jobs` with table and pages), `JobDetailsPage`, `SignupPage`, `LoginPage`, `OtpStep` (6 boxes), `AuthProvider` (remember me), `api/auth.js`, `api/jobs.js`, `api/reference.js`, mocks (categories, scale, stats, operator), admin job form (category), `i18n/index.js` (`tList`), `utils/format.js` (`formatLongDate`), routes/paths (`/jobs`), links that said "Find jobs" now go to `/jobs`; i18n `header`, `nav`, `footer`, `hero`, `jobs`, `job`, `signup`, `login`, `otp`, `fields`, `validation`, `adminJobs`
  - `react-icons` (added earlier by Malaika without a log line): kept for the four social icons in the footer; tree-shaken, so only those icons are bundled.
  - Docs: M2 and M4 files, `frontend/.env.example` (`VITE_TURNSTILE_SITE_KEY`)
- **Database:** migrations `904db39c53bf` (job categories), `7205f1a38036` (mobile operator). Run `flask db upgrade` and `flask seed`.
- **Commits:**
  - `feat(ui): Figma header, home, jobs table, job details and auth screens; job categories [T-141]`
- **How to test:** four checks; `npm run dev` in mock mode: home page sections and FAQ tabs, `/jobs` filters and pages, a job's countdown, signup with network + CAPTCHA + 6-box code.
- **Notes / follow-ups:** design deviations are listed in the M2 and M4 notes (white header for the logo, no carousel, no second SMS after signup). A white-out logo and hero photos would close the first two.

### 2026-09-25 | M6 core: eligibility, apply, snapshot, tracking, staff status updates (T-060 to T-062, T-064, T-065, T-068)
- **Milestone:** M6
- **Status:** Partial (core flow done; T-063 [P], T-069, T-160 to T-163 open)
- **What changed:**
  - Backend: `services/eligibility_service.py` (T-060), `services/application_service.py` (check, submit with snapshot and first status event, candidate list/get, staff list, status changes), `schemas/application_schema.py`, `controllers/application_controller.py`, `controllers/admin/application_controller.py`, registered in `controllers/__init__.py`; `models/constants.py` `next_application_statuses()` (the §4.9 order rule, shared by service and schema)
  - Tests: `tests/services/test_eligibility_service.py`, `tests/controllers/test_application_controller.py`; conftest `eligible_candidate` fixture (130 backend tests)
  - Frontend: `api/adminApplications.js`, `api/mocks/adminApplicationsMock.js`, `pages/admin/JobApplicationsPage/` (`index.jsx`, `ApplicationRow.jsx`, test), route `/admin/jobs/:id/applications`, "View applications" on `AdminJobPage`; i18n `adminApplications.json`, `invalid_status_change` error. Candidate pages needed no changes: the API matches the mocks.
  - Docs: M6 file, M4 note (M2 login done), README
- **Database:** none (tables from M1)
- **Commits:**
  - `feat(applications): eligibility engine, apply with snapshot, tracking and staff status updates [T-060]`
- **How to test:** four checks. Real API: sign up, fill personal/domicile/education, upload the job's documents, apply; as admin at `/admin`, open the job → View applications → Change status; the candidate's timeline shows it.
- **Notes / follow-ups:** status changes are admin-only until a screening role exists; fee payment ([P]) not built.

### 2026-09-25 | M3: job drafting, approval and publishing (T-030 to T-035)
- **Milestone:** M3
- **Status:** Done (M3 complete)
- **What changed:**
  - Backend: `schemas/admin_job_schema.py` (JobInput with nested requirements and quotas, quota seats must equal vacancies; DecisionInput; PublishInput; AdminJobSchema with real status and approval history), `services/admin_job_service.py` (draft, edit, submit, N-of-M approve/return/reject with rounds, publish, `close_expired_jobs`), `controllers/admin/job_controller.py` (role-guarded endpoints), registered in `controllers/__init__.py`; `commands.py` `flask close-jobs`; `config.py` + `.env.example` `JOB_APPROVALS_REQUIRED`
  - Tests: `tests/controllers/admin/test_admin_job_controller.py`, `tests/services/test_admin_job_service.py` (115 backend tests)
  - Frontend: `api/adminJobs.js`, `api/mocks/adminJobsMock.js`, `adminAuthMock.js` (`currentMockStaff`), `api/client.js` (ApiError carries `fields`), `components/layout/AdminLayout.jsx`, `components/common/JobStatusBadge.jsx`, `components/common/JobRequirements.jsx` (moved from `pages/public/JobDetailsPage/Requirements.jsx` so the staff page can reuse it), `utils/staffRoles.js`, `pages/admin/AdminJobsPage.jsx`, `pages/admin/JobFormPage/` (`index.jsx`, `QuotaFields.jsx`, `jobForm.js` + test), `pages/admin/AdminJobPage/` (`index.jsx`, `JobActions.jsx` + test), routes and paths; deleted `pages/admin/AdminHomePage.jsx` (replaced by the jobs list); i18n `adminJobs.json`, new error codes; `admin.json` unused keys removed
  - Docs: M3 file, README (`flask close-jobs`)
- **Database:** none (existing tables)
- **Commits:**
  - `feat(admin): job drafting, approval and publishing [T-030]`
- **How to test:** four checks. Mock mode: log in at `/admin/login` as creator, approver or admin (`demo-password`). Real API: `flask create-staff` for each role, then create, submit, approve and publish a job; it shows on the public search.
- **Notes / follow-ups:** open question 2 (department scoping); advertisement file with T-148; `flask close-jobs` needs a cron entry at deployment.

### 2026-09-25 | Workflow: two branches only (develop + main), no pull requests
- **Milestone:** none (repo process)
- **Status:** Done
- **What changed:**
  - `workspace/WORKFLOW.md`: rewritten. Everyone works and pushes on `develop` (`git pull --rebase` first); `main` only gets releases from the project lead; no other branches, no PRs, no reviews; conflict and recovery steps for `pull --rebase`
  - `CLAUDE.md` §1, Claude session rules, §6, §8: same rules
  - `workspace/MILESTONES.md`, `workspace/milestones/*.md`: branch column and `Branch:` lines removed; status is set by the owners
  - `README.md`, `docs/PROJECT_STRUCTURE.md`: PR wording replaced
  - `workspace/milestones/M2-authentication.md`: T-026 back to DONE and the M2 completion notes restored (both were lost when PR #16 was merged on GitHub)
  - Merged `fix/prettier-format` into `develop`; deleted the old branches on GitHub (`fix/prettier-format`, `m2-authentication`, `m4-candidate-portal`, `fix/branch-cleanup`, `fix/candidate-journey-tasks`) after checking they were all merged
- **Database:** none
- **Commits:**
  - `docs(workspace): two-branch workflow, develop and main only [fix]`
- **How to test:** n/a
- **Notes / follow-ups:** repo settings on GitHub must allow direct pushes to `develop` (WORKFLOW.md → Repo settings).

### 2026-09-25 | Prettier fix for files that failed the format check
- **Milestone:** none (branch `fix/prettier-format`, PR into `develop`)
- **Status:** Done
- **What changed:**
  - `frontend/src/components/common/Logo.jsx`, `components/layout/FaqSection.jsx`, `components/layout/SiteFooter.jsx`, `pages/public/JobSearchPage/JobListItem.jsx`: `npm run format` (Tailwind class order and line wrapping only, no behaviour change). They made the `frontend prettier` pre-commit hook fail for everyone.
- **Database:** none
- **Commits:**
  - `chore(frontend): run Prettier on files that failed format check [fix]`
- **How to test:** `cd frontend && npm run format:check`
- **Notes / follow-ups:** the real cleanup of these files (i18n text, brand colours) is M4 T-146.

### 2026-09-25 | M2: candidate signup/login with OTP, staff login and roles (T-020 to T-023, T-026)
- **Milestone:** M2 (branch m2-authentication)
- **Status:** Done for T-020 to T-023 and T-026; M2 stays In progress (T-024 [P], and T-027/T-028 from the design PR)
- **What changed:**
  - Models: `otp_challenge.py` (`OtpChallenge`: hashed code, expiry, attempts), `revoked_token.py` (`RevokedToken` for logout), `OtpPurpose` enum; registered in `models/__init__.py`
  - Services: `otp_service.py` (issue/verify, 5 min expiry, 60 s resend, 5 per hour per CNIC or mobile, 5 wrong tries), `sms_service.py` (stub: console in dev, memory in tests, refuses otherwise), `captcha_service.py` (Cloudflare Turnstile when `CAPTCHA_SECRET_KEY` is set), `auth_service.py` (signup creates account + permanent profile + audit entry; login; candidate token; token revocation), `staff_service.py` (Argon2id passwords, login with one error for every failure, staff token, audit entry)
  - Schemas: `auth_schema.py` (CNIC/mobile/OTP input, mobile dash removed; session JSON matching `authMock.js`), `staff_schema.py`
  - Controllers: `auth_controller.py` (`/api/auth/<signup|login>/otp|verify`, `/session`, `/logout`), `admin/auth_controller.py` (`/api/admin/auth/login|session|logout`), `auth_guard.py` (`@staff_required(*roles)`, revoked-token check), `errors.py` (revoked token → unauthorized), `controllers/__init__.py` registers `/api/admin` blueprints
  - `commands.py`: `flask create-staff`. `config.py` + `.env.example`: OTP limits, `SMS_BACKEND`, `CAPTCHA_SECRET_KEY`
  - Dependency: `argon2-cffi==25.1.0` in `requirements.txt`. Why: Argon2id password hashing for staff, as the tech stack in CLAUDE.md requires; Werkzeug's built-in hashing doesn't offer Argon2
  - Tests: `services/test_otp_service.py`, `services/test_staff_service.py`, `controllers/test_auth_controller.py`, `controllers/admin/test_admin_auth_controller.py`; conftest fixtures `sms_outbox`, `last_otp`, `make_staff`, `staff_headers` (101 backend tests)
  - Frontend (T-026): `api/adminAuth.js` + `api/mocks/adminAuthMock.js`, `api/client.js` (staff token on `/admin/...` requests), `context/StaffAuthContext.js`, `context/StaffAuthProvider.jsx`, `hooks/useStaffAuth.js`, `routes/RequireStaff.jsx` (+ test), `pages/admin/StaffLoginPage.jsx`, `pages/admin/AdminHomePage.jsx` (removed `pages/admin/.gitkeep`), routes `/admin/login` and `/admin`, `App.jsx`; i18n `staffLogin.json`, `admin.json`, new codes in `errors.json`
  - Docs: README (dev OTP in the flask log, `create-staff`, mock staff logins), CLAUDE.md (staff auth contract), M2 notes, M3 note on using the guards
- **Database:** migration `4a947c997756` (T-021): tables `otp_challenges`, `revoked_tokens`
- **Commits:**
  - `feat(auth): candidate OTP signup/login and staff login with roles [T-020]`
- **How to test:** four checks in WORKFLOW.md. Manual: `flask db upgrade`, `flask create-staff`, `frontend/.env.local` with `VITE_USE_MOCKS=false`, then sign up at `/signup` (code in the `flask run` output) and log in to the staff area at `/admin/login`
- **Notes / follow-ups:** account recovery not built ([Proposed]); no SMS gateway yet; per-IP rate limiting and staff lockout left for deployment/security review. `frontend prettier` hook fails on 4 files from `develop` that this branch doesn't touch (`Logo.jsx`, `FaqSection.jsx`, `SiteFooter.jsx`, `JobListItem.jsx`).
### 2026-09-25 | Figma candidate journey: tasks added to M2, M3, M4, M6
- **Milestone:** none (planning, branch `fix/candidate-journey-tasks`, PR into `develop`)
- **Status:** Done
- **What changed:**
  - `docs/pakrail-candidate-journey.html` (new): the Figma candidate journey as a structural HTML skeleton. Sample CNIC, mobile, email, name and address replaced with dummy values before committing.
  - `workspace/milestones/M2-authentication.md`: T-027 (auth screens to match the design), T-028 (telecom operator, remember me); note that "Forgot Password?" isn't built (no passwords)
  - `workspace/milestones/M3-job-admin.md`: note on the extra job fields the job form must capture
  - `workspace/milestones/M4-candidate-portal.md`: status back to In progress; T-049 and T-140 marked DONE (Malaika's FAQ, news bar, footer, already merged); new T-141 to T-149 (header/nav, home sections, `/jobs` table page, job details, profile page, conventions cleanup, job category, job detail fields, profile quota/age-relaxation fields)
  - `workspace/milestones/M6-applications.md`: T-069 (dashboard page), T-160 (6-step apply wizard), T-161 (OTP re-check), T-162 (dashboard API), T-163 [P] (CNIC OCR prefill); rule 8 (only missing items) overrides the design's full-profile steps
  - `workspace/MILESTONES.md`: task ID overflow rule (100 + range start), link to the design, open questions 5 to 8
  - `CLAUDE.md`: design file in key files
- **Database:** none
- **Commits:**
  - `docs(workspace): add Figma candidate journey and its tasks [fix]`
- **How to test:** open `docs/pakrail-candidate-journey.html` in a browser; screen list bottom-right
- **Notes / follow-ups:** open questions 5 to 8 need stakeholder answers before T-148, T-149, T-161, T-162. Design colours (blue buttons, Inter) are mapped to brand tokens, per the M4 notes.

### 2026-09-24 | M4 backend: jobs, reference, profile, documents APIs (T-040–T-044)
- **Milestone:** M4 (branch m4-candidate-portal)
- **Status:** Done (M4 complete)
- **What changed:**
  - `backend/app/controllers/`: `job_controller.py` (GET /jobs, /jobs/stats, /jobs/<id>), `reference_controller.py` (GET /reference), `profile_controller.py` (profile sections + education/experience CRUD), `document_controller.py` (vault list/upload/remove), `auth_guard.py` (`@candidate_required`, JWT contract for M2); `__init__.py` registers them alphabetically; `errors.py` returns `validation_error` with `fields`, and JWT failures as `unauthorized`
  - `backend/app/services/`: `job_service.py` (open published jobs only; keyword, BPS, department, type, location, qualification-rank, closing filters; sort; pagination; stats), `reference_service.py`, `profile_service.py` (domicile district must be in province; edit history in audit log: section + field names, no values), `document_service.py` (type-checked upload, replace/remove archive instead of delete), `candidate_service.py`, `demo_seed_service.py`
  - `backend/app/schemas/`: `job_schema.py`, `reference_schema.py`, `profile_schema.py` (per-section input validation, blank strings → missing, read-only cnic/mobile ignored), `document_schema.py`; JSON shapes match the frontend mocks
  - `backend/app/models/`: `constants.py` (BPS ranges, closing windows, labels), `Job.is_open()`, `Job.department` and `CandidateProfile.domicile_district` relationships (no schema change)
  - `backend/app/utils/dates.py`: `age_on()` (T-044)
  - `backend/app/commands.py`: `flask seed-demo` (dev only, gated on config name, since `flask` CLI overrides DEBUG); `config.py`: `ENV_NAME`, 32+ byte test keys; `.env.example`: longer keys + `FLASK_DEBUG=1`
  - Tests: jobs (11), reference, profile (10), documents (6), dates (6), demo seed; conftest `publish_job` + `auth_headers` fixtures, session cleared between tests (74 backend tests)
  - Frontend: quotas use a `category` code translated via new `i18n/en/quota.json` (mock data updated); `.env.example` note
  - Docs: README (seed-demo, real-API mode), CLAUDE.md (auth contract, validation error shape), M2 note on the token T-022 must issue, M4 tasks done
- **Database:** none (relationships only; `flask db check` clean)
- **Commits:**
  - `feat(api): M4 jobs, reference, profile and document endpoints [T-040]`
- **How to test:** four checks in WORKFLOW.md; manual: `flask seed-demo`, `frontend/.env.local` with `VITE_USE_MOCKS=false`, `npm run dev`: job search and details show database jobs
- **Notes / follow-ups:** profile/document pages need M2's login to use the real API from the browser

### 2026-09-24 | Self-serve milestones and conflict-proof layout
- **Milestone:** none (repo maintenance, branch `fix/branch-cleanup`, PR into `develop`)
- **Status:** Done
- **What changed:**
  - `workspace/milestones/M0…M6-*.md` (new): one file per milestone with its Claim block (owners, status, branch, depends on), scope, done-when, tasks and notes. Claims and task updates for different milestones can no longer conflict
  - `workspace/TASKS.md` deleted (tasks moved into the milestone files); `workspace/MILESTONES.md` is now a static overview (index, dependencies, deferred, open questions); changelog table dropped (git history covers it)
  - `workspace/WORKFLOW.md`: roles (owners self-serve; any non-owner reviews and merges; project lead only releases `develop` → `main`); "How we avoid merge conflicts" rules (own files only, sync same day, alphabetical inserts in registry files, one migration head, fast reviews); daily sync check; package-lock and multiple-heads fixes
  - `frontend/src/i18n/en.json` split into `frontend/src/i18n/en/<namespace>.json` (24 files, auto-loaded via `import.meta.glob` in `i18n/index.js`)
  - `CLAUDE.md`, `README.md`, `docs/PROJECT_STRUCTURE.md`: updated to match
- **Database:** none
- **Commits:**
  - `docs(workflow): self-serve milestones, per-milestone files, conflict-avoidance rules`
- **How to test:** four checks in WORKFLOW.md pass; `grep -H -e "Owners:" -e "Status:" workspace/milestones/*.md` lists every milestone
- **Notes / follow-ups:** none

### 2026-09-24 | Branch cleanup and merge process
- **Milestone:** none (repo maintenance, branch `fix/branch-cleanup`, PR into `develop`)
- **Status:** Done
- **What changed:**
  - Removed `.github/workflows/ci.yml` again: a squash merge (PR #10) had silently re-added it
  - Merged `main` into the branch with no file changes (history sync), so the release PR `develop` → `main` merges without conflicts; `main` had only an old front end snapshot from PR #7
  - To do after merge: delete the finished `m1-foundation` branch (merged four times via PRs #7–#10)
  - `workspace/WORKFLOW.md`: rewritten as a fixed step-by-step process: 7 golden rules (merge commits only, two PR directions, one PR per branch, reviewer merges, no "Update branch", no force-push), local sync from `develop`, review/merge steps, troubleshooting table, repo settings (merge commits only)
  - `CLAUDE.md`: Git rules updated to match
- **Database:** none
- **Commits:**
  - `chore: remove ci.yml re-added by a squash merge (no CI in this project)`
  - `Merge main into develop: history sync only, develop's files unchanged`
  - `docs(workflow): merge-commit-only process to stop merge conflicts loops`
- **How to test:** after both PRs merge, `git diff origin/main origin/develop` is empty
- **Notes / follow-ups:** Repo admin must apply the new Pull Request settings (see WORKFLOW.md → Repo settings)

### 2026-09-24 | Remove GitHub Actions; local checks instead
- **Milestone:** M1 (branch m1-foundation)
- **Status:** Done
- **What changed:**
  - Deleted `.github/workflows/ci.yml` (team decision: no CI)
  - `workspace/WORKFLOW.md`: new "Checks (there is no CI)" section (one-time setup incl. `pre-commit install`, four pre-PR checks); reviewer re-runs the checks; only the reviewer merges, after approving; removed the CI branch-protection step; checklist updated
  - `CLAUDE.md`, `README.md`, `docs/PROJECT_STRUCTURE.md`, `workspace/MILESTONES.md`, `workspace/TASKS.md` (T-007 dropped), `backend/pyproject.toml` comment: CI references removed
  - Fixed a corrupted `.venv\Scripts\activate` line in README and WORKFLOW (an invisible control character had replaced `\a`)
- **Database:** none
- **Commits:**
  - `chore: remove GitHub Actions CI; document local checks [M1]`
- **How to test:** follow WORKFLOW.md → Checks; all four pass
- **Notes / follow-ups:** none

### 2026-09-24 | M1 fix: CI pytest import error
- **Milestone:** M1 (branch m1-foundation)
- **Status:** Done
- **What changed:**
  - `backend/pyproject.toml`: `pythonpath = ["."]` for pytest. CI runs plain `pytest`, which doesn't add the working directory to the import path (`python -m pytest` does, which is why it passed locally).
- **Database:** none
- **Commits:**
  - `fix(ci): let pytest import the app package [T-006]`
- **How to test:** `cd backend && pytest` (plain command, as CI runs it): 39 passed
- **Notes / follow-ups:** none

### 2026-09-24 | Frontend: Tailwind v4 + 4-item dropdowns (M1/M4)
- **Milestone:** M1 + M4 frontend (branch m1-foundation)
- **Status:** Done
- **What changed:**
  - `frontend/src/index.css`: new single stylesheet. Tailwind v4 import; `@theme` removes the default palette and all shadows and defines only the 8 brand colours, Instrument Sans, radii and page width; base styles; `page` and `dropdown-list` utilities
  - Deleted `src/styles/` (tokens.css, global.css) and all 22 `*.module.css` files; every component and page now styles with Tailwind classes
  - `src/components/forms/Select.jsx` (new): accessible custom dropdown (WAI-ARIA select-only combobox: arrows, Home/End, Enter/Space, Escape, type-ahead) that always shows 4 options and scrolls beyond; `SelectField` now wraps it; `MoreFilters` uses it; no native `<select>` left
  - `SelectField` `onChange` now receives the value (not an event); callers updated (gender, province, district, qualification, search filters)
  - `src/utils/cx.js` (new): class-name joiner
  - `DocumentUpload`: new `divider` prop (used by the eligibility check list)
  - Tests: `Select.test.jsx` (5 tests); search test updated for the custom dropdown; jsdom `scrollIntoView` stub in `setupTests.js` (26 tests total)
  - `vite.config.js` (Tailwind plugin), `.prettierrc.json` (Tailwind class sorting)
  - `CLAUDE.md`, `docs/PROJECT_STRUCTURE.md`: Tailwind + single-stylesheet rules, dropdown rule, no conflicting utilities
  - `workspace/TASKS.md`, `workspace/MILESTONES.md`: T-008 moved out of M1 to the Open questions table
- **Database:** none
- **Dependencies:** dev: `tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3, `prettier-plugin-tailwindcss` 0.8.1 (requested move to Tailwind v4)
- **Commits:**
  - `refactor(frontend): Tailwind v4 single stylesheet and 4-item Select dropdown [M1]`
- **How to test:** `cd frontend && npm install && npm run dev`; open any dropdown (hero filters, sort/type/qualification/deadline, profile gender/province/district/qualification) and check that 4 options show and the rest scroll. `npm test`, `npm run lint`, `npm run build` pass.
- **Notes / follow-ups:** Screenshots caught two regressions from utility conflicts (timeline last marker offset, current step not bold), both fixed; rule added to CLAUDE.md.

### 2026-09-24 | M1 backend: Flask app, database, data model, seed, tests, CI (T-002, T-003, T-005–T-007, T-010–T-018)
- **Milestone:** M1 (branch m1-foundation)
- **Status:** Done, except T-008 (open questions, needs stakeholders)
- **What changed:**
  - `backend/app/__init__.py`, `config.py`, `extensions.py`, `commands.py`, `wsgi.py`: app factory, env-based config (fails fast if secrets/DB URL missing), SQLAlchemy naming convention, `flask seed`
  - `backend/app/controllers/health_controller.py`, `controllers/errors.py`, `utils/errors.py`: `GET /api/health`; every error returned as `{code, message}` (matches frontend `errors.<code>`)
  - `backend/app/models/`: `reference.py` (departments, provinces, districts, qualification levels, document types), `staff_user.py`, `candidate.py` (account + permanent profile), `profile_records.py` (education, experience, registrations, publications, references), `document.py`, `job.py` (job, requirement, quotas, required documents, domicile provinces), `approval.py`, `application.py` (application, snapshot, status events), `audit_log.py`, `enums.py`, `base.py`
  - Domain rules as DB constraints: unique CNIC + format check, one profile per account, one application per profile per job, one current document per type (partial unique index), BPS 1–22, closing after opening, valid age range, statuses limited to §4.9 (no "withdrawn")
  - `backend/app/services/`: `health_service.py`, `audit_service.py` (T-017 helper), `storage_service.py` (T-013: type by file signature, 2 MB limit, random names), `reference_seed_service.py` (T-018, idempotent upsert, same codes as frontend mocks)
  - `backend/migrations/`: Alembic setup; `49eef685e076_t_010_initial_data_model.py` (hand-added `application_no_seq`); `env.py` deprecated call removed
  - `backend/tests/`: conftest rebuilds the test DB from migrations each run; 39 tests across models, services, controllers
  - `docker-compose.yml`, `backend/scripts/create_test_db.sql`: PostgreSQL 16 on host port 5433 + test database
  - `backend/requirements.txt`, `requirements-dev.txt`, `pyproject.toml`, `.env.example`
  - `.pre-commit-config.yaml` (ruff, black, eslint, prettier), `.github/workflows/ci.yml` (backend + frontend jobs)
  - `README.md` (database, backend, hooks setup), `docs/PROJECT_STRUCTURE.md` (backend items done; migration gotchas), `workspace/TASKS.md`
- **Database:** migration `49eef685e076` (all M1 tables); `flask db check` reports no drift; downgrade/upgrade round trip tested
- **Dependencies:** Flask, Flask-SQLAlchemy, SQLAlchemy, Flask-Migrate/Alembic, flask-marshmallow, marshmallow(-sqlalchemy), Flask-JWT-Extended, psycopg 3, python-dotenv; dev: pytest, ruff, black, pre-commit. All in CLAUDE.md's stack.
- **Env vars:** `DATABASE_URL`, `TEST_DATABASE_URL`, `SECRET_KEY`, `JWT_SECRET_KEY`, `UPLOAD_FOLDER`, `FLASK_APP`, `FLASK_ENV`
- **Commits:**
  - `feat(backend): Flask app, PostgreSQL data model, seed, tests and CI [T-002]`
- **How to test:** `docker compose up -d db`, then in `backend/`: `flask db upgrade && flask seed && pytest` (39 passed); `flask run` → `/api/health` returns `{"status": "ok", "database": true}`, also via the Vite proxy at `localhost:5173/api/health`
- **Notes / follow-ups:**
  - Found and fixed: a CHECK that evaluates to NULL passes in SQL; the experience-dates rule now requires `end_date IS NOT NULL` for past jobs
  - District list is a starter set; load the full official list before launch
  - CI workflow runs for the first time on the next push/PR; check the Actions tab

### 2026-09-24 | Frontend: scaffold, brand theme and candidate pages (T-004, T-005, T-009, T-025, T-045–T-048, T-066–T-068)
- **Milestone:** M1 + M4 frontend (branch m1-foundation)
- **Status:** Done, except T-005 (Python half) and T-068 (admin status UI)
- **What changed:**
  - `frontend/package.json`, `package-lock.json`, `vite.config.js`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.env.example`, `index.html`: Vite + React app, dev proxy `/api` → Flask :5000, Vitest config
  - `frontend/src/styles/`: `tokens.css` (8 brand colours, Instrument Sans, spacing) and `global.css`, per `docs/pakistan-railways-brand-guidelines.md`
  - `frontend/src/api/`: Axios client + `jobs`, `reference`, `auth`, `profile`, `documents`, `applications` modules; `api/mocks/` in-browser mock backend (localStorage) with sample jobs and a mock eligibility check
  - `frontend/src/components/`: common (Button, Badge, StatusBadge, Alert, PageState, Icon, Logo placeholder, DepartmentMark, JobSummary, ApplySteps, ProgressBar, ErrorBoundary), forms (TextField, SelectField, CheckboxField, CnicInput, DocumentUpload, OtpStep), layout (AppLayout, SiteHeader, SiteFooter, AuthCard)
  - `frontend/src/pages/public/`: JobSearchPage (landing + search), JobDetailsPage, SignupPage, LoginPage, NotFoundPage
  - `frontend/src/pages/candidate/`: ProfilePage (8 sections), ApplicationCheckPage, ApplicationReviewPage, MyApplicationsPage, ApplicationDetailPage (status timeline)
  - `frontend/src/context/`, `hooks/`, `routes/`, `i18n/` (en.json + `t()`), `utils/`
  - Tests: validators, format, i18n, mock eligibility, JobSearchPage (21 tests)
  - Job search page revisions: green hero with a search card (keyword + BPS grade, department, location), secondary filters beside the result count, vacancies on every row, Ember Red edge on jobs closing within 7 days, department badges removed from rows; `SearchFilters.jsx` replaced by `SearchCard.jsx` + `MoreFilters.jsx`, `filterKeys.js` renamed `filters.js`
  - Removed `.gitkeep` from frontend folders that now have files
  - `docs/pakistan-railways-brand-guidelines.md`: added (from Ali)
  - `docs/PROJECT_STRUCTURE.md`, `CLAUDE.md`, `README.md`: frontend layout, brand/mock-mode rules, setup steps
  - `workspace/TASKS.md`: T-004, T-009, T-025, T-045–T-048, T-066, T-067 done; T-005, T-068 in progress
- **Database:** none
- **Dependencies:** react, react-dom, react-router-dom, axios (stack in CLAUDE.md); dev: vite, @vitejs/plugin-react, eslint (+ @eslint/js, react-hooks, react-refresh, globals), prettier, vitest, jsdom, @testing-library/react, jest-dom, user-event. The Vite template's `oxlint` was replaced with ESLint to match CLAUDE.md.
- **Env vars:** `VITE_USE_MOCKS` (default true)
- **Commits:**
  - `feat(frontend): React scaffold, brand theme and candidate pages on mock API [T-004]`
- **How to test:** `cd frontend && npm install && npm run dev`; sign up with any valid CNIC/mobile, OTP 123456. `npm test`, `npm run lint`, `npm run build` all pass.
- **Notes / follow-ups:**
  - Logo is a text placeholder (`components/common/Logo.jsx`); swap in the official lockup when files are available.
  - Signup CAPTCHA is a placeholder checkbox until T-020.
  - Fee payment (T-063, proposed) is shown as a note only.
  - Backend owners: the endpoint paths and JSON shapes the UI expects are in `src/api/*.js` and `src/api/mocks/`.

### 2026-09-24 | M0 closed
- **Milestone:** M0 (merged to `develop` and `main` via PRs #2–#6)
- **Status:** Done
- **What changed:**
  - `workspace/MILESTONES.md`: M0 set to Done; M1 renamed "App setup and data model" (branch `m1-foundation`) and given the setup "done when" criteria
  - `workspace/TASKS.md`: unfinished setup tasks T-002 to T-009 moved from M0 to M1
- **Database:** none
- **Commits:**
  - `chore(milestones): close M0, move setup tasks to M1 [M0]`
- **How to test:** n/a
- **Notes / follow-ups:** M1 is ready to claim.

### 2026-09-24 | M0 Workflow and scope re-plan
- **Milestone:** M0 (branch m0-project-setup)
- **Status:** Done
- **What changed:**
  - `docs/railway-job-portal-master-flow.md`: removed corrigendum (§3.4, data model row, diagram node); published jobs are final; added current-scope note (up to §4.9)
  - `workspace/MILESTONES.md`: rewritten as a claim board of phases M0–M6 with owners, branches, dependencies; §5/§6 moved to Deferred; M0 claimed by Ali
  - `workspace/TASKS.md`: tasks re-planned per phase, split into Backend / Frontend / Shared; corrigendum and screening tasks removed; M1–M6 renumbered
  - `workspace/WORKFLOW.md`: rewritten for milestone claiming, `develop` integration branch, squash into `develop`, merge-commit + tag into `main`, repo settings
  - `CLAUDE.md`: new mandatory steps, agent rules, scope, domain rule 9 (no corrigendum), Git branch rules; team table without branch prefixes
  - `docs/PROJECT_STRUCTURE.md`: dropped `corrigendum` from domain vocabulary
  - `workspace/logs/*.md`: template uses Milestone instead of Branch; fixed WORKFLOW anchor link
  - Removed edit/withdraw application: master flow §4.8, diagram node C23 and open question 4 removed; MILESTONES.md records question 4 as answered "No"; T-066 (edit/withdraw) dropped and M6 frontend tasks renumbered T-066–T-068; CLAUDE.md domain rule 3 now forbids edit/withdraw endpoints
- **Database:** none
- **Commits:**
  - `chore(milestones): re-plan phases and claim M0 [M0]` (on `develop`)
  - `docs(workflow): milestone-based workflow with develop branch [M0]`
- **How to test:** read WORKFLOW.md end to end; check MILESTONES.md dependencies match TASKS.md
- **Notes / follow-ups:** Repo admin must apply the GitHub settings in WORKFLOW.md (default branch `develop`, protection rules). Open question: how to handle a mistake in a published job now that there's no corrigendum.

### 2026-09-24 | T-001 Repo structure
- **Status:** Done (pending review)
- **Branch:** ali/T-001-repo-structure
- **What changed:**
  - `backend/app/{models,schemas,controllers,controllers/admin,services,scheduler,utils}/__init__.py`: MVC package skeleton; each docstring says what belongs in that layer
  - `backend/tests/{models,services,controllers}/`, `backend/scripts/`: empty folders (`.gitkeep`)
  - `frontend/public/`, `frontend/src/{api,pages/{public,candidate,admin},components/{common,forms,layout},hooks,context,routes,i18n,utils,styles,assets}/`: empty folders (`.gitkeep`)
  - `docs/PROJECT_STRUCTURE.md`: full layout, "where does it go?" table, layer import rules, naming, repo hygiene rules
  - `CLAUDE.md`: real repo layout; new §7 "Keeping the repo clean" for agents
  - `workspace/WORKFLOW.md`: structure/hygiene added to the work step, review step and checklist
  - `README.md`: project overview and links (setup steps come with T-002/T-003/T-004)
  - `.gitattributes`: LF line endings for everyone (fixes CRLF warnings on Windows)
  - `.editorconfig`: shared indentation/charset settings
  - `workspace/TASKS.md`: reformatted for readability: 4 aligned columns (ID, Task, Owner, Status), details moved to per-milestone notes; branch/dates now live in work logs. `WORKFLOW.md`, `CLAUDE.md`, `MILESTONES.md` updated to match
- **Database:** none
- **Commits:**
  - `chore(repo): add MVC folder structure and repo hygiene guide [T-001]`
- **How to test:** `git ls-files backend frontend` shows the skeleton; open `docs/PROJECT_STRUCTURE.md`
- **Notes / follow-ups:** No app code yet. Flask factory/config is T-002, docker-compose + migrations T-003, Vite scaffold T-004 (Vite will add `index.html`, `package.json`, `src/main.jsx`; delete `.gitkeep` files as folders get real files).

