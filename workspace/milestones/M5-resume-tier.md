# M5: BPS-15+ resume tier

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** Ali
- **Status:** In progress
- **Depends on:** M4

## Scope

Master flow §4.5. Resume upload and parsing, builder, confirmation, higher-tier sections.

## Done when

- An uploaded resume prefills the structured profile; the candidate confirms each section.
- Parse failures land in the builder with whatever was extracted.
- The builder writes the same structured data and exports a PDF.
- Eligibility still uses only structured fields.

## Tasks

**Backend**

| ID    | Task                                     | Owner | Status |
|-------|------------------------------------------|-------|--------|
| T-050 | Resume upload + parser, prefill profile  | Ali   | DONE   |
| T-051 | Resume builder API (same profile schema) | Ali   | DONE   |
| T-052 | Resume PDF export                        | Ali   | DONE   |
| T-053 | BPS-15+ section APIs                     | Ali   | DONE   |

**Frontend**

| ID    | Task                                    | Owner | Status |
|-------|-----------------------------------------|-------|--------|
| T-054 | Resume upload + confirm parsed sections | Malaika| TODO   |
| T-055 | Resume builder UI                       | Malaika| TODO   |
| T-056 | BPS-15+ section forms                   | Malaika| TODO   |

## Notes

- T-050: store a confidence score per parsed field.
- T-054: highlight low-confidence fields; fall back to the builder if parsing fails.
- Tier boundary depends on open question 1.

### Backend and API layer done (T-050 to T-053)

- Tier: jobs carry `resumeTier` (true from BPS `RESUME_TIER_MIN_BPS`, default 15; open question 1). Eligibility is unchanged: it still uses structured fields only.
- T-053, BPS-15+ sections: `POST|PUT|DELETE /api/profile/<registrations|publications|references>[/<id>]` and `PUT /api/profile/statement` (`{ statementOfPurpose }`). The profile JSON now has `registrations`, `publications`, `references`, `statementOfPurpose`; submitted applications' snapshots include them.
- T-050, resume upload: `POST /api/resume` (PDF or Word, 5 MB) stores it as the "resume" document and returns suggested values per section with a confidence score (`sections`, `lowConfidence: 0.6`, `parsed`). **Nothing is saved to the profile**: the candidate confirms each section, which saves it through the normal profile endpoints. `parsed: false` (nothing readable, e.g. a scan) means: open the builder. Rule-based parser in `services/resume_parser_service.py`; no outside service.
- T-051, builder: the builder is the profile sections above plus the existing ones; no separate data. T-052: `GET /api/resume/pdf` returns the profile as a formatted resume PDF.
- Frontend API layer (Ali): `src/api/resume.js` (`uploadResume`, `downloadResumePdf`), `src/api/profile.js` (new sections via `saveProfileItem` / `updateProfileSection('statement', …)`), mocks for all of it. Mock mode: a file named `scan…` acts like an unreadable scan.
- New backend packages: `pypdf` (read PDFs), `python-docx` (read Word files), `fpdf2` (write the PDF).

### For Malaika (T-054 to T-056)

Screens to design, using the functions above (all work in mock mode):
- T-054, "Upload your resume" (for jobs with `resumeTier`): pick a PDF/Word file → `uploadResume` → show each section with the suggested values, highlight anything with `confidence < lowConfidence`, let the candidate edit, and a **Confirm** button per section that saves it (`updateProfile` / `updateProfileSection` / `saveProfileItem`). If `parsed` is false, go to the builder with whatever was found.
- T-055, resume builder: the same sections as forms (personal, contact, education, experience, skills, registrations, publications, references, statement of purpose) and a **Download PDF** button (`downloadResumePdf`; null in mock mode).
- T-056, the BPS-15+ section forms (registrations, publications, references, statement of purpose), which can live inside the builder and My profile.
