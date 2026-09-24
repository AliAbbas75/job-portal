# Team Workflow

Work is organised by **milestone** (a development phase). Anyone can claim a free milestone, build it on **one branch**, and open **one pull request** into `develop`. A teammate reviews and merges it, and the branch is deleted. The project lead then releases `develop` to `main`.

**Claim → Branch → Work + log → Sync + checks → PR into `develop` → Reviewer merges → Delete branch**

## Roles

| Role | Who | Does |
|---|---|---|
| **Milestone owner** | Anyone who claims a milestone (co-owners allowed) | Claims it, creates the branch, does the work, keeps the branch in sync, opens the PR. No one's permission needed. |
| **Reviewer** | Any teammate who is **not** an owner of that milestone | Runs the checks, reviews, approves and **merges** the PR. |
| **Project lead** | Ali | **Only** releases `develop` → `main` (and tags), keeps repo settings, and records stakeholder decisions in MILESTONES.md. Not needed for anything else. |

## The golden rules

Follow these and merging stays boring. Each rule exists because breaking it caused trouble in M0/M1.

1. **Merge method is always "Create a merge commit".** Never "Squash and merge" or "Rebase and merge". Squashing hides your commits from Git, so the next sync fights the same changes again and can silently undo deletions.
2. **Only two PR directions:** your branch → `develop`, and (project lead only) `develop` → `main`.
3. **One branch = one PR.** Once it's merged, the branch is finished and deleted. More work means a new branch from `develop`.
4. **The reviewer merges, never the author.**
5. **Sync on your machine, not with GitHub's "Update branch" button** (Step 5).
6. **Never force-push**, and never push to `main`.
7. **Pull when you start, push when you stop.**

## How we avoid merge conflicts

A conflict happens when two branches change the **same or neighbouring lines** of the same file. The repo is laid out so that normal work rarely does that:

