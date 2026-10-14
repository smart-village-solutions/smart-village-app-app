# AGENTS.md

This document defines how AI agents should work in this repository.

## 1) Project Context

- Project: `smart-village-app`
- Stack: React Native + Expo (SDK 57), TypeScript/JavaScript
- Package manager: Yarn (`1.22.22`)
- Node version: `22.13.0`

## 2) Core Working Rules

- Keep changes focused and minimal for the requested task.
- Follow existing architecture and coding style in `src/`.
- Update tests/documentation when behavior changes.
- Update `CHANGELOG.md` only when preparing a new release version. Do not add
  changelog entries or an `Unreleased` section for routine tasks, fixes, or
  local-only version changes.
- Do not introduce unrelated refactors in the same change.

## 3) Required Quality Gate

For normal development tasks, run both commands before finalizing work:

```bash
yarn lint
yarn test
```

`maestro` is currently optional and not part of the mandatory gate.

## 4) Commit Approval Policy

Do not create commits automatically after tasks, fixes, tests, or individual changes.
Keep changes uncommitted until the user explicitly approves committing the specific
changes. A request to implement or test something, a ticket number, or an earlier
commit approval does not authorize additional commits.

- Before requesting approval, show the proposed scope and identify changes intended
  only for local development or testing. Keep local-only changes out of commits.
- Stage and commit only the changes covered by the user's approval.
- Obtain explicit approval before rewriting, squashing, reverting, or removing
  existing commits, and before creating merge commits or pushing changes.

Once the user approves a commit, follow these rules:

1. **Before every commit, determine the ticket number**. First inspect the current branch name for a ticket pattern such as `SVA-1723`, `SVAK-183`, `SVASD-537`, or `MQGB-208`. If the branch name contains a ticket, use it. Otherwise use a ticket already provided by the user for this task, or ask for one before committing. A ticket number alone is not commit approval.
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

If no ticket number can be found in the branch name and the user has not provided one, do not guess one. Ask the user first.

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

## Code Review Rules

- Write all review findings and summaries in English. Report actionable regressions introduced by the pull request, explain the affected scenario and impact, and point to the relevant changed lines. Leave formatting and lint checks to CI.

### Customer app configuration

- Check that shared changes preserve customer-specific API endpoints, feature flags, and branding. Flag hard-coded customer values in shared code or configuration changes that leave the corresponding generation templates inconsistent. Respect intentional differences between customer release branches.

### Native and OTA compatibility

- When a change adds or changes native modules, config plugins, or native build settings, check whether an OTA update could reach an incompatible installed binary. Require a compatible native build/runtime for native changes; JavaScript-only updates may remain OTA-compatible. Check both iOS and Android behavior where applicable.

### Authentication and failure recovery

- Flag changes that discard valid credentials or cached user data after temporary network or secure-storage failures, expose tokens or personal data in logs, or let stale asynchronous responses overwrite current state. Preserve recoverable state on transient failures; explicit logout and confirmed invalid credentials may clear the relevant state.
