# Team Workflow

Work is organised by **milestone** (a development phase). One person, or a few co-owners, claims a whole milestone, builds it on one branch, and releases it through `develop` to `main`.

**Claim milestone → Branch → Work + log → PR into `develop` → Release to `main`**

## Branches

```
main              ← releases only: one merge per finished milestone, tagged
  ↑  (PR, merge commit)
develop           ← integration: finished milestones + milestone claims
  ↑  (PR, squash merge)
m4-candidate-portal   ← one branch per milestone, shared by its owners
```

| Branch | What goes in | How |
|--------|--------------|-----|
| `main` | Released milestones only | PR from `develop`, 1 approval, merge commit, tag |
| `develop` | Finished milestones; milestone claims in `MILESTONES.md` | Milestone PR (squash); claims pushed directly |
| `m<N>-<name>` | All work for one milestone: code, `TASKS.md` ticks, work logs | Owners commit and push freely |
| `fix/<desc>` | A bug fix outside any open milestone | PR into `develop` |

**Nobody pushes to `main` directly. The only direct push to `develop` is a claim change to `MILESTONES.md`.** Everything else arrives by pull request.

On `main`, `git log --first-parent main` shows exactly one entry per released milestone.

## Checks (there is no CI)

The project doesn't use GitHub Actions or any other CI. Quality is checked on your own machine, in two layers:

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

1. Update `develop`:
   ```bash
   git checkout develop
   git pull
   ```
2. Open [MILESTONES.md](MILESTONES.md). Check the milestone is unclaimed (`-`) and everything in **Depends on** is `Done`.
3. In the claim board, set **Owners** to your name and **Status** to `In progress`. Add a line to the milestone changelog.
   - **Joining as a co-owner:** add your name after the existing owners (`Hadi, Anum`). Tell the lead.
4. Commit only that file and push to `develop`:
   ```bash
   git add workspace/MILESTONES.md
   git commit -m "chore(milestones): claim M2 [M2]"
   git push origin develop
   ```
5. **If the push is rejected**, someone pushed first. `git pull`, check the milestone is still free, and push again. If someone else claimed it, join as co-owner or pick another.

Don't start coding until your claim is on the remote.

## Step 2: Create the milestone branch

The **lead** (first owner) creates the branch from `develop` and pushes it right away:
```bash
git checkout -b m2-authentication
git push -u origin m2-authentication
```
Co-owners pick it up:
```bash
git fetch
git checkout m2-authentication
```
Use the branch name listed in the claim board.

## Step 3: Split the tasks

On the milestone branch, owners put their names on the tasks they'll do in [TASKS.md](TASKS.md) and set them to `IN PROGRESS`. Commit that on the branch. `TASKS.md` is **never** pushed to `develop` or `main` directly; it travels with the milestone PR.

Missing a task? Add a row with the next free ID. If the scope grows a lot, talk to the team before widening the milestone.

## Step 4: Work and log

**Code**
- Follow [CLAUDE.md](../CLAUDE.md), and put every new file where [docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) says.
- Commit often. Every commit message includes the task ID:
  ```
  feat(auth): add CNIC signup endpoint [T-020]
  ```
- Mark a task `DONE` in `TASKS.md` when it's finished, in the same commit as the last code for it.
- Stuck? Set the task to `BLOCKED` and add a note under that milestone's table.

**Sharing a branch with co-owners**
- Always `git pull --rebase` before `git push`. Never force-push a milestone branch.
- Split work by task so two people rarely edit the same file at once.

**Keeping up with `develop`.** Do this at least weekly, and whenever another milestone lands in `develop`:
```bash
git fetch
git merge origin/develop     # resolve conflicts now, while they're small
git push
```

**Log.** Add an entry to **your own** file in [logs/](logs/) at the end of each work session, newest at the top. Commit it on the milestone branch.

```markdown
### 2026-09-24 | T-042 Profile section APIs
- **Milestone:** M4 (branch m4-candidate-portal)
- **Status:** Done / Partial / In progress
- **What changed:**
  - `backend/app/models/profile.py`: added `EducationRecord`, `ExperienceRecord`
  - `backend/app/controllers/profile_controller.py`: CRUD for education and experience
  - `backend/tests/controllers/test_profile_controller.py`: 9 tests
- **Database:** migration `a1b2c3_T-042_profile_sections` (adds 2 tables)
- **Commits:**
  - `feat(profile): add education section endpoints [T-042]`
  - `test(profile): cover education/experience CRUD [T-042]`
- **How to test:** `pytest backend/tests/controllers/test_profile_controller.py`
- **Notes / follow-ups:** Certificate upload waits for T-043.
```

