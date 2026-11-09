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
- Do not introduce unrelated refactors in the same change.

### Icon library mappings (v5.0.0+)

- The app supports multiple icon libraries through `src/IconProvider.tsx`. Whenever adding or renaming a shared icon (including `Icon` entries and `Icon.NamedIcon` usages in `src/config/icons/Icon.tsx` or elsewhere), update its unified name in **all eight** library mapping files under `src/config/icons/mappings/`: `tabler.tsx`, `ionicons.tsx`, `fontawesome.tsx`, `fontawesome5.tsx`, `fontawesome6.tsx`, `materialicons.tsx`, `materialcommunityicons.tsx`, and `simplelineicons.tsx`.
- Use the same lowercase, kebab-case key in every mapping and select a valid, semantically equivalent icon from each installed library. If there is no exact equivalent, use the closest meaningful alternative. Verify the target names against the installed libraries; do not guess names or rely on the unmapped-name fallback for shared icons, even when a library uses the same name.
- For custom SVG icons resolved by unified name, also update `src/config/icons/mappings/customSvg.tsx`; custom SVGs take priority over library mappings. Preserve this behavior.
- Check the new or renamed icon with each supported library, including an explicit `iconSet` and the configured `iconFamilies` order, so customer-specific library choices remain supported.

## 3) Required Quality Gate

For normal development tasks, run both commands before finalizing work:

```bash
yarn lint
yarn test
```

`maestro` is currently optional and not part of the mandatory gate.

## 4) Mandatory Commit Policy

For AI-assisted development work, commits are required and must follow these rules:

1. Use **Conventional Commit** format in the subject:
   - `type(scope): short summary`
   - or `type: short summary` when scope is not needed
2. Allowed `type` values: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`.
3. Add a commit body with concise bullet points explaining what changed (and why when needed).
4. If the task already has a ticket number, put it on the last line of the commit body. Use the number supplied with the task or take it from the current branch name if it refers to the same task (for example, `SVAK-183`). If neither provides a number, proceed without one or a follow-up question.

Example:

```text
feat(map): upgrade marker clustering behavior

- refactored cluster source options to improve stability on zoom
- aligned marker rendering with MapLibre v11 layer configuration
```

## 5) Branch and PR Expectations

- Use descriptive branch names, such as `feature/map-clustering` or `fix/map-loading`.
- When creating a branch for a task with a known ticket number, include it in the branch name, such as `feature/SVAK-183-map-clustering`.
- Follow the [pull request template](.github/pull_request_template.md):
  - include testing notes
  - reference the ticket if one exists
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
