# Smart Village App Documentation

Detailed documentation of the app's code will grow here.

## Codebase Overview

The Smart Village App is an open source React Native application built with Expo for Android and iOS. This repository contains application code, documentation, test cases and example configurations.

### General project information

- `README.md` introduces the app as an open source mobile application for villages, communities and counties.
- `publiccode.yml` lists features such as news, events, points of interest and push notifications.

### Directory layout

- `src/` – main source folder
  - `components/` – reusable UI components
  - `screens/` – individual app screens
  - `hooks/` – custom React hooks
  - `queries/` – GraphQL queries
  - `config/` – colors, fonts, constants and secrets
  - various providers
- `docs/` – documentation such as getting started or AR guides
- `__tests__/` – unit and snapshot tests
- `__maestro__/` – Maestro flows for automated end-to-end tests
- Configuration files like `app.json`, `eas.json` and `package.json`

### Application entry point

`App.js` initializes Sentry and hides the splash screen before rendering `MainApp`. `src/index.js` configures the Apollo client and wraps the application with multiple context providers.

**Configure secrets** – copy `src/config/secrets.temp` to `src/config/secrets.js` and fill in the required credentials. Details are in [docs/AUTH.md](./AUTH.md).

### Essential knowledge for newcomers

- React Native and Expo
- Apollo/GraphQL
- Context providers for bookmarks, network, orientation and settings
- Configuration in `src/config` and the secrets setup
- Testing with Jest and Maestro

## Run the app

To start the app simply use one of the following commands.

* only packager and Expo dev tools: `npm start` or `yarn start`
* iOS: `npm run ios` or `yarn ios`
* Android: `npm run android` or `yarn android`

## Test the app

Jest is used for unit and snapshot tests (for example `__tests__/components/Button.test.js`). Maestro flows cover common user paths.

For executing tests run `npm run test` or `yarn test`.

## Lint the app

For executing linters run `npm run lint` or `yarn lint`.

## Auth

For detailed documentation see [the auth docs](./AUTH.md).

## Augmented Reality

For detailed documentation see [the ar docs](./AR.md).
