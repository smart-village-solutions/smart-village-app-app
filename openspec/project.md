# Project Context

## Purpose
The Smart Village App is an open-source mobile application designed to support villages, communities, and counties. It provides features such as news, events, points of interest, and push notifications to enhance community engagement and communication.

## Tech Stack

- React Native
- Expo
- TypeScript
- React Query
- GraphQL
- Jest (for testing)
- Maestro (for end-to-end testing)

## Project Conventions

### Code Style

- Code formatting is enforced using ESLint and Prettier.
- TypeScript is preferred for new modules, while legacy JavaScript files are extended in their existing language.
- Naming conventions follow camelCase for variables and PascalCase for components.

### Architecture Patterns

- Functional React components with hooks.
- Context Providers for managing global state (e.g., `SettingsProvider`, `NetworkProvider`).
- React Query for data fetching and caching.
- Modularized structure with reusable components and domain-specific modules.

### Testing Strategy

- Unit and snapshot tests are written using Jest.
- End-to-end tests are automated with Maestro.
- Tests are organized under the `__tests__` directory, mirroring the source structure.

### Git Workflow

- Branching strategy: `feature/{TICKET_ID}-{SHORT_DESCRIPTION}` for new features.
- Commit messages follow the convention: `<type>(<scope>): <description>`.
- Pull requests are used for code reviews and must pass CI checks before merging.

## Domain Context

The app is tailored for municipalities, focusing on delivering localized content and services. It supports features like event management, news updates, and points of interest to foster community interaction.

## Important Constraints

- Localization: All user-facing text is in German, sourced from `src/config/texts.js`.
- Accessibility: Components include descriptive accessibility labels.
- Offline Support: The app uses cached data and context providers to ensure functionality without an active network connection.

## External Dependencies

- Apollo/GraphQL for data queries.
- Sentry for error tracking.
- Expo for development and deployment.
- React Navigation for routing and navigation.
