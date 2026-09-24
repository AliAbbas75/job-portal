# Team Workflow

Every piece of work, by every team member, follows the same five steps:

**Claim → Branch → Work → Log → Commit, push, PR**

The goal is that anyone can open `workspace/TASKS.md` and see who is doing what right now, and open `workspace/logs/` to see what changed and why.

---

## Step 1: Claim the task

1. Get the latest board:
   ```bash
   git checkout main
   git pull
   ```
2. Open [TASKS.md](TASKS.md) and find the task. If it doesn't exist, add a row at the bottom of the right milestone table using the next free ID.
3. Check the Owner is `-` (unassigned). If someone else owns it, pick another task or talk to them first.
4. Fill in your row:
   - **Owner:** your name (Ali, Anum, Hadi, Malaika or Umaima)
   - **Status:** `IN PROGRESS`
5. Commit and push the claim to `main` straight away, on its own:
   ```bash
   git add workspace/TASKS.md
   git commit -m "chore(tasks): claim T-020 [T-020]"
   git push origin main
   ```
6. **If the push is rejected**, someone else pushed first. Run `git pull`, check the task is still free, resolve any conflict (keep both people's rows), and push again. If they claimed the same task, it's theirs: undo your claim.

Don't start coding until your claim is on the remote.

**Limit:** one `IN PROGRESS` task per person at a time, unless the other is `BLOCKED`.

## Step 2: Create your branch

```bash
git checkout -b <name>/<task-id>-<short-desc>
# e.g.
git checkout -b malaika/T-043-profile-section-apis
```

Lowercase, hyphens, no spaces.

## Step 3: Do the work

- Follow the architecture and conventions in [CLAUDE.md](../CLAUDE.md).
- Put every new file where [docs/PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md) says, named by its conventions. Don't create files the task doesn't need.
- Commit often on your branch. Every commit message includes the task ID:
  ```
  feat(profile): add education section endpoints [T-043]
  ```
- If you get stuck waiting on someone else, set Status to `BLOCKED` and say why in a note under that milestone's table (push that board change to `main` the same way as a claim).
- If the task grows, split it: add new task rows rather than silently widening the scope.

## Step 4: Log the work

Before you push for review, add an entry to **your own** log file in [logs/](logs/). Newest entries go at the **top**, just under the header.

```markdown
### 2026-09-24 | T-043 Profile section APIs
- **Status:** Done / Partial / In progress
- **Branch:** malaika/T-043-profile-section-apis
- **What changed:**
  - `backend/app/models/profile.py`: added `EducationRecord`, `ExperienceRecord`
  - `backend/app/controllers/profile.py`: GET/POST/PUT/DELETE for education and experience
  - `backend/tests/test_profile.py`: 9 tests
- **Database:** migration `a1b2c3_T-043_profile_sections` (adds 2 tables)
- **Commits:**
  - `feat(profile): add education section endpoints [T-043]`
  - `test(profile): cover education/experience CRUD [T-043]`
- **How to test:** `pytest backend/tests/test_profile.py`
- **Notes / follow-ups:** Document upload for certificates is left for T-045.
```

Rules:
- One entry per work session or per PR, whichever is smaller.
- List every file you touched and why, in one line each.
- Always mention migrations, new env vars, and new dependencies. Others need them to run the project.
- Commits: list commit messages (the hash of a commit can't be written inside that same commit). Anyone can find them with `git log --grep "T-043"`.
- Write only in your own log. That keeps five people from conflicting in one file.

## Step 5: Commit, push, open a pull request

```bash
git add <files> workspace/logs/<your-name>.md
git commit -m "docs(log): T-043 work log [T-043]"   # or include the log in your last code commit
git pull --rebase origin main                        # pick up others' work
git push -u origin <your-branch>
```

Then:
1. Open a pull request into `main`. Title: `[T-043] Profile section APIs`. In the description, link the task and paste the log entry.
2. On your branch, set the task's Status to `IN REVIEW` in `TASKS.md` so it merges with the PR.
3. Ask at least one other team member to review. Reviewers check the architecture rules in CLAUDE.md, file placement and naming against PROJECT_STRUCTURE.md, no debug leftovers or stray files, tests, migrations, and that the log entry is there.
4. After merge, set Status to `DONE` (push to `main` like a claim).
5. Delete the branch.

## Status values

| Status | Meaning |
|--------|---------|
| `TODO` | Nobody is on it |
| `IN PROGRESS` | Claimed and being worked on |
| `BLOCKED` | Can't continue; reason in the milestone's notes |
| `IN REVIEW` | Pull request open |
| `DONE` | Merged into `main` |

## Handing over or dropping a task

- **Dropping:** set Owner back to `-`, Status to `TODO`, and add a note saying what's done and where the branch is. Add a matching log entry.
- **Handing over:** change Owner, add a note `handed over from <name> on <date>`. Both people add a log entry.

## Milestones

[MILESTONES.md](MILESTONES.md) is updated by whoever finishes the last task in a milestone, or at the weekly sync. Don't mark a milestone done until every task in it is `DONE` and its exit criteria are met.

## Using Claude Code

Claude Code reads [CLAUDE.md](../CLAUDE.md) and follows this same workflow. Tell it who you are at the start of a session ("I'm Anum, working on T-031"). It will check the claim, write your log entry and use your branch prefix. It won't commit or push unless you ask.

## Quick checklist

- [ ] Pulled latest `main`
- [ ] Task claimed in TASKS.md and pushed to `main`
- [ ] Working on `<name>/<task-id>-<desc>` branch
- [ ] New files placed and named per PROJECT_STRUCTURE.md; no stray/debug files
- [ ] Commits include `[T-###]`
- [ ] Log entry added to `workspace/logs/<name>.md`
- [ ] Rebased on `main`, pushed, PR opened
- [ ] Task set to `IN REVIEW`, then `DONE` after merge
