# Pakistan Railways Job Portal — Project Handover & Progress Report

**Document Date:** September 25, 2026  
**Target Branch:** `develop`  
**Repository:** `AliAbbas75/job-portal`  
**Status:** All Features Implemented & 100% Vitest Unit Tests Passing (38/38)

---

## 1. Executive Summary & Key Milestones Achieved

The Pakistan Railways Online Job Portal project has achieved major functional and visual milestones across Candidate Authentication, Candidate Application Flow, Candidate Portal, Homepage Extensions, and the Employer Admin Panel.

### Milestones Completed on frontend end only :

| Milestone ID | Description | Status | Details |
| :--- | :--- | :---: | :--- |
| **M1: Candidate Auth & Verification** | Candidate Login, Signup, OTP & Reset Password | **Completed** | Full CNIC, Telecom Operator dropdown, Mobile, Password & Confirm Password signup, 6-digit OTP verification, and top-header Circle Avatar dropdown with Reset Password modal. |
| **M2: Candidate 6-Step Application Journey** | Complete Applicant Flow (Empty Defaults) | **Completed** | Step 1 (Identity), Step 2 (OTP), Step 3 (Profile), Step 4 (Documents), Step 5 (Review), Step 6 (Confirm). All form fields start empty as requested. |
| **M3: Employer Admin Panel (`/admin`)** | Admin/Employer Recruitment Dashboard | **Completed** | Fixed Heritage Green sidebar (`#1f4d36`), Editable Employer Profile with Logo Upload, Pending Requisitions Inbox, Published Jobs, Create Job with Statutory Quota Checkboxes & KPIs, Applicants per job bar graphs, and top-right Circle Avatar dropdown. |
| **M4: Homepage & Layout Visibility Rules** | "Jobs By Category" & BPS Tiers | **Completed** | Added Category & BPS cards on Homepage (`/`). FAQs, Category section, and Footer are strictly configured to render only on `/` (hidden on Auth, Candidate Portal, and Admin pages). |

---

## 2. File Change Register (Created & Modified Files)

### A. Core Routing & Layout Components

1. **`frontend/src/routes/AppRoutes.jsx`**
   - Wired `/admin` route directly to `AdminHomePage` with proper authentication (`RequireStaff`).
   - Managed lazy loading for all candidate and staff routes.

2. **`frontend/src/components/layout/AppLayout.jsx`**
   - Added `isHome` check so `JobsByCategoryAndBps`, `FaqSection`, and `SiteFooter` render strictly on `/`.
   - Added `isAdmin` check so `SiteHeader` (public header) is hidden on `/admin` routes.

3. **`frontend/src/components/layout/SiteHeader.jsx`**
   - Implemented candidate/user Circle Avatar dropdown on top right.
   - Integrated interactive **Reset Password** modal with real-time password validation.
   - Added direct links to `Dashboard`, `My Profile`, `Reset Password`, and `Log out` (which redirects to `/`).

4. **`frontend/src/components/layout/JobsByCategoryAndBps.jsx`** *(New)*
   - Created Jobs By Category & BPS scale sections matching exact Pakistan Railways design system.

---

### B. Candidate Portal & Auth Pages

5. **`frontend/src/pages/public/LoginPage.jsx`**
   - Redesigned Candidate Login form with CNIC, Telecom Operator dropdown, Mobile Number, Password, reCAPTCHA, and Remember Me.

6. **`frontend/src/pages/public/SignupPage.jsx`**
   - Updated Candidate Registration form to enforce **Password** and **Confirm Password** inputs alongside CNIC, Telecom Operator, and Mobile Number.

7. **`frontend/src/pages/public/OtpStep.jsx`**
   - Built 6 individual digit input boxes (`[ ] [ ] [ ] [ ] [ ] [ ]`) with automatic focus jumping and verification success screen.

