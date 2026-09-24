# Team Workflow

Work is organised by **milestone** (a development phase). One person, or a few co-owners, claims a milestone, builds it on **one branch**, merges it into `develop` with **one pull request**, and then the branch is deleted.

**Claim → Branch → Work + log → Checks → PR into `develop` → Reviewer merges → Delete branch → Release to `main`**

## The 7 golden rules

Follow these and merging stays boring. Every rule exists because breaking it caused trouble in M0/M1.

1. **Merge method is always "Create a merge commit".** Never "Squash and merge" or "Rebase and merge". Squashing turns your work into a new commit Git can't recognise, so the next sync fights the same changes again and can silently undo deletions.
2. **Only two PR directions exist:** your branch → `develop`, and `develop` → `main` (release). Never open a PR into `main` from any other branch, and never from `main` into `develop`.
3. **One branch = one PR.** After the PR is merged, the branch is finished: delete it. Need more changes? Make a new branch from `develop`.
4. **Only the reviewer clicks Merge**, after approving. Never merge your own PR.
5. **Don't press GitHub's "Update branch" button.** Update from `develop` on your machine instead (Step 5), where you can run the checks.
6. **Never force-push** (`git push -f`) and never push to `main`.
7. **Pull before you start, push when you stop.** Every session starts with `git pull` and ends with `git push`.

## Branches

```
main                   ← releases only; moves forward when develop is released
  ↑  PR develop → main, "Create a merge commit"
develop                ← integration branch (GitHub default); milestone claims pushed here
  ↑  PR branch → develop, "Create a merge commit"
m2-authentication      ← one branch per milestone, shared by its owners, deleted after merge
fix/<short-desc>       ← small fixes outside a milestone, same rules
```

**Nobody pushes to `main`. The only direct push to `develop` is a claim change to `workspace/MILESTONES.md`.** Everything else arrives by pull request.

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

## Step 1: Claim a milestone

```bash
git checkout develop
git pull
```
1. Open [MILESTONES.md](MILESTONES.md). Check the milestone is unclaimed (`-`) and everything in **Depends on** is `Done`.
2. Set **Owners** to your name and **Status** to `In progress`, and add a changelog line. (Joining as a co-owner: add your name after the existing owners and tell the lead.)
3. Commit only that file and push it to `develop`:
   ```bash
   git add workspace/MILESTONES.md
   git commit -m "chore(milestones): claim M2 [M2]"
   git push
   ```
4. **Push rejected?** Someone pushed first. Run `git pull`, check the milestone is still free, then `git push` again.

## Step 2: Create the milestone branch

The **lead** (first owner), straight after claiming, still on an up-to-date `develop`:
```bash
git checkout -b m2-authentication
git push -u origin m2-authentication
```
Co-owners:
```bash
git fetch
git checkout m2-authentication
```

## Step 3: Split the tasks

On the milestone branch, owners put their names on their tasks in [TASKS.md](TASKS.md) with status `IN PROGRESS`, then commit and push. `TASKS.md` only changes on milestone branches; it reaches `develop` with the milestone PR.

## Step 4: Work and log

**Every session:**
```bash
git checkout m2-authentication
git pull                       # get your co-owners' work first
# ... work, commit often ...
git push                       # before you stop
```
- Follow [CLAUDE.md](../CLAUDE.md), and put every new file where [docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) says.
- Every commit message includes the task ID: `feat(auth): add CNIC signup endpoint [T-020]`
- Mark a task `DONE` in `TASKS.md` in the same commit as its last code. Stuck? Set it to `BLOCKED` and add a note.
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

## Step 5: Stay up to date with `develop`

Do this at least weekly, whenever another milestone lands in `develop`, and always right before Step 6. **On your machine, not with GitHub's "Update branch" button:**
```bash
git checkout m2-authentication
git pull                       # your branch first
git fetch
git merge origin/develop       # bring in everyone else's merged work
```
- **No conflicts:** run the checks, then `git push`.
- **Conflicts:** Git lists the files. Open each one, keep the right code between the `<<<<<<<` / `>>>>>>>` markers (usually both sides), delete the markers, then:
  ```bash
  git add <each fixed file>
  git commit                   # completes the merge
  ```
  Run the checks, then `git push`. Unsure? Stop and ask the lead or the other side's author. Don't guess, and don't `git merge --abort` halfway through someone else's changes without telling them.

## Step 6: Open the pull request

When every task is `DONE` and the **Done when** criteria in MILESTONES.md are met:

