# Git Branch Workflow Guide

## Check Current Branch

```bash
git branch
```

Example:

```text
* main
```

The `*` indicates your current branch.

---

## Create a New Branch

Create a branch for your feature or changes:

```bash
git checkout -b feature-login
```

Or:

```bash
git switch -c feature-login
```

---

## Make Changes

Edit your files as needed.

Check what changed:

```bash
git status
```

---

## Commit Changes

Add files:

```bash
git add .
```

Create a commit:

```bash
git commit -m "Add login feature"
```

---

## Push to GitHub (Not Main)

Push your branch:

```bash
git push -u origin feature-login
```

This creates a new branch on GitHub called `feature-login`.

---

## Future Pushes

After the first push:

```bash
git push
```

is enough.

---

## Switch Between Branches

Go back to main:

```bash
git checkout main
```

Go to your feature branch:

```bash
git checkout feature-login
```

Or:

```bash
git switch feature-login
```

---

## See All Branches

Local branches:

```bash
git branch
```

Local and remote branches:

```bash
git branch -a
```

---

## Typical Workflow

```bash
git checkout main
git pull

git checkout -b feature-new-page

# make changes

git add .
git commit -m "Add new page"

git push -u origin feature-new-page
```

Then create a Pull Request on GitHub to merge `feature-new-page` into `main`.

---

## Example Branch Names

```text
feature-login
feature-dashboard
bugfix-navbar
fix-authentication
hotfix-payment-error
refactor-user-service
```

---

## Important Rule

Avoid working directly on `main`.

Instead:

1. Create a branch.
2. Make changes.
3. Commit.
4. Push the branch.
5. Create a Pull Request.
6. Merge into `main` after review.

This keeps the `main` branch stable and makes collaboration easier.

git push --set-upstream origin feature-login