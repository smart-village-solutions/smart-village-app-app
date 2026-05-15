# AGENTS.md

This document defines how AI agents should work in this repository.

## 1) Project Context

- Project: `smart-village-app`
- Stack: React Native + Expo (SDK 54), TypeScript/JavaScript
- Package manager: Yarn (`1.22.22`)
- Node version: `20.19.4`

## 2) Core Working Rules

- Keep changes focused and minimal for the requested task.
- Follow existing architecture and coding style in `src/`.
- Update tests/documentation when behavior changes.
- Do not introduce unrelated refactors in the same change.

## 3) Required Quality Gate

For normal development tasks, run both commands before finalizing work:

```bash
yarn lint
yarn test
```

`maestro` is currently optional and not part of the mandatory gate.

## 4) Mandatory Commit Policy

For AI-assisted development work, commits are required and must follow these rules:

1. **Before every commit, ask the user for a ticket number** (e.g. `SVA-1723`, `SVAK-183`, `SVASD-537`, `MQGB-208`).
2. Use **Conventional Commit** format in the subject:
   - `type(scope): short summary`
   - or `type: short summary` when scope is not needed
3. Allowed `type` values: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`.
4. Add a commit body with concise bullet points explaining what changed (and why when needed).
5. Put the ticket number in the commit body (usually as the last line).

Example:

```text
feat(map): upgrade marker clustering behavior

- refactored cluster source options to improve stability on zoom
- aligned marker rendering with MapLibre v11 layer configuration

SVAK-183
```

If no ticket number is provided yet, do not guess one. Ask the user first.

## 5) Branch and PR Expectations

- Prefer ticket-based branch names (examples from this repo):
  - `feature/SVAK-183-short-description`
  - `fix/SVA-1610-short-description`
- Follow `PULL_REQUEST_TEMPLATE.md`:
  - include testing notes
  - reference issue/ticket
  - add screenshots when UI changes

## 6) Security and Secrets

Never create, modify, or commit sensitive local secret material unless the user explicitly asks:

- `/src/config/secrets.js`
- `.env.local`
- `.env.development.local`
- `.env.test.local`
- `.env.production.local`
- `*.keystore`
- `*.p12`
- `*.key`

Note: `.gitignore` already covers these rules; this section makes the agent behavior explicit.

## 7) Documentation Pointers

- Main docs index: `docs/INDEX.md`
- Changelog policy and release notes: `CHANGELOG.md`
- Contribution and commit guidance: `CONTRIBUTING.md`
