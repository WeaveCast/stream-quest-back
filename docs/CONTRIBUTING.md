# Contributing

Thank you for your interest in contributing to Stream Quest! This guide will help you get started.

---

## Code of Conduct

Be respectful and constructive. We welcome contributors of all experience levels.

---

## Getting Started

1. Fork the repository
2. Clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/back.git
   cd back
   ```
3. Install dependencies locally
   ```bash
   npm install
   ```
4. Follow the [Installation guide](./INSTALLATION.md) to set up your environment
5. Create a new branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Branch Naming Convention

| Type          | Pattern                      | Example                        |
| ------------- | ---------------------------- | ------------------------------ |
| Feature       | `feature/short-description`  | `feature/auth-twitch-oauth`    |
| Bug fix       | `fix/short-description`      | `fix/websocket-disconnect`     |
| Chore         | `chore/short-description`    | `chore/update-dependencies`    |
| Documentation | `docs/short-description`     | `docs/update-installation`     |
| Refactor      | `refactor/short-description` | `refactor/rules-engine-module` |

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

Format:

```
<type>(<scope>): <subject>
```

Available types:

| Type       | Description                             |
| ---------- | --------------------------------------- |
| `feat`     | A new feature                           |
| `fix`      | A bug fix                               |
| `chore`    | Maintenance, dependencies, tooling      |
| `docs`     | Documentation changes                   |
| `style`    | Formatting, missing semicolons, etc.    |
| `refactor` | Code refactoring without feature change |
| `test`     | Adding or updating tests                |
| `perf`     | Performance improvements                |

Examples:

```
feat(auth): add twitch oauth login
fix(session): resolve websocket disconnect issue
chore: update dependencies
docs: update installation guide
refactor(rules-engine): simplify condition evaluation
```

Rules:

- Header must not exceed **72 characters**
- Subject must not be empty
- Use the **imperative mood** in the subject ("add" not "added")

> Commitlint is enforced via Husky - invalid commit messages will be rejected automatically.

---

## Code Conventions

- Language: **English only** - code, comments, variable names, commit messages
- Formatter: **Prettier** - runs automatically on staged files via lint-staged
- Linter: **ESLint** - runs automatically on staged files via lint-staged
- All TypeScript files must pass ESLint before committing

---

## Tests

- Test files are colocated with their service: `prisma.service.spec.ts` lives next to `prisma.service.ts`
- End-to-end tests live in `/test`
- Run unit tests:
  ```bash
  npm run test
  ```
- Run e2e tests:
  ```bash
  npm run test:e2e
  ```
- Run coverage:
  ```bash
  npm run test:cov
  ```

---

## Pull Request Process

1. Make sure your branch is up to date with `main`
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. Make sure all tests pass
3. Open a Pull Request against `main`
4. Fill in the PR description - what does it do, why, how to test it
5. Wait for review

---

## Reporting a Bug

Open a [GitHub Issue](https://github.com/Stream-Quest/back/issues) with:

- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, Docker version)

---

## Proposing a Feature

Open a [GitHub Issue](https://github.com/Stream-Quest/back/issues) with:

- A clear description of the feature
- Why it would be useful
- Any implementation ideas you have
