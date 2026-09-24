# Work Log: Malaika

Newest entries at the top. Template and rules: [../WORKFLOW.md](../WORKFLOW.md#step-4-work-and-log).

<!-- Copy this block for each entry:

### YYYY-MM-DD | T-### Task title
- **Status:** Done / Partial / In progress
- **Milestone:** M# (branch m#-milestone-name)
- **What changed:**
  - `path/to/file`: what and why
- **Database:** migrations, or "none"
- **Commits:**
  - `type(scope): summary [T-###]`
- **How to test:**
- **Notes / follow-ups:**

-->

### 2026-09-24 | Candidate Portal UI: FAQ Section, Header/Footer Redesign & Job Closing Highlight (T-045, T-046, T-047, T-048)
- **Milestone:** M4 Candidate portal (branch m4-candidate-portal)
- **Status:** In progress (co-owner with Ali)
- **What changed:**
  - `workspace/milestones/M4-candidate-portal.md`: claimed co-ownership of Milestone M4 (Candidate portal)
  - `CLAUDE.md`: updated Section 4 Tech Stack table to full 24-layer overall architecture definition
  - `frontend/index.html`: added Tailwind CSS CDN & Instrument Sans Google font
  - `frontend/package.json`: added `react-icons` dependency
  - `frontend/public/`: added `pakrail-logo-vertical.png` and `pakrail-logo-horizontal.png` official logo assets
  - `frontend/src/index.css`: registered `@utility faq-grid` and `@utility faq-card` for single-stylesheet compliance
  - `frontend/src/components/common/Logo.jsx`: updated to render horizontal logo image
  - `frontend/src/components/layout/FaqSection.jsx`: created FAQ section component with 2-column grid, Instrument Sans typography, and closed-by-default state; refactored to use `index.css` utilities
  - `frontend/src/components/layout/FaqSection.module.css`: removed to enforce single-stylesheet rule
  - `frontend/src/components/layout/AppLayout.jsx`: embedded `FaqSection` above `SiteFooter`
  - `frontend/src/components/layout/SiteHeader.jsx`: top header bar set to Ember Red (`#A63A2C`), announcement text centered, removed demo badge
  - `frontend/src/components/layout/SiteFooter.jsx`: redesigned footer with vertical logo, bottom-to-top fill hover effect for social icons with colorful default brand borders, removed unnecessary link groups/app banners, white policy links
  - `frontend/src/pages/public/JobSearchPage/JobListItem.jsx`: updated jobs closing in 1 week or less with soft red row background highlight (`#f8d7da`), removed left vertical bar
  - `frontend/src/setupTests.js`: added `scrollIntoView` polyfill to fix Vitest DOM test suite
- **Database:** none
- **Dependencies:** `react-icons`
- **Commits:**
  - `docs(claude): update tech stack table in CLAUDE.md`
  - `feat(ui): add FAQ section, brand header/footer & closing date row highlight [T-045]`
  - `refactor(frontend): move FAQ section styles to index.css [T-045]`
- **How to test:** `npm test` in `frontend` (21 tests pass); launch `npm run dev` and view `http://localhost:5173/`
- **Notes / follow-ups:** UI enhancements aligned with brand guidelines and single-stylesheet rule (`index.css`).
