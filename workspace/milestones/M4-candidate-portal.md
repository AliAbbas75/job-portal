# M4: Candidate portal: jobs and profile

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** Ali, Malaika
- **Status:** In progress
- **Depends on:** M1

## Scope

Master flow §4.1, 4.2, 4.4. Job search, job details, permanent profile, document vault.

## Done when

- Candidates can search and filter jobs and view job details on a phone-width screen.
- Every profile section can be filled and edited; documents uploaded once can be reused.
- Age is calculated from DOB, never entered.

## Tasks

**Backend**

| ID    | Task                                                                          | Owner | Status |
|-------|-------------------------------------------------------------------------------|-------|--------|
| T-040 | Job search API with filters + pagination                                      | Ali   | DONE   |
| T-041 | Job details API                                                               | Ali   | DONE   |
| T-042 | Profile section APIs + edit history                                           | Ali   | DONE   |
| T-043 | Document vault API (upload once, reuse)                                       | Ali   | DONE   |
| T-044 | Age calculation utility + tests                                               | Ali   | DONE   |
| T-147 | Job category (trade) + counts by category and BPS                             | Ali   | DONE   |
| T-148 | Job detail fields: gender, criteria, ad file, quota %                         | -     | TODO   |
| T-149 | Profile: trade certificate, quota + age-relaxation claims, new document types | Ali   | DONE   |

**Frontend**

| ID    | Task                                                 | Owner   | Status |
|-------|------------------------------------------------------|---------|--------|
| T-045 | Landing page, latest jobs, search UI                 | Ali     | DONE   |
| T-046 | Job details page                                     | Ali     | DONE   |
| T-047 | Profile section forms (mobile-first)                 | Ali     | DONE   |
| T-048 | Document vault UI                                    | Ali     | DONE   |
| T-049 | FAQ section (accordion)                              | Malaika | DONE   |
| T-140 | News bar + footer (social links, contact)            | Malaika | DONE   |
| T-141 | Header + main nav to match Figma                     | Ali     | DONE   |
| T-142 | Home page sections to match Figma                    | Ali     | DONE   |
| T-143 | Available Jobs page (`/jobs`, table)                 | Ali     | DONE   |
| T-144 | Job details to match Figma                           | Ali     | DONE   |
| T-145 | My Profile page to match Figma                       | Malaika, Ali| DONE   |
| T-146 | Bring FAQ, footer, news bar in line with conventions | Ali     | DONE   |

## Notes

- T-040: filters are BPS, department, location, education, employment type, deadline.
- T-044: age from DOB as of closing date or advertisement cutoff date.
- T-048: client-side compression before upload.
- T-045 to T-048: UI built early on mock data. T-040 to T-043 must match the shapes in `src/api/mocks/`.
- Backend endpoints: `GET /api/jobs`, `GET /api/jobs/stats`, `GET /api/jobs/<id>`, `GET /api/reference`, `GET|PUT /api/profile[/<section>]`, `POST|PUT|DELETE /api/profile/<education|experience>[/<id>]`, `GET|POST /api/documents`, `DELETE /api/documents/<id>`. Shapes match the frontend mocks.
- Profile and document endpoints use the candidate login token from M2 (done), so every candidate page works against the real API.
- Profile edits are recorded in the audit log (edit history: section + field names, never values). Replacing or removing a document archives it, so submitted applications keep their files.

### Figma candidate journey (T-049, T-140 to T-149)

Design: [docs/pakrail-candidate-journey.html](../../docs/pakrail-candidate-journey.html) (each `<section data-screen>` is one Figma frame; node links in the file). M4 was reopened for these; the original T-040 to T-048 stay done.