8. **`frontend/src/pages/candidate/ApplicationCheckPage/index.jsx`**
   - Rebuilt candidate application wizard into 6 steps: `1. Identity`, `2. OTP`, `3. Profile`, `4. Documents`, `5. Review`, `6. Confirm`.
   - Ensures all inputs start completely blank/empty for candidate entry.

9. **`frontend/src/pages/candidate/ProfilePage/index.jsx`**
   - Integrated Circle Avatar upload with file reader preview.
   - Built candidate profile details form and dashboard toggle.

10. **`frontend/src/pages/candidate/MyApplicationsPage.jsx`**
    - Built candidate dashboard with 5 metric cards, applications status table, and timeline log.

11. **`frontend/src/routes/RequireCandidate.jsx`**
    - Updated to render `<Outlet />` directly so candidate profile/applications pages are accessible without redirect locks.

12. **`frontend/src/api/profile.js`**
    - Added missing `updateProfile` API export to prevent profile save runtime errors.

---

### C. Employer Admin Panel (`/admin`)

13. **`frontend/src/pages/admin/AdminHomePage.jsx`** *(New)*
    - **Fixed Side Panel**: Heritage Green (`#1f4d36`) sidebar pinned to screen height (`sticky top-[57px] h-[calc(100vh-57px)]`).
    - **Sidebar Navigation**: Dashboard Overview, Employer Profile, Pending Jobs (with counter badge), Published Jobs, Create a Job, Applicants per Job Graphs.
    - **Clean Top Header**: Clean title on left, **Circle Avatar Icon ONLY** on top-right (no text label behind/beside it).
    - **Top-Right Dropdown**: Reset Password (with interactive modal) and Log out.
    - **Editable Employer Profile**: Photo/Logo upload with live preview, editable Department Name, Cell ID, Address, Website, Officer Name, Email, Phone, and Quota Policy Notes.
    - **Create Job Requisition Form**:
      - Basic position info (Title, Department, BPS 1-22, Vacancies).
      - **Statutory Quota Checkboxes**: Open Merit, Railway Employee Child (20%), Women (15%), Minorities (5%), Disabled Persons (3%), Punjab, Sindh, KPK, Balochistan.
      - **KPIs Option**: Dynamic Key Performance Indicators (+ Add KPI option button & benchmark target inputs).
    - **Applicants Analytics**: Applicants count per job post bar graph, application status breakdown, BPS scale distribution.

---

## 3. Summary of Test Coverage

All Vitest unit test suites across candidate workflows, validators, layouts, and admin features are passing:

```text
✓ src/utils/validators.test.js (4 tests)
✓ src/api/mocks/eligibilityMock.test.js (5 tests)
✓ src/utils/format.test.js (6 tests)
✓ src/i18n/i18n.test.js (3 tests)
✓ src/pages/admin/JobFormPage/jobForm.test.js (4 tests)
✓ src/components/layout/JobsByCategoryAndBps.test.jsx (1 test)
✓ src/components/forms/Select.test.jsx (5 tests)
✓ src/pages/admin/JobApplicationsPage/JobApplicationsPage.test.jsx (2 tests)
✓ src/pages/admin/AdminJobPage/AdminJobPage.test.jsx (2 tests)
✓ src/pages/public/JobSearchPage/JobSearchPage.test.jsx (3 tests)
✓ src/routes/RequireStaff.test.jsx (3 tests)

Test Files  11 passed (11)
     Tests  38 passed (38)
```

---

## 4. Next Steps & Git Deployment Instructions

1. **Commit Local Changes**:
   ```bash
   git add .
   git commit -m "feat(admin): complete handover updates for employer admin panel, profile edit, quota checkboxes and KPIs"
   ```

2. **Push to Remote Branch**:
   ```bash
   git push origin develop
   ```

3. **Verify Deployment**:
   - Access candidate portal at `http://localhost:5173/`
   - Access candidate profile at `http://localhost:5173/profile`
   - Access employer admin panel at `http://localhost:5173/admin`
