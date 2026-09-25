# Team Workflow

Two people, two branches, no pull requests.

## Who does what

| Person | Owns | Doesn't touch |
|--------|------|---------------|
| **Ali** (project lead) | Everything in `backend/`, the API layer `frontend/src/api/` (functions **and** mocks), connecting screens to the API, `workspace/` and `docs/`, releases to `main` | The look of Malaika's screens |
| **Malaika** | Screens: `frontend/src/pages/`, `components/`, `i18n/en/`, `index.css` | `backend/`, migrations |

Anum, Hadi and Umaima are listed in CLAUDE.md but not active on the project.

**How a screen goes from design to working:**
1. Malaika builds the screen with demo data: it calls functions in `frontend/src/api/`, which return mock data in mock mode. If the screen needs data that doesn't exist yet, she adds it to the mock in `src/api/mocks/` and writes one line under **Notes** in the milestone file ("profile needs `claims.quota`").
2. Ali adds or changes the backend endpoint so it returns exactly what the mock returns. Then the screen works with the real API with no screen changes.
3. If Ali has to change a screen to connect it (for example a Submit button that must call the API), he pulls first, keeps the layout and text, pushes the same day, and tells Malaika which files changed.

| Branch | What it is | Who pushes |
|--------|------------|------------|
| `develop` | Where all work happens. Default branch on GitHub. | Ali and Malaika |
| `main` | Released, working versions only. | Ali only |

Don't create other branches. Everything is committed on `develop` and pushed to `develop`.

## The rules

1. **Pull before you start, pull before you push:** `git pull --rebase`.
2. **Tell the other person before editing their files** (see the table above). Most of our conflicts came from both editing the same screen on the same day.
3. **Commit small, push often** (at least at the end of every working day). Small pushes mean small, easy conflicts.
4. **Run the checks before you push** (below). `develop` must always run.
5. **Log your work** in your own file in [logs/](logs/), in the same commit.
6. **Never force-push** (`git push --force`) and never rewrite history that's already on GitHub.
7. **Only Ali pushes to `main`** (Step 6).

## How we avoid merge conflicts

A conflict happens when both of you change the **same or neighbouring lines** of the same file.

1. **Stay in your own folders** (table above). The frontend's API layer and mocks are Ali's; screens are Malaika's.
2. **Shared "registry" files get one line per change, in alphabetical order:** `frontend/src/routes/AppRoutes.jsx` and `routes/paths.js` (both of you add routes). Insert your line where it belongs alphabetically, never at the end, and never reorder or reformat the other person's lines.
3. **Don't reformat what you didn't change.** Run Prettier on your own files only (`npx prettier --write <files>`), not on the whole `src/` folder.
4. **Only Ali writes migrations,** so there is always one migration head.
5. **Workspace files:** each person edits only their own log. Ali keeps the milestone files and MILESTONES.md up to date; Malaika adds lines under **Notes** only.

## Checks (there is no CI)

The project doesn't use GitHub Actions or any other CI. Quality is checked on your own machine.

