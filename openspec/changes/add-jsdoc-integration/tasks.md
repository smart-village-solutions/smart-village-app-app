# Tasks: Add TypeDoc Generation for Developer Documentation

## 1. Switch to TypeDoc and configure generation

- [x] 1.1 Install TypeDoc as a development dependency.
- [x] 1.2 Create a `typedoc.json` configuration file that scopes output to `src/`.
- [x] 1.3 Update `generate-docs` to call `typedoc` with `--skipErrorChecking` (due to current TS issues) and ignore `docs/typedoc/` in git.
- [x] 1.4 Document the current workaround (skip error checking) so future TypeScript fixes can remove it.

## 2. Document Existing Code

- [x] 2.1 Add TypeDoc-friendly comments to key files in the `src/` directory as examples.
- [ ] 2.2 Ensure all functions, classes, and modules have thorough TypeDoc-friendly annotations.
  - [x] 2.2.1 Document helper-heavy files such as `src/helpers/openingHoursHelper.ts`.
  - [ ] 2.2.2 Layer documentation onto additional helpers/providers (react hooks, contexts, etc.) in future passes.
  - [ ] 2.2.3 Maintain a per-directory checklist (helpers, providers, navigation, screens, etc.) so we can track coverage and ensure every export gains a description.
    - [x] Helpers (`src/helpers/*`) – `openingHoursHelper.ts`, `bookmarkHelper.ts`, `storageHelper.js`, `dateTimeHelper.ts`, `createCalendarEvent.ts`
    - [ ] Providers (`src/*Provider.tsx`)
    - [ ] Hooks (`src/hooks/*`)
    - [ ] Navigation (`src/navigation/*`)
    - [ ] Screens (`src/screens/*`)
- [ ] 2.3 Review and refine the documentation for consistency.
  - [ ] 2.3.1 Preview the generated docs at `docs/typedoc/index.html` to pick up missing descriptions.
  - [ ] 2.3.2 Align the structure/tags with existing copy (texts/README) and add missing links.

## 3. Automate Documentation

- [ ] 3.1 Confirm `yarn generate-docs` runs successfully inside the GitHub workflow (still uses the same workflow file).
- [ ] 3.2 Ensure the generated docs are published (e.g., push to GitHub Pages or copy into the release artifacts).

## 4. Train Developers

- [ ] 4.1 Create a short guide on how to use TypeDoc and where the generated docs live.
- [ ] 4.2 Share resources or a demo so contributors know how to regenerate docs locally.

## 5. Final Validation

- [ ] 5.1 Confirm the documentation output matches the latest `src/` API surface.
- [ ] 5.2 Make documentation part of pull-request reviews (e.g., regenerate docs when public APIs change).
