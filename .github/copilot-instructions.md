# Smart Village App - Mobile App

## Attention Copilot

- Do not create code without a concept!
- Share a short concept before code edits and confirm missing assumptions.
- Write all code in English
- Write code with comment where code is not self-explanatory!
- Ask questions if unsure!
- Ask for permissions before updating existing code or creating new code!

## Style Of Communication

- Keep replies concise
- Do not write introductions like "Sehr gute Fragen!" in your chat responses.
- Ask clarification questions instead of guessing when requirements feel vague.

## Architecture Overview

The Smart Village App is an open source React Native application built with Expo for Android and iOS. This repository contains application code, documentation, test cases and example configurations.

### General project information
- `README.md` introduces the app as an open source mobile application for villages, communities and counties
- `publiccode.yml` lists features such as news, events, points of interest and push notifications

### Directory layout
- `src/` – main source folder
  - `components/` – reusable UI components
  - `screens/` – individual app screens
  - `hooks/` – custom React hooks
  - `navigation/` – React Navigation setup
  - `queries/` – GraphQL queries
  - `config/` – colors, fonts, constants and secrets
  - various providers
- `docs/` – documentation such as getting started or AR guides
- `__tests__/` – unit and snapshot tests
- `__maestro__/` – Maestro flows for automated end-to-end tests
- Configuration files like `app.json`, `eas.json` and `package.json`

### Application entry point
Entry flow: `App.js` initializes Sentry and hides the splash screen before rendering `MainApp`. `src/index.js` configures the Apollo client, restores cached settings and wraps the application with `Navigator` and multiple context providers (`SettingsProvider`, `NetworkProvider`, `BookmarkProvider`, `ReactQueryProvider`, etc.). Navigation lives in `src/navigation` (drawer and tab navigators). Shared configuration, theming, and copy are housed in `src/config`; all user-facing text - including accessibility labels - comes from `src/config/texts.js` (German strings). Domain features are grouped under `src/components`, `src/screens`, `src/queries`, and dedicated provider modules. Reuse helpers in `src/helpers` before adding new utilities to keep behaviour consistent.

### Essential knowledge for newcomers
- React Native and Expo
- Apollo/GraphQL → always use react-query over apollo for new code!
- Context providers for bookmarks, network, orientation and settings
- Configuration in `src/config` and the secrets setup
- Testing with Jest and Maestro
- Code base is a mix of TypeScript (`.ts/.tsx`) and legacy JavaScript (`.js/.jsx`) → extend files in their existing language and prefer TypeScript for new modules when feasible

## Development Workflows

### Coding patterns Copilot should follow
- Use functional React components with hooks; respect existing context contracts (`SettingsContext`, `NetworkContext`, `ProfileProvider`, etc.) to preserve offline support and user settings.
- For data fetching, rely on React Query (`useQuery`, `useInfiniteQuery`) and the `ReactQueryClient` wrapper that issues GraphQL requests defined in `src/queries`. Touch Apollo client configuration only when a task explicitly requests it.
- When touching async flows, consider network state (`NetworkContext`), persisted storage (`storageHelper`, `AsyncStorage`, `SecureStore`), and cache hydration (`persistCache`) to avoid breaking startup.
- Styling should reuse `StyleSheet.create`, `src/config/colors`, `src/config/fonts`, `src/config/normalize`, and existing helper components. Only introduce new styling primitives if they match established patterns (occasional `styled-components/native` usage).
- Preserve localisation and accessibility: source strings from `src/config/texts`, keep `moment` locale handling (`moment/locale/de`), and maintain accessibility labels in components like calendar, search, and dropdowns.
- Avoid introducing new dependencies or polyfills without approval; leverage utilities already provided (e.g., `graphqlFetchPolicy`, `parseListItemsFromQuery`, `ReactQueryClient`).

### Tooling & workflows
- Yarn is the goto package manager. Common commands: `yarn start`, `yarn ios`, `yarn android`, `yarn test`, `yarn lint`, `yarn prebuild`, `yarn build:android`, `yarn build:ios`.
- Tests: Jest (`jest-expo`) powers unit and snapshot tests in `__tests__`; Maestro scripts in `__maestro__` run end-to-end flows. Recommend precise Jest specs or Maestro cases when proposing test coverage.
- ESLint (`.eslintrc.yml`) and Prettier (`.prettierrc.yml`) define formatting. Match the surrounding style instead of reformatting entire files.
- Most UI copy is German; coordinate with `texts` when adding or changing labels and ensure accessibility strings remain descriptive.
- Heavy features (maps, AR, BB-BUS, volunteer) depend on specific helper modules; extend those patterns instead of duplicating logic.

### Run the app
To start the app simply use one of the following commands.

* only packager and Expo dev tools: `npm start` or `yarn start`
* iOS: `npm run ios` or `yarn ios`
* Android: `npm run android` or `yarn android`

### Test the app
Jest is used for unit and snapshot tests (for example `__tests__/components/Button.test.js`). Maestro flows cover common user paths.

For executing tests run `npm run test` or `yarn test`.

### Lint the app
For executing linters run `npm run lint` or `yarn lint`.

### External Service Integration
- **Jira tickets**: Access via Atlassian MCP tools
- **Time tracking**: Query via timing-sync-mcp for Jira Tempo entries
- **Server logs**: Access via Grafana MCP tools

## Release & Deployment

### Branch Strategy
- Deployment/Releases → municipality-specific branches like `release/bb/demo`

### Branch Naming
- New feature branch from `master` named like `feature/{TICKET_ID}-{SHORT_DESCRIPTION}`

### Build & Deployment
- `yarn prebuild` to prepare the app for building (e.g., generating icons)
- Use EAS for building and deploying the app
  - iOS: `yarn build:ios --auto-submit`
  - Android: `yarn build:android --auto-submit`
- Comment out `/src/config/secrets.js` in .gitignore before building for production

### Versioning
- Versioning follows semantic versioning: `MAJOR.MINOR.PATCH`
- There is a changelog in `CHANGELOG.md` that must be updated with each release