**1. Automatic on every commit.** Set up once per clone:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Git Bash: source .venv/Scripts/activate · macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
cd ..
pre-commit install                # from the repo root
cd frontend && npm install
```
After that, every `git commit` runs Ruff, Black, ESLint and Prettier on the files you changed. If a hook fails or reformats a file, `git add` the files again and re-run the commit.

**2. Before you push.** All four must pass. Run them from the repo root, with `backend/.venv` activated and Docker Desktop running:
```bash
docker compose up -d db                        # 1. start the database
cd backend && pytest && cd ..                  # 2. backend tests (uses the test database)
cd frontend && npm test && npm run build && cd ..   # 3. frontend tests + production build
pre-commit run --all-files                     # 4. lint/format everything
```

Don't add GitHub Actions workflows or other CI to the repo.

---

## Step 1: Claim a milestone

Pick one from [MILESTONES.md](MILESTONES.md) whose dependencies are `Done`. Nobody's permission is needed. In its file in [milestones/](milestones/), fill in the **Claim** block:
```
- **Owners:** Hadi              (or "Hadi, Umaima" to share it)
- **Status:** In progress
```
Commit and push it straight away, so others see it:
```bash
git pull --rebase
git add workspace/milestones/M3-job-admin.md
git commit -m "chore(workspace): claim M3 (Hadi)"
git push
```
Already claimed by the other person? Agree who takes which part and add yourself as a co-owner.

## Step 2: Start each work session

```bash
git checkout develop
git pull --rebase
```
If someone added a migration: `cd backend && flask db upgrade`. If they added packages: `pip install -r requirements-dev.txt` or `npm install`.

## Step 3: Mark your tasks

In your milestone file's **Tasks** table, put your name and `IN PROGRESS` on the task you start, and `DONE` when it's finished. Commit this with your work.

## Step 4: Work and log

Commit with the task ID: `<type>(<scope>): <summary> [T-###]`, e.g. `feat(auth): add CNIC signup endpoint [T-020]`. Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Use `[fix]` if there's no task ID.

Add an entry at the top of your log (`workspace/logs/<you>.md`) in the same commit:
```markdown
### 2026-09-24 | T-042 Profile section APIs
- **Milestone:** M4
- **Status:** Done / Partial / In progress
- **What changed:**
  - `backend/app/services/profile_service.py`: section updates + edit history
- **Database:** migration `abc123` adds ..., or "none"
- **Commits:**
  - `feat(api): profile section endpoints [T-042]`
- **How to test:** ...
- **Notes / follow-ups:** ...
```
List every file you created or deleted, and why you added any new dependency.

## Step 5: Push

```bash
git add <your files>          # check `git status` first; only this task's files
git commit -m "feat(jobs): ... [T-031]"
# run the four checks
git pull --rebase             # put your commits on top of the other person's
git push
```

**If `git pull --rebase` reports a conflict:** open the files it lists, keep both people's changes (remove the `<<<<<<<`, `=======`, `>>>>>>>` lines), then:
```bash
git add <fixed files>
git rebase --continue
```
Run the checks again, then `git push`. If you get lost, `git rebase --abort` puts everything back as it was before the pull; then ask for help.

**If `git push` is rejected** ("fetch first" / "non-fast-forward"), someone pushed in the meantime: `git pull --rebase`, then `git push` again. Never use `--force`.

When all of a milestone's tasks are `DONE`, set its **Status** to `Done` and push.

## Step 6: Release to `main` (project lead only)

When a milestone is `Done` and `develop` passes the four checks:
```bash
git checkout develop && git pull --rebase
# run the four checks
git checkout main && git pull
git merge --no-ff develop -m "Release M2"
git tag m2
git push origin main --tags
git checkout develop
```
`main` never gets its own commits, so this merge never conflicts.

---

## Handing over or dropping a milestone

Edit the **Owners** in the Claim block (or set it back to `-` and **Status** to `Not started`), add a line under **Notes** in the milestone file saying what's done and what's left, commit and push.

## If something goes wrong

| Problem | Fix |
|---------|-----|
| Push rejected | `git pull --rebase`, then `git push`. Never `--force`. |
| Conflict during `git pull --rebase` | Fix the listed files, `git add` them, `git rebase --continue`. Lost? `git rebase --abort`. |
| Pre-commit hook fails | It printed what's wrong or reformatted the file: fix it, `git add` again, commit again. |
| Two migration heads | `flask db merge heads -m "merge migrations"`, `flask db upgrade`, `pytest`, commit. |
| Pushed something broken | Fix it and push a new commit. If you can't, `git revert <commit>` and push. Don't rewrite history. |
| You're on another branch | `git checkout develop`. If you committed there, `git checkout develop && git merge <that-branch>`, push, then `git branch -d <that-branch>`. |

## Repo settings (project lead, one-time)

On GitHub, **Settings**:
- **General → Default branch:** `develop`.
- **Branches / Rules:** no rule on `develop` that requires pull requests (both of you push to it directly). Delete any such rule.
- **`main`:** add a rule that blocks force pushes and deletion, with only the project lead allowed to push. Don't require pull requests.

## Using Claude Code

Claude Code sessions follow [CLAUDE.md](../CLAUDE.md), which points here. Tell Claude who you are and which milestone you're working on; it works on `develop`, marks the tasks, writes your log entry and commits and pushes only when you ask.

## Quick checklist

- [ ] Milestone claimed and pushed (Step 1)
- [ ] On `develop`, pulled (Step 2)
- [ ] Tasks marked `IN PROGRESS` / `DONE` in the milestone file
- [ ] Log entry added to my own log file
- [ ] Four checks pass
- [ ] `git pull --rebase`, then `git push`
