# M5: BPS-15+ resume tier

Claim, status and tasks for this milestone live **only in this file**, so it never conflicts with other milestones. How to claim and finish: [WORKFLOW.md](../WORKFLOW.md).

## Claim

- **Owners:** -
- **Status:** Not started
- **Branch:** `m5-resume-tier`
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
| T-050 | Resume upload + parser, prefill profile  | -     | TODO   |
| T-051 | Resume builder API (same profile schema) | -     | TODO   |
| T-052 | Resume PDF export                        | -     | TODO   |
| T-053 | BPS-15+ section APIs                     | -     | TODO   |

**Frontend**

| ID    | Task                                    | Owner | Status |
|-------|-----------------------------------------|-------|--------|
| T-054 | Resume upload + confirm parsed sections | -     | TODO   |
| T-055 | Resume builder UI                       | -     | TODO   |
| T-056 | BPS-15+ section forms                   | -     | TODO   |

## Notes

- T-050: store a confidence score per parsed field.
- T-054: highlight low-confidence fields; fall back to the builder if parsing fails.
- Tier boundary depends on open question 1.
