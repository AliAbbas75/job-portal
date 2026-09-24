# Work Log: Ali

Newest entries at the top. Template and rules: [../WORKFLOW.md](../WORKFLOW.md#step-4-log-the-work).

<!-- Copy this block for each entry:

### YYYY-MM-DD | T-### Task title
- **Status:** Done / Partial / In progress
- **Branch:** ali/T-###-short-desc
- **What changed:**
  - `path/to/file`: what and why
- **Database:** migrations, or "none"
- **Commits:**
  - `type(scope): summary [T-###]`
- **How to test:**
- **Notes / follow-ups:**

-->

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