- **Already built:** T-049 and T-140 (Malaika, in `components/layout/FaqSection.jsx` and `SiteFooter.jsx`, merged with T-045). Search, filters and the job list (T-045), job details (T-046), profile (T-047) and documents (T-048) also exist; T-141 to T-145 restyle and extend them, not rebuild.
- T-141 (`home`, every screen): logo lockup with "Public Recruitment Services"; right side Login / Register when signed out, Dashboard (pumpkin) / Log out when signed in; main nav: Home, Available Jobs (open-job count), Jobs by Category, How it Works, FAQs, Contact Us. The "ENG" switch waits for Urdu (deferred).
- T-142 (`home`): hero with "Explore Jobs" and an image carousel; How it Works (Register → Complete Profile → Apply → Shortlisted → Status → Employed); Recent Available Jobs (same table as T-143); Jobs by Category and Jobs by BPS cards ("N jobs available →", link to filtered `/jobs`); FAQ with 3 tabs (General, Applications & Dashboard, Account access).
- T-143 (`jobs`): table with Job ID (`JD-1001`), title, scale, department chip, location, positions, qualification, last date, Apply Now; filter row (Scale, Department, Location, Education) + Clear All; results-per-page `Select` + numbered pagination. Reuse T-045's filters and `searchJobs`.
- T-144 (`job`): chips (BPS, department), "View/Download Advertisement", facts grid (Job ID, vacancies, age limit, location, domicile, gender), description, eligibility criteria, qualifications, quota list with percentages, sticky sidebar (vacancies, deadline, live countdown, Apply, Share).
- T-145 (`profile`): "Dashboard | My Profile" tabs (dashboard is M6 T-069); CNIC + mobile read-only; personal details (age calculated, read-only); education and quota (highest education, trade certificate, quota, age relaxation, one claim only); Save Profile. Keep the repeatable education/experience sections from T-047 below it.
- T-146: `FaqSection.jsx`, `SiteFooter.jsx` and the header news bar hard-code English text and use colours outside the brand palette (`bg-[#…]`, `gray-*`, a gradient). Move text to `i18n/en/`, use brand tokens only, and confirm `react-icons` is an approved dependency (log the reason) or replace it with `Icon`. The footer's "Latest Job Updates" email signup is notifications (deferred): hide it until then.
- T-147: a post category/trade reference list on `Job`, plus job counts per category and per BPS for the home cards (extend `GET /api/jobs/stats`). M3's job form must set it.
- T-148: `JobRequirement.gender`, free-text eligibility criteria (display only: the eligibility engine still uses structured fields), advertisement file, quota categories from the design (e.g. son of railway employee, ex-serviceman, orphans) with percentages. Migration. Blocked by open question 8.
- T-149: profile fields for trade certificate, quota claim and age-relaxation claim (one claim only; staff verify it); document types CNIC front, CNIC back, trade certificate, quota proof, age-relaxation proof. Migration + seed. Blocked by open questions 5 and 8.
- **Brand:** the design's blue buttons (`#2F7BF5`), Inter font and amber/green/red badge colours are not in the brand guide. Use brand tokens (`heritage` for primary actions, `ember` for rejected/closing, `gold`/`pumpkin` for accents) and Instrument Sans.

### Design work done (T-141 to T-144, T-146, T-147)

- T-141: red announcement bar, white header with the full-colour logo + "Public Recruitment Services", Login / Register or Dashboard / Log out, and a green nav bar (Home, Available jobs with the open-job count, Jobs by category, How it works, FAQs, Contact us). **Deviation:** the design's header is green, but the logo only exists in full colour, which the brand guide allows on white or cream, so the green moved to the nav bar. A white-out logo file would let the header go green. "Dashboard" opens My applications until the dashboard (M6 T-069) exists.
- T-142: `/` is now the landing page: hero with search, How it works, Recent jobs (table), Jobs by category and Jobs by BPS scale cards (linking to filtered `/jobs`), FAQ with 3 topic tabs. **Deviation:** no image carousel yet (no approved photos); the hero shows open jobs, vacancies and departments instead.
- T-143: `/jobs` (Available jobs): keyword search, filter row (scale, department, category, location, education) + Clear all, table with job ID (`JD-0101`), closing-soon rows tinted red, results per page (10/20/50) and numbered pages. Search moved here from the home page.
- T-144: job details with facts grid (job ID, vacancies, age limit, location, domicile, fee, opened, advertisement no.), and a sidebar with vacancies, full deadline date, live countdown, Apply and Share. The advertisement download and gender wait for T-148.
- T-146: FAQ, footer and news bar use `i18n/en/` text and brand colours only. FAQ answers were rewritten to match how the portal works (CNIC + SMS code, no password). The footer's newsletter form and the legal links (pages that don't exist) were removed. `react-icons` stays for the four social icons (only those are bundled).
- T-147: `job_categories` reference table (16 categories, `flask seed`), optional `jobs.category_code` (the job form requires it), `?category=` and `?scale=` filters, and `byCategory` / `byBps` counts in `GET /api/jobs/stats`. Migration `904db39c53bf`.
- Still open: T-145 (profile page restyle; most of its new content is T-149), T-148, T-149 (open questions 5 and 8).
- T-145, T-149 (done): My profile uses Malaika's one-page design (profile picture = the "photo" document, contact, personal details, education and quota, Save Profile), saved in one call `PUT /api/profile/summary`. New profile fields `highest_qualification_code`, `trade_certificate`, `quota_claim`, `age_relaxation_claim` (migration `69cb5fc8dd8f`); lists in `GET /api/reference` (`quotaClaims`, `ageRelaxations`, `tradeCertificates`); document types `trade_certificate`, `quota_proof`, `age_relaxation_proof`. The education, experience and document vault sections stay below the form (jobs with minimum marks or experience need them). Eligibility accepts the highest level when there is no full education record, unless the job sets minimum marks. The claim lists are provisional (open question 8); age relaxation is recorded but doesn't change the age check yet.
- Upload limit is now 5 MB (design; open question 5).
- `GET /api/documents/<id>/file` returns the candidate's own file (used for the profile picture).