1. **Separate files per person and per milestone.** Each milestone's claim, status and tasks are in its own file in [milestones/](milestones/). Each person writes only their own log in [logs/](logs/). UI text is split per area in `frontend/src/i18n/en/<area>.json`. **Only edit your milestone file and your own log.**
2. **Sync early and often.** When `develop` changes, merge it into your branch the same day (Step 5). Small syncs mean small, obvious conflicts.
3. **Shared "registry" files get one line per change, in alphabetical order.** These list things every milestone adds to:
   - `backend/app/models/__init__.py`
   - `backend/app/controllers/__init__.py`
   - `frontend/src/routes/AppRoutes.jsx` and `routes/paths.js`

   Insert your line where it belongs alphabetically, **never at the end** (that's where everyone else adds too), and never reorder or reformat other people's lines.
4. **Don't touch what your task doesn't need.** No renaming, moving or reformatting other files. Pre-commit only formats the files you changed, so formatting never causes conflicts.
5. **Co-owners split by area,** e.g. one takes backend, one frontend, or separate tasks with separate files. Pull before you start and push when you stop, so you're never far apart.
6. **One migration head.** After syncing with `develop`, run `flask db heads` in `backend/`. If it shows two heads (two milestones each added a migration), run `flask db merge heads -m "merge migrations"`, then `flask db upgrade` and `pytest`, and commit.
7. **Review quickly.** A PR waiting for days drifts from `develop`. Reviewers aim to review within one working day.

## Checks (there is no CI)

The project doesn't use GitHub Actions or any other CI. Quality is checked on your own machine, in two layers.

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

**2. Before opening a PR, and by the reviewer before approving.** All four must pass. Run them from the repo root, with `backend/.venv` activated and Docker Desktop running:
```bash
docker compose up -d db                        # 1. start the database
cd backend && pytest && cd ..                  # 2. backend tests (uses the test database)
cd frontend && npm test && npm run build && cd ..   # 3. frontend tests + production build
pre-commit run --all-files                     # 4. lint/format everything
```

Don't add GitHub Actions workflows or other CI to the repo.

---

## Step 1: Claim a milestone (owner)

```bash
git checkout develop
git pull
```
1. Pick a milestone in [MILESTONES.md](MILESTONES.md) whose dependencies are `Done`. Open its file in [milestones/](milestones/). Its **Owners** must be `-`, or you're joining as a co-owner.
2. In that file's **Claim** block only: set **Owners** to your name (co-owner: add yours after the existing names) and **Status** to `In progress`.
3. Commit only that file and push it straight to `develop`. This is the one direct push to `develop` that's allowed:
   ```bash
   git add workspace/milestones/M2-authentication.md
   git commit -m "chore(milestones): claim M2 [M2]"
   git push
   ```
4. **Push rejected?** Someone pushed to `develop` first. Run `git pull`, check the milestone is still free, then `git push` again.

## Step 2: Create the milestone branch (owner)

Whoever claims first creates the branch, straight after claiming, still on an up-to-date `develop`. Use the branch name from the milestone file:
```bash
git checkout -b m2-authentication
git push -u origin m2-authentication
```
Co-owners joining later:
```bash
git fetch
git checkout m2-authentication
```

## Step 3: Split the tasks (owners)

On the branch, in your milestone file's **Tasks** tables, put your name on the tasks you'll do and set them to `IN PROGRESS`. Commit and push. Split tasks so co-owners work in different files (see [How we avoid merge conflicts](#how-we-avoid-merge-conflicts)).

## Step 4: Work and log

**Every session:**
```bash
git checkout m2-authentication
git pull                       # co-owners' work first
# ... work, commit often ...
git push                       # before you stop
```
- Follow [CLAUDE.md](../CLAUDE.md), and put every new file where [docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) says.
- Every commit message includes the task ID: `feat(auth): add CNIC signup endpoint [T-020]`
- Mark a task `DONE` in your milestone file in the same commit as its last code. Stuck? Set it to `BLOCKED` and add a line under **Notes**.
- **`git push` rejected?** A co-owner pushed first. Run `git pull`, fix any conflicts, commit, and push again. Never force-push.

**Log.** At the end of each session, add an entry to **your own** file in [logs/](logs/), newest at the top, and commit it on the branch:

```markdown
### 2026-09-24 | T-042 Profile section APIs
- **Milestone:** M4 (branch m4-candidate-portal)
- **Status:** Done / Partial / In progress
- **What changed:**
  - `backend/app/models/profile.py`: added `EducationRecord`, `ExperienceRecord`
  - `backend/tests/controllers/test_profile_controller.py`: 9 tests
- **Database:** migration `a1b2c3_T-042_profile_sections` (adds 2 tables)
- **Commits:**
  - `feat(profile): add education section endpoints [T-042]`
- **How to test:** `pytest backend/tests/controllers/test_profile_controller.py`
- **Notes / follow-ups:** Certificate upload waits for T-043.
```

Always list migrations, new env vars and new dependencies. List commit messages, not hashes.

## Step 5: Sync with `develop` (owners)

Check daily whether `develop` has moved:
```bash
git fetch
git log --oneline HEAD..origin/develop     # prints anything? then sync now
```
Sync **on your machine** (never with GitHub's "Update branch" button):
```bash
git checkout m2-authentication
git pull                       # your branch first
git merge origin/develop       # bring in everyone else's merged work
```
- **No conflicts:** run the checks, then `git push`.
- **Conflicts:** Git lists the files. Open each one, keep the right code between the `<<<<<<<` / `>>>>>>>` markers (often both sides), delete the markers, then:
  ```bash
  git add <each fixed file>
  git commit                   # completes the merge
  ```
  Then run the checks and `git push`. Unsure about someone else's code? Ask its author (the log files say who changed what). Don't guess.
- **Conflict in `package-lock.json`:** don't edit it by hand. Run `git checkout --theirs frontend/package-lock.json`, then `cd frontend && npm install`, then `git add` it and commit.
- Then check migrations: `flask db heads` must show one head (rule 6 above).

## Step 6: Open the pull request (owner)

When every task is `DONE` and the **Done when** list in the milestone file is met:

1. Sync (Step 5) and make sure the four [checks](#checks-there-is-no-ci) pass.
2. In the milestone file, set **Status** to `Done`. It only reaches `develop` when the PR is merged, so it's never wrong. Commit and `git push`.
3. On GitHub: **Pull requests → New pull request**.
   - **base: `develop`** ← compare: `m2-authentication`. Double-check the base: it must not be `main`.
   - Title: `M2: Authentication`
   - Description: tasks done, migrations, new env vars/dependencies, how to test; link your log entries.
   - **Reviewers:** any teammate who isn't an owner of this milestone.
4. Stop adding features to the branch. Only make changes the reviewer asks for.

## Step 7: Review and merge (reviewer)

```bash
git fetch
git checkout m2-authentication
git pull
```
1. Run the four [checks](#checks-there-is-no-ci).
2. Review against CLAUDE.md (domain and layer rules) and PROJECT_STRUCTURE.md (placement, naming). Also check migrations, stray or debug files, the milestone file (all tasks `DONE`), and log entries present.
3. **Changes needed?** "Request changes" with clear comments. The owners fix it on the same branch and push, then you look again.
4. **All good?** **Approve → Merge pull request → "Create a merge commit" → Confirm → Delete branch**.
5. GitHub says **"This branch has conflicts"**? Don't resolve them in the browser. Ask the owners to do Step 5 and push, then re-check.

## Step 8: After the merge (everyone)

```bash
git checkout develop
git pull
git branch -d m2-authentication      # remove your local copy of the finished branch
```
Other milestones' owners: do Step 5 on your branch today.

## Step 9: Release to `main` (project lead only)

When one or more milestones have landed in `develop` and the lead decides to release:
1. On GitHub: **New pull request → base: `main` ← compare: `develop`**, titled `Release M2: Authentication`.
2. Merge with **"Create a merge commit"**. **Don't delete `develop`**: it's permanent.
3. Tag the release:
   ```bash
   git checkout main
   git pull
   git tag -a m2 -m "M2: Authentication"
   git push origin m2
   git checkout develop
   ```

Nobody else opens PRs into `main`.

## Small fixes outside a milestone

Same process, smaller: `git checkout develop && git pull && git checkout -b fix/short-desc`, fix it, add a log entry, run the checks, and open a PR into `develop`. A teammate reviews and merges it with a merge commit, and the branch is deleted. Use `[fix]` in commit messages if there's no task ID.

## Handing over or dropping a milestone

- **Dropping:** remove your name from **Owners** in the milestone file (on `develop`, like a claim). If you were the only owner, set **Status** back to `Not started` and add a **Notes** line saying where the branch stands.
- **Handing over:** change **Owners** and add a **Notes** line `handed over from <name>`. Both people add a log entry.

## If something goes wrong

| Problem | Do this |
|---|---|
| `git push` rejected | `git pull`, resolve conflicts if any, commit, `git push`. Never `-f`. |
| PR shows "This branch has conflicts" | Owners do Step 5 locally and push. Don't use the web conflict editor. |
| Opened the PR against `main` by mistake | Click **Edit** next to the PR title and change the base to `develop`. |
| Committed to `develop` by mistake (not a claim) | Don't push. `git branch fix/my-work` (keeps your commits), `git reset --hard origin/develop`, `git checkout fix/my-work`, then open a PR. |
| A branch was already merged but has new commits | Don't open a second PR from it. `git checkout -b fix/follow-up`, `git merge origin/develop`, push, and open the PR from the new branch. |
| `flask db upgrade` says "multiple heads" | `flask db merge heads -m "merge migrations"`, then `flask db upgrade`, `pytest`, commit. |
| Anything else confusing | Stop and ask in the team chat before pushing. A pause costs minutes; a bad merge costs hours. |

## Repo settings (project lead, one-time)

In GitHub → **Settings**:
1. **General → Default branch:** `develop`.
2. **General → Pull Requests:** tick **Allow merge commits** only; **untick** "Allow squash merging" and "Allow rebase merging". Tick **Automatically delete head branches**. Untick **Always suggest updating pull request branches**.
3. **Branches → rule for `main`:** require a pull request; block force pushes and deletion.
4. **Branches → rule for `develop`:** block force pushes and deletion.

No status-check rules: the project has no CI.

## Using Claude Code

Claude Code reads [CLAUDE.md](../CLAUDE.md) and follows this workflow. Start a session by saying who you are and what you're on ("I'm Anum, working on M4, task T-047"). It checks the claim in the milestone file, works on the milestone branch, updates the task table, writes your log entry, and won't commit or push unless you ask.

## Quick checklist

**Once per clone**
- [ ] Setup from [Checks](#checks-there-is-no-ci) done, including `pre-commit install`

**Starting a milestone**
- [ ] `develop` pulled; dependencies `Done`
- [ ] Claim block in the milestone file updated and pushed to `develop` (that file only)
- [ ] Branch created from `develop` and pushed

**Every session**
- [ ] `git pull` first, `git push` last
- [ ] `develop` changed? Sync today (Step 5)
- [ ] Commits include `[T-###]`; only my milestone file and my log touched in `workspace/`

**Finishing**
- [ ] Synced with `develop`; one migration head; four checks pass
- [ ] All tasks `DONE`; status `Done`; PR **into `develop`** with a non-owner reviewer
- [ ] Reviewer: checks → approve → **Create a merge commit** → delete branch
- [ ] Everyone: `git checkout develop && git pull`
- [ ] Project lead: release `develop` → `main` when ready
