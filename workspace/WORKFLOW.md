# Team Workflow

Two branches, no pull requests:

| Branch | What it is | Who pushes |
|--------|------------|------------|
| `develop` | Where all work happens. Default branch on GitHub. | Everyone |
| `main` | Released, working versions only. | Project lead (Ali) only |

Don't create other branches. Everything you build is committed on `develop` and pushed to `develop`.

## The rules

1. **Pull before you start, pull before you push:** `git pull --rebase`.
2. **Claim before you build.** Put your name on a milestone (Step 1) so two people don't build the same thing.
3. **Commit small, push often** (at least at the end of every working day). Small pushes mean small, easy conflicts.
4. **Run the checks before you push** (below). `develop` must always run.
5. **Log your work** in your own file in [logs/](logs/), in the same commit.
6. **Never force-push** (`git push --force`) and never rewrite history that's already on GitHub.
7. **Never push to `main`** unless you're the project lead doing a release (Step 6).

## How we avoid merge conflicts

A conflict happens when two people change the **same or neighbouring lines** of the same file. The repo is laid out so that normal work rarely does that:

1. **Separate files per person and per milestone.** Each milestone's claim, status and tasks are in its own file in [milestones/](milestones/). Each person writes only their own log in [logs/](logs/). UI text is split per area in `frontend/src/i18n/en/<area>.json`. **Only edit your milestone file and your own log.**
2. **Shared "registry" files get one line per change, in alphabetical order.** Everyone adds to these:
   - `backend/app/models/__init__.py`
   - `backend/app/controllers/__init__.py`
   - `frontend/src/routes/AppRoutes.jsx` and `routes/paths.js`

   Insert your line where it belongs alphabetically, **never at the end** (that's where everyone else adds too), and never reorder or reformat other people's lines.
3. **Don't touch what your task doesn't need.** No renaming, moving or reformatting other files.
4. **Co-owners split by area,** e.g. one takes backend, one frontend.
5. **One migration head.** After pulling, run `flask db heads` in `backend/`. If it shows two heads (two people each added a migration), run `flask db merge heads -m "merge migrations"`, then `flask db upgrade` and `pytest`, and commit.

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
Already claimed? Ask the owners if you can join as a co-owner, or pick another milestone.

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
git pull --rebase             # put your commits on top of everyone else's
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
- **Branches / Rules:** no rule on `develop` that requires pull requests (everyone pushes to it directly). Delete any such rule.
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