Log rules:
- List every file you created, changed or deleted, one line each, with why.
- Always mention migrations, new env vars and new dependencies. Others need them to run the project.
- List commit messages, not hashes (a commit can't contain its own hash). `git log --grep "T-042"` finds them.
- Write only in your own log, so co-owners never conflict.

## Step 5: Finish the milestone: PR into `develop`

When every task is `DONE` and the milestone's **Done when** criteria in MILESTONES.md are met:

1. On the milestone branch, merge the latest `develop` (Step 4), then run the [pre-PR checks](#checks-there-is-no-ci) and fix anything that broke.
2. In `MILESTONES.md`, set the milestone's Status to `Done` and add a changelog line. It only lands if the PR merges.
3. Push, then the lead opens a PR **into `develop`**:
   - Title: `M2: Authentication`
   - Description: list of tasks done, migrations, new env vars/dependencies, how to test. Point to the owners' log entries.
   - Add the reviewer under **Reviewers**.
4. **Review:** at least one team member who is **not** an owner of this milestone. For large milestones, the reviewer can follow the branch as it's pushed rather than reading everything at the end. Reviewers check:
   - check out the branch and run the [pre-PR checks](#checks-there-is-no-ci) themselves (there's no CI to do it)
   - the domain rules and layer rules in CLAUDE.md
   - file placement and naming against PROJECT_STRUCTURE.md
   - migrations reviewed; no debug leftovers or stray files
   - `TASKS.md` all `DONE`, log entries present
5. **The reviewer merges, after approving**, with **"Squash and merge"**, titled `M2: Authentication (#PR)`. GitHub keeps co-owners as co-authors. Never merge your own PR or one that isn't approved yet.
6. Delete the milestone branch.

## Step 6: Release to `main`

Right after the milestone lands in `develop`, the lead:
1. Opens a PR **from `develop` into `main`**, titled `Release M2: Authentication`.
2. Gets one approval, then merges with **"Create a merge commit"**. Never squash `develop` into `main`, because the two branches would drift apart.
3. Tags the release:
   ```bash
   git checkout main && git pull
   git tag -a m2 -m "M2: Authentication"
   git push origin m2
   ```

If two milestones finish close together, one release PR can carry both.

## Bug fixes between milestones

For a bug already on `develop` that isn't part of an open milestone: branch `fix/<short-desc>` from `develop`, fix it, add a log entry, and open a PR into `develop` (squash). Use `[fix]` in commit messages if there's no task ID. It reaches `main` with the next release.

## Handing over or dropping a milestone

- **Dropping:** remove your name from Owners in MILESTONES.md (push to `develop` like a claim). If you were the only owner, set Status back to `Not started` and add a changelog line saying where the branch stands.
- **Handing over:** change Owners and add a changelog line `handed over from <name>`. Both people add a log entry on the branch.

## Repo settings (one-time, done by the repo admin)

In GitHub → **Settings**:
1. **General → Default branch:** `develop`, so clones and new PRs start from it.
2. **General → Pull Requests:** allow **squash merging** and **merge commits**; turn on **Automatically delete head branches**.
3. **Branches → add rule for `main`:** require a pull request with 1 approval; block force pushes and deletion.
4. **Branches → add rule for `develop`:** block force pushes and deletion. The "PR required for code" rule is kept by team discipline, since claims are pushed directly.

No status-check rules: the project has no CI (see [Checks](#checks-there-is-no-ci)).

## Using Claude Code

Claude Code reads [CLAUDE.md](../CLAUDE.md) and follows this workflow. Start a session by saying who you are and what you're on ("I'm Anum, working on M4, task T-047"). It checks the milestone claim, works on the milestone branch, updates `TASKS.md`, writes your log entry, and won't commit or push unless you ask.

## Quick checklist

**Once per clone**
- [ ] Setup from [Checks](#checks-there-is-no-ci) done, including `pre-commit install`

**Starting a milestone**
- [ ] `develop` pulled; dependencies are `Done`
- [ ] Claim pushed to `develop` (MILESTONES.md only)
- [ ] Milestone branch created from `develop` and pushed

**Every work session**
- [ ] On the milestone branch, `git pull --rebase` first
- [ ] Tasks I'm on have my name and `IN PROGRESS` in TASKS.md
- [ ] Files placed and named per PROJECT_STRUCTURE.md; no debug leftovers
- [ ] Commits include `[T-###]`
- [ ] Log entry in `workspace/logs/<name>.md`

**Finishing**
- [ ] `develop` merged in; all four pre-PR checks pass
- [ ] All tasks `DONE`, milestone set to `Done`
- [ ] PR into `develop` with a non-owner as reviewer; the reviewer re-runs the checks, approves and squash-merges
- [ ] Release PR `develop` → `main` merged (merge commit) and tagged