1. Do Step 5 (merge the latest `develop`).
2. Run all four [checks](#checks-there-is-no-ci). They must pass.
3. In `MILESTONES.md`, set the milestone to `Done` and add a changelog line. Commit and `git push`.
4. On GitHub: **Pull requests → New pull request**.
   - **base: `develop`** ← compare: `m2-authentication`. Double-check the base: it must not be `main`.
   - Title: `M2: Authentication`
   - Description: tasks done, migrations, new env vars/dependencies, how to test; link the owners' log entries.
   - **Reviewers:** one team member who isn't an owner of this milestone.
5. **Stop committing to the branch** unless the reviewer asks for changes.

## Step 7: Review and merge (reviewer)

```bash
git fetch
git checkout m2-authentication
git pull
```
1. Run all four [checks](#checks-there-is-no-ci).
2. Review against CLAUDE.md (domain and layer rules) and PROJECT_STRUCTURE.md (placement, naming). Also check migrations, stray or debug files, `TASKS.md` all `DONE`, and log entries present.
3. **Changes needed?** Choose "Request changes" and explain. The owners fix it on the same branch, push, and ask you to look again.
4. **All good?** Approve, then click **Merge pull request → "Create a merge commit" → Confirm**, then **Delete branch**.
5. If GitHub says **"This branch has conflicts"**: don't resolve them in the browser. Ask the owners to do Step 5 and push; then re-check.

## Step 8: After the merge (everyone)

```bash
git checkout develop
git pull
git branch -d m2-authentication      # delete your local copy of the finished branch
```
The branch is finished. Any follow-up work gets a **new** branch from `develop`: a `fix/...` branch, or the next milestone.

## Step 9: Release to `main` (milestone lead)

Right after the milestone is merged into `develop`:
1. On GitHub: **New pull request → base: `main` ← compare: `develop`**, titled `Release M2: Authentication`.
2. Get one approval. The reviewer clicks **"Create a merge commit"**. **Do not delete `develop`**: it's permanent.
3. Tag the release:
   ```bash
   git checkout main
   git pull
   git tag -a m2 -m "M2: Authentication"
   git push origin m2
   git checkout develop
   ```

## Small fixes outside a milestone

Same process, smaller: `git checkout develop && git pull && git checkout -b fix/short-desc`, fix it, add a log entry, run the checks, and open a PR into `develop`. The reviewer merges it with a merge commit and deletes the branch. It reaches `main` with the next release. Use `[fix]` in commit messages if there's no task ID.

## Handing over or dropping a milestone

- **Dropping:** remove your name from Owners in MILESTONES.md (push to `develop` like a claim). If you were the only owner, set Status back to `Not started` and note where the branch stands.
- **Handing over:** change Owners and add a changelog line `handed over from <name>`. Both people add a log entry on the branch.

## If something goes wrong

| Problem | Do this |
|---|---|
| `git push` rejected | `git pull`, resolve conflicts if any, commit, `git push`. Never `-f`. |
| PR shows "This branch has conflicts" | Owners do Step 5 locally and push. Don't use the web conflict editor. |
| Opened the PR against the wrong base | Click **Edit** next to the PR title and change the base to `develop` (or close it and open a new one). |
| Committed to `develop` by mistake (not a claim) | Don't push. `git branch fix/my-work` (keeps your commits), `git reset --hard origin/develop`, `git checkout fix/my-work`, then open a PR. |
| A branch was already merged but has new commits | Don't open a second PR from it. Create a new branch from it, then merge `develop` into that branch (Step 5), and open the PR from the new branch. |
| Anything else confusing | Stop and ask in the team chat before pushing. A pause costs minutes; a bad merge costs hours. |

## Repo settings (one-time, repo admin)

In GitHub → **Settings**:
1. **General → Default branch:** `develop`.
2. **General → Pull Requests:** tick **Allow merge commits** only; **untick** "Allow squash merging" and "Allow rebase merging". Tick **Automatically delete head branches**. Untick **Always suggest updating pull request branches**.
3. **Branches → rule for `main`:** require a pull request with 1 approval; block force pushes and deletion.
4. **Branches → rule for `develop`:** block force pushes and deletion.

No status-check rules: the project has no CI.

## Using Claude Code

Claude Code reads [CLAUDE.md](../CLAUDE.md) and follows this workflow. Start a session by saying who you are and what you're on ("I'm Anum, working on M4, task T-047"). It checks the milestone claim, works on the milestone branch, updates `TASKS.md`, writes your log entry, and won't commit or push unless you ask.

## Quick checklist

**Once per clone**
- [ ] Setup from [Checks](#checks-there-is-no-ci) done, including `pre-commit install`

**Starting a milestone**
- [ ] `develop` pulled; dependencies are `Done`
- [ ] Claim pushed to `develop` (MILESTONES.md only)
- [ ] Milestone branch created from `develop` and pushed

**Every session**
- [ ] `git pull` first, `git push` last
- [ ] My tasks have my name and `IN PROGRESS` in TASKS.md
- [ ] Commits include `[T-###]`; log entry written

**Finishing**
- [ ] `develop` merged in locally (Step 5); four checks pass
- [ ] All tasks `DONE`; milestone set to `Done`
- [ ] PR **into `develop`**, reviewer added; no more commits on the branch
- [ ] Reviewer: checks pass → approve → **Create a merge commit** → delete branch
- [ ] Everyone: `git checkout develop && git pull`
- [ ] Release PR `develop` → `main` (merge commit) and tag
