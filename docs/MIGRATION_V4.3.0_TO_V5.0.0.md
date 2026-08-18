# Smart Village App v4.3.0 to v5.0.0 Migration Guide

## 1. Purpose, scope, and release status

This guide explains how to migrate a tenant or release branch of Smart Village App from the
`v4.3.0` codebase to `v5.0.0`. It covers the mobile application, Main-Server configuration, and
external service contracts that must be considered together during the migration.

In this guide, a *tenant branch* means a municipality- or deployment-specific branch that keeps
its own branding, application identifiers, navigation, and remote configuration on top of the
shared Smart Village App codebase.

Reference points used while preparing this guide:

- Mobile starting tag: `v4.3.0` / `c14bbad7e708a34f3c931e87d7d26f98e288f37b`
  (4 May 2026)
- Reviewed `master` snapshot: `5916e8c546c3e5bc8cbfaa9ad8d35d0f72fca981`
  (18 August 2026)
- Reviewed range: 284 commits and changes in 666 application-relevant files
- Main-Server comparison baseline: `5b4ba192705c3e1c8cb269bdaf301ea1fc5c43f0`
  (4 May 2026)
- Reviewed remote Main-Server `saas` head: `04d9eb41f2691c257aa7f4cd131b29eb3c84f346`
  (10 August 2026)

### 1.1. The `v5.0.0` tag is the migration source of truth

At the time of writing, `v5.0.0` has not been released and the tag does not exist yet. The reviewed
`master` commit is therefore a development snapshot, not the final migration target.

The intended release process is:

1. Complete the remaining v5 changes on `master`.
2. Update the application version, templates, changelog, and build configuration.
3. Pass the release quality gates and create the official `v5.0.0` tag.
4. Merge the `v5.0.0` tag, rather than a moving `master` branch, into each tenant/release branch.
5. Resolve tenant-specific configuration, build new native binaries, and publish the new tenant
   version.

Before the tag exists, a fixed release-candidate commit may be used for testing. It must not be
treated as the final production migration source. Once the tag is published, this guide should be
updated with the tagged commit SHA and any changes made after the reviewed snapshot.

## 2. Executive summary

The most important outcomes of the migration are:

1. This is not a JavaScript-only or OTA-only update. The project moves from Expo 54 to 57 and from
   React Native 0.81.5 to 0.86.2. It also adds native dependencies and a local iOS module. New iOS
   and Android binaries are required.
2. The BUS module has a breaking configuration and transport change. The old `settings.busBb`
   Apollo/GraphQL integration is replaced by `settings.bus` and a live REST/proxy API.
   `federalState` is now required on BUS requests.
3. No new mandatory Main-Server database migration was identified for the GraphQL queries used by
   the reviewed v5 mobile code. The required GenericItem and Category fields already existed in the
   Main-Server baseline reviewed for v4.3.0.
4. Main-Server content changes are still mandatory. At minimum, a versioned `globalSettings`
   StaticContent record compatible with `5.0.0` must be prepared. Existing 4.3.x records must be
   retained for older clients.
5. Accessibility, dark mode, and Participation Projects are configuration-driven. They are not
   enabled automatically and must be introduced deliberately through `globalSettings`,
   `tabNavigation`, other static content, and the required data.
6. The highest merge-conflict risk is in `app.json`, `eas.json`, their template files,
   `package.json`, `yarn.lock`, the legacy `src/config/colors.js`, and tenant-specific navigation or
   static content.

## 3. Platform and dependency changes

| Area | v4.3.0 | Reviewed v5 target | Migration impact |
| --- | --- | --- | --- |
| Node.js | 20.19.4 | 22.13.0 | Align local development, CI, and EAS |
| Yarn | 1.22.22 | 1.22.22 | Unchanged; generate the lockfile with Yarn 1 |
| Expo | 54.0.34 | 57.0.14 | Clean prebuild and new development/production builds required |
| React Native | 0.81.5 | 0.86.2 | Retest native behavior and the supported device matrix |
| React | 19.1.0 | 19.2.3 | Keep React and the test renderer on compatible versions |
| TypeScript | 5.9.2 | 6.0.3 | Recheck tenant-specific type errors |
| Reanimated | 4.1.1 | 4.5.1 | Keep it paired with `react-native-worklets` 0.10.1 |
| Navigation | Direct `@react-navigation/*` imports | `expo-router` entry points | Do not restore old imports or direct packages |
| File system | Primarily legacy API | `File`, `Directory`, `Paths`, `expo/fetch` | Retest upload, AR download, and wallet sharing |
| Carousel | `react-native-snap-carousel` | `react-native-reanimated-carousel` | Retest sizing, autoplay, reduced motion, and accessibility |
| Chat | GiftedChat 2.8.1 plus patch | GiftedChat 3.4.0 | Message dates and matcher/action APIs changed |

Official upgrade references:

- [Expo SDK 55 release notes](https://expo.dev/changelog/sdk-55)
- [Expo SDK 56 release notes](https://expo.dev/changelog/sdk-56)
- [Expo Router SDK 55 to 56 migration](https://docs.expo.dev/router/migrate/sdk-55-to-56/)
- [Expo SDK 57 release notes](https://expo.dev/changelog/sdk-57)

### 3.1. Critical platform considerations

- Expo SDK 55 and later no longer support the Legacy Architecture. Remove a remaining
  `newArchEnabled: false` setting from tenant branches and replace native packages that depend on
  the old architecture.
- Expo SDK 56 raises the minimum iOS version to 16.4 and requires Xcode 26.4. The existing
  `LSMinimumSystemVersion: "12.0"` value in `app.json` does not guarantee the generated deployment
  target. Verify the generated Xcode project and the resulting App Store device coverage.
- Application code should no longer import directly from `@react-navigation/*` after the SDK 56
  migration. The reviewed v5 target uses the Expo Router entry points and removes those direct
  dependencies.
- The SDK 57 Hermes/Reanimated memory regression was fixed in `expo@57.0.9` and React Native
  0.86.2. The reviewed target uses `expo@57.0.14` and React Native 0.86.2. Do not resolve merge
  conflicts by downgrading to an earlier SDK 57 combination.
- With SDK 57, `expo prebuild` cleans and regenerates native projects by default. In this repository,
  `ios/` and `android/` are generated directories and are ignored by Git.
- `expo-speech`, `react-native-color-matrix-image-filters`, the Reanimated/Worklets updates, and
  `modules/on-off-switch-labels` make a store binary update mandatory.

## 4. Release tag and branch migration workflow

### 4.1. Creating the official release tag

This step is performed once by the v5 release maintainers, after the final release commit has
passed all required checks.

Before creating the tag, verify that:

- `package.json.version` and `app.json.expo.version` are `5.0.0`;
- templates and generated configuration are synchronized;
- `CHANGELOG.md` contains the v5 release notes;
- the Main-Server and BUS production dependencies are ready;
- the required lint, test, Expo Doctor, native build, and upgrade tests pass;
- the selected `master` commit is the exact code intended for every v5 migration.

Create and publish an annotated tag:

```sh
git switch master
git pull --ff-only
git tag -a v5.0.0 -m "Smart Village App v5.0.0"
git push origin v5.0.0
```

Do not move or recreate the published `v5.0.0` tag. If the tagged release is invalid, fix it with a
new patch release and a new tag.

### 4.2. Inventory before migrating a tenant branch

Record the following for every tenant/release branch:

- the last working commit SHA and the version/build numbers currently in the stores;
- application name, slug, scheme, bundle/package ID, EAS project ID, update URL, Apple Team ID,
  App Store ID, `buildNumber`, `versionCode`, and `otaVersion` from `app.json`;
- icon, splash, notification icon, and Firebase `google-services.json` configuration;
- tenant-specific navigation and `globalSettings`/static content;
- tenant-specific colors from the old `src/config/colors.js`;
- native config plugins and tenant-specific patch files;
- Main-Server, BUS proxy, SUE, Volunteer, Consul, chatbot, and other external endpoints;
- a device running the published v4.3.0 build and, if possible, a representative test account.

Never commit secret material while resolving migration conflicts. In particular, do not add
`src/config/secrets.js`, local `.env.*` files, keys, keystores, or certificates.

### 4.3. Merging `v5.0.0` into a tenant/release branch

Once the tag has been published, use the immutable tag as the merge source:

```sh
git fetch --tags
git switch <tenant-release-branch>
git merge v5.0.0
```

Recommended sequence:

1. Verify that the tenant branch has a clean working tree.
2. Record the pre-merge tenant commit SHA.
3. Run the theme migration in dry-run mode.
4. Fetch and merge the official `v5.0.0` tag.
5. Resolve conflicts according to the rules below.
6. Perform a clean dependency installation from the final lockfile.
7. Prepare the v5 Main-Server staging static content.
8. Run a clean prebuild and create new development builds.
9. Test both a fresh install and an in-place upgrade from the published v4.3.0 binary.
10. Set the final tenant build numbers and create production builds.

If migration work starts before the tag exists, use a documented release-candidate SHA for testing
only. Repeat the final merge verification against `v5.0.0` when the tag is available.

### 4.4. Merge conflict rules

#### `app.json`

Preserve these tenant-specific values:

- `name`, `slug`, `scheme`, and `owner`;
- `extra.eas.projectId` and its matching `updates.url`;
- iOS bundle ID, Apple Team ID, App Store ID, and build number;
- Android package ID, version code, and `googleServicesFile`;
- tenant icons, primary color, and orientation preference;
- tenant-specific permission descriptions.

Adopt these structural changes from v5:

- the Expo SDK 57-compatible plugin list;
- the `expo-router` and `expo-status-bar` plugins;
- `@react-native-community/datetimepicker`, `expo-image`, `expo-sharing`, and the other required
  native plugin registrations;
- dark splash-screen configuration;
- the notification config-plugin approach;
- `runtimeVersion.policy: "appVersion"` and the corresponding update configuration;
- required blocked permissions.

Do not blindly accept demo values for `buildNumber`, `versionCode`, `otaVersion`, the EAS project
ID, or bundle/package identifiers.

#### `package.json` and `yarn.lock`

Treat the Expo/React Native dependency set as one unit and adopt it from v5. In particular, do not
downgrade or restore:

- incompatible combinations of `expo`, `react-native`, `react`, `react-dom`, and Jest;
- the `react-native-reanimated` and `react-native-worklets` pair;
- pre-migration React Navigation entry points;
- an incompatible `react-native-gesture-handler` version;
- `expo-constants` or other packages covered by `resolutions` pins;
- GiftedChat 2.8.1 or its removed local patch;
- `react-native-snap-carousel` in place of `react-native-reanimated-carousel`.

Do not merge `yarn.lock` line by line. Resolve the final `package.json`, regenerate or install the
lockfile with Yarn 1, and verify it with the same Node and Yarn versions used by CI.

#### Colors and dark mode

The v5 code replaces `src/config/colors.js` with the semantic light/dark palette structure in
`src/config/colors.ts`. Preserve tenant branding by using the recorded pre-merge commit:

```sh
yarn theme:migrate:dry --source-ref <pre-merge-sha>
yarn theme:migrate --source-ref <pre-merge-sha> --output /tmp/globalSettings-theme.json
```

Review the dry-run output before generating the final values. Evaluate the generated colors for
both `src/config/colors.ts` and
`globalSettings.settings.accessibility.themePalettes` on Main-Server. Preserving the light theme is
not sufficient; the dark palette must also pass contrast checks.

See [Legacy app color migration](./theme-color-migration.md),
[Accessibility Settings](./accessibility-settings.md), and
[App design system dark-mode overrides](./APP_DESIGN_SYSTEM_DARK_MODE.md).

#### Navigation and route names

- New BUS navigation uses `BusIndex`, `BusCategory`, and `BusDetail`.
- `BBBUSIndex` and `BBBUSDetail` remain as temporary fallback routes. New or updated static content
  should use the new names.
- Participation Projects require the `ParticipationProjectHome` screen value and the
  `ParticipationProjects` root route name.
- The `Detail` screen now resolves bookmark and share actions internally by content type. Restoring
  old tenant-specific header options may render duplicate actions.
- Configure tab colors and icon fill behavior through the dark-mode-aware `tabNavigation` static
  content.

## 5. Application behavior and remote configuration

### 5.1. Versioned `globalSettings`

The application requests Main-Server content using the application version:

```graphql
publicJsonFile(name: "globalSettings", version: "5.0.0") {
  content
}
```

Main-Server returns the highest content version that is less than or equal to the requested version.
If none exists, it falls back to an unversioned record. Therefore:

- create a new `5.0.0` StaticContent record named `globalSettings`;
- do not modify or remove the existing 4.3.x records;
- if a release-candidate application version is used, explicitly test how Main-Server selects the
  content version;
- do not publish a v5 binary that exposes BUS before the v5 content is available;
- provide a complete nested payload. The application performs a top-level merge; it does not deep
  merge the nested `settings` object;
- test both a fresh install and an upgrade that already has cached settings in AsyncStorage.

Example skeleton for newly introduced settings:

```json
{
  "settings": {
    "bus": {
      "uri": "https://bus-proxy.example.org",
      "apiKey": "<publishable-client-key>",
      "areaId": "<political-area-id>",
      "federalState": "BB",
      "initialFilter": ["LIFE_SITUATIONS", "SEARCH", "ATOZ"],
      "lifeSituationsRootSearchWord": "Lebenslagen für Bürgerinnen und Bürger"
    },
    "accessibility": {
      "enabledFeatures": {
        "settingsEntry": true,
        "headerEntry": true,
        "textScaling": true,
        "theming": true,
        "boldText": true,
        "isGrayscaleEnabled": true,
        "highContrast": true,
        "reduceMotion": true,
        "reduceTransparency": true,
        "switchLabels": true,
        "readAloud": true
      },
      "defaults": {
        "textScaleLevel": 2,
        "themeMode": "system",
        "boldTextEnabled": false,
        "isGrayscaleEnabled": false,
        "highContrastEnabled": false,
        "reduceMotionEnabled": false,
        "reduceTransparencyEnabled": false
      },
      "themePalettes": {
        "light": {},
        "dark": {}
      }
    },
    "bookmarkIcon": "heart",
    "defectReports": {
      "withoutLocation": false
    },
    "feedback": {
      "includeSystemInformation": false,
      "includeScheduledNotifications": false
    },
    "locationService": {
      "tours": {
        "initialMapMinZoom": 14
      }
    },
    "news": {
      "listDateFormat": "YYYY-MM-DD HH:mm:ss Z",
      "detailDateFormat": "YYYY-MM-DD HH:mm:ss Z"
    },
    "showDistanceDirection": {
      "poi": false,
      "tour": false
    },
    "webView": {
      "isIncognito": true,
      "mobileUserAgent": {
        "ios": "",
        "android": ""
      }
    }
  },
  "appDesignSystem": {}
}
```

This is only a skeleton of newly introduced fields. Preserve existing tenant configuration such as
`navigation`, `sections`, `filter`, `waste`, `widgets`, `hdvt`, `whistleblow`, and other top-level
properties.

### 5.2. BUS breaking migration

Legacy configuration:

```json
{
  "settings": {
    "busBb": {
      "uri": "<old-graphql-endpoint>",
      "v2": {
        "areaId": "..."
      }
    }
  }
}
```

New configuration:

```json
{
  "settings": {
    "bus": {
      "uri": "https://bus-proxy.example.org",
      "apiKey": "<publishable-client-key>",
      "areaId": "...",
      "federalState": "BB",
      "initialFilter": ["LIFE_SITUATIONS", "SEARCH", "ATOZ"]
    }
  }
}
```

Required proxy contract:

- accept `Accept: application/json`, `Accept-Language: de-DE`, and
  `x-federal-state: <two-letter-code>` on all requests;
- accept `x-api-key` when authentication is enabled;
- provide `political-area/:id` and `political-area/search`;
- provide `pst/find` and `pstExtended/find` for search;
- provide `pstExtended/:id` for details, with a `pst/:id` fallback for 404, 405, or 501;
- provide the life-situations tree through `pstCategory/find`;
- provide `ou/findByCompetence`, `person/find`, and `form/find`;
- support `limit`/`offset` pagination and either a `total-item-count` response header or a
  `totalCount` payload field;
- respond within the mobile client's 15-second timeout.

BUS no longer reads data from the Smart Village Main-Server GraphQL API. Adding a BUS schema to
Main-Server is therefore not a replacement for the proxy. The live proxy must be available from
mobile devices before the module is enabled.

Because `apiKey` is delivered to the client through `globalSettings`, it cannot be treated as a
server secret. Use a publishable, scoped key and implement rate limiting, logging, rotation, and
tenant/state restrictions on the proxy.

### 5.3. Accessibility and dark mode

New accessibility features remain disabled unless explicitly enabled in
`globalSettings.settings.accessibility.enabledFeatures`.

- `settingsEntry` and `headerEntry` control separate entry points.
- `readAloud` is a global feature gate, not an end-user preference toggle.
- When `theming` is enabled, verify the default `themeMode` and both palettes.
- Test `switchLabels` with both the iOS system setting and the application preference.
- If critical color pairs do not meet a 4.5:1 contrast ratio, the application falls back to its
  built-in colors.
- User preferences persist in AsyncStorage, so an in-place upgrade test is required.

Tab bar colors do not come from the `globalSettings` palette. They are resolved from
`themeColors.light` and `themeColors.dark` in the `tabNavigation` static content.
`tabBarIconFillOnFocus` may be set globally or overridden per tab.

`appDesignSystem` sections may add recursive `dark` overrides alongside shared/light values.
Carousel button styles use the same `dark` override contract.

### 5.4. Participation Projects

Adding a navigation entry alone is not sufficient. Prepare the following on Main-Server:

- GenericItem records with `genericType: "ParticipationProject"`;
- category relationships that describe the participation type, preferably with stable `position`
  values;
- JSON StaticContent named `participationProjectHome`;
- optional JSON StaticContent named `participationProjectHomeCarousel`;
- optional HTML StaticContent named `participationProjectHomeText`;
- a drawer or tab navigation entry;
- `locations.geoLocation` or `addresses.geoLocation` for map display;
- `payload.status` and optional color/label fields for status filtering;
- date fields when projects can be added to the calendar.

The current Main-Server `createGenericItem` mutation accepts a custom `genericType` string and the
required nested fields. See the
[Participation Project Module Integration Guide](./PARTICIPATION_PROJECT.md) for the detailed
mapping and static content examples.

Known limitation: `ParticipationProject` is not currently included in the Main-Server
`GenericItem::GENERIC_TYPES` list. List, detail, bookmark, and search operations still work, but the
existing automatic GenericItem push flow skips unknown types. If Participation Project push
notifications are part of the v5 scope, extend the Main-Server type list, push configuration, and
I18n support.

### 5.5. Other remote-configuration changes

| Feature | New or important field | Backend impact |
| --- | --- | --- |
| News date format | `settings.news.listDateFormat`, `detailDateFormat` | No schema change; must match incoming timestamps |
| Defect report without location | `settings.defectReports.withoutLocation` | When `true`, the mutation omits empty `addresses`; backend must accept it |
| Defect category order | GraphQL `Category.position` | Field already exists; populate it in CMS/import data |
| Feedback diagnostics | `settings.feedback.includeSystemInformation`, `includeScheduledNotifications` | Review opt-in, retention, and email processing |
| WebView | `settings.webView.isIncognito`, `mobileUserAgent.ios/android` | No Main-Server schema change |
| Bot-controlled WebView | Route parameter `hasBotControl` | Update static navigation/widget parameters |
| POI/Tour direction | `settings.showDistanceDirection.poi/tour` | Requires coordinates; no schema change |
| Tour stop initial zoom | `settings.locationService.tours.initialMapMinZoom` | Valid range 0–18; invalid values fall back to 14 |
| Parking availability | POI `payload.freeStatusUrl` and external feature payload | Main-Server carries the URL/payload; verify the external endpoint |
| Bookmark icon | `settings.bookmarkIcon` | No Main-Server schema change |
| SUE version label | `app.json.expo.extra.sueVersion` | Build-time value, not server configuration |

Feedback diagnostics are not sent without user consent. Before enabling them, review privacy text,
retention periods, recipient email templates, and access permissions for GDPR compliance.

## 6. Main-Server migration decision

### 6.1. Backend schema changes that are not mandatory for the reviewed v5 client

The following GraphQL fields already exist in the Main-Server baseline from 4 May 2026:

- `Category.position`;
- GenericItem fields including `updatedAt`, `description`, `teaser`, `addresses`, `locations`,
  `openingHours`, `webUrls`, `settings`, and `dataProvider.notice`;
- date fields including `dateStart`, `dateEnd`, `timeStart`, `timeEnd`, `timeDescription`, and
  `weekday`;
- GenericItem filters for `genericType`, IDs, category, and search;
- versioned StaticContent lookup through `publicJsonFile(name, version)`.

Consequently, the reviewed v5 mobile queries do not by themselves require a new Main-Server column
or GraphQL type. Verify that the deployed production Main-Server is at least compatible with this
baseline by running contract smoke tests. Do not infer compatibility from a deployment name or date.

### 6.2. Mandatory Main-Server operational changes

At minimum:

1. Create a `5.0.0` JSON StaticContent record named `globalSettings`.
2. Retain the versioned 4.3.x content records for existing clients.
3. Prepare v5-compatible `tabNavigation`, carousel, introductory HTML, and other static content for
   every enabled module.
4. If Participation Projects are enabled, provide the GenericItem/import data and category
   relationships.
5. Populate `position` values when category ordering is required.
6. If feedback diagnostics are enabled, update recipient email templates and the privacy/retention
   policy.
7. Record the exact production Main-Server deployment SHA in the release notes.

### 6.3. Conditional or recommended Main-Server code changes

- Commit `04d9eb41` (`fix(mail): expose feedback metadata in templates`) or an equivalent change
  exposes `email` directly to feedback email templates, makes missing values visible, and keeps
  compatibility with nested payloads. This is required if new feedback templates depend on those
  values.
- If automatic Participation Project push notifications are required, extend
  `GenericItem::GENERIC_TYPES`, push configuration, and I18n support.
- Other Main-Server survey, waste, TMB, Redis, and importer changes from May to August are not
  general prerequisites for the v5 mobile binary. Deploy them through their own migration plans
  when the corresponding features are enabled.

The reviewed Main-Server repository does not use semantic release tags. Identify the deployed
server by its commit SHA. During the review, the local `saas` branch was 99 commits behind
`origin/saas`, demonstrating why a branch name alone is not evidence of production compatibility.

### 6.4. Suggested read-only contract smoke queries

```graphql
query V5GlobalSettings {
  publicJsonFile(name: "globalSettings", version: "5.0.0") {
    content
  }
}
```

```graphql
query V5ParticipationProjects {
  genericItems(genericType: "ParticipationProject", limit: 2) {
    id
    genericType
    title
    teaser
    description
    updatedAt
    categories { id name position }
    addresses { city street zip geoLocation { latitude longitude } }
    locations { name geoLocation { latitude longitude } }
    dates { dateStart dateEnd timeStart timeEnd timeDescription weekday }
    openingHours { dateFrom dateTo timeFrom timeTo open useYear description }
    webUrls { url description }
    payload
  }
}
```

```graphql
query V5Search($query: String!) {
  search(query: $query, filter: [generic_item]) {
    id
    recordType
  }
}
```

These queries validate schema and data readiness without writing to production.

## 7. Build, versioning, tagging, and OTA

### 7.1. Known release blockers in the reviewed snapshot

At the time of review:

- `package.json.version` is still `4.3.0`;
- `app.json.expo.version` is still `4.3.0`;
- the `v5.0.0` tag and the v5 `CHANGELOG.md` section do not exist yet, as expected before the
  release is finalized;
- `app.json.erb.tmpl` is not synchronized with `app.json` for the SDK 57 plugins and dark splash
  configuration, and its SUE version is still `1.0.0`;
- `eas.json.erb.tmpl` uses Node 20.19.4 while `eas.json` uses Node 22.13.0;
- `.github/scripts/eas-update.js` does not provide the `eas update --environment ...` argument
  required after the SDK 55 update;
- `APP_DESIGN_SYSTEM_DARK_MODE.md` links to a missing
  `docs/app-design-system-dark-mode.json` file.

Resolve these items before running the final template automation, creating the `v5.0.0` tag, or
starting a production release.

### 7.2. Version fields and tag ordering

Update at least the following in the final release commit:

- `package.json.version` to `5.0.0`;
- `app.json.expo.version` to `5.0.0`;
- the iOS `buildNumber` and Android `versionCode` for each tenant build;
- `extra.otaVersion` according to the tenant policy;
- `app.json.erb.tmpl` and `eas.json.erb.tmpl`;
- `CHANGELOG.md`.

The `v5.0.0` tag must point to the final release commit that contains these values. Create the tag
only after the commit passes the release gates. Tenant/release branches are then migrated by merging
that tag.

Because `runtimeVersion.policy` is `appVersion`, `5.0.0` creates an OTA runtime separate from
4.3.0. A v4.3.0 binary cannot receive v5 native code through OTA. Publish the first v5 store binary
before using OTA for subsequent JavaScript-only fixes on the same `5.0.0` runtime and the correct
production channel.

EAS has `autoIncrement: false`, so build numbers must be incremented explicitly.

### 7.3. Clean installation and native build

Recommended verification sequence:

```sh
nvm use
yarn install --frozen-lockfile
npx expo-doctor@latest
yarn lint
yarn test
npx expo prebuild --clean --no-install
yarn build:dev-ios
yarn build:dev-android
```

`prebuild --clean` regenerates the local `ios/` and `android/` directories. Move tenant-specific
manual native changes into config plugins or preserve them separately before running it. The
generated native directories are ignored by Git in this repository, so those changes cannot be
recovered from a normal source diff.

### 7.4. Quality-gate status of the reviewed snapshot

The local review on 18 August 2026 found three existing infrastructure issues:

- `yarn lint` repeatedly emits parser warnings while `@typescript-eslint/parser` tries to parse
  Flow syntax from React Native and does not complete in a reasonable time. Resolve the
  ESLint/parser/import-resolver compatibility before release.
- `yarn test --runInBand` completed 86 of 113 suites. The remaining 27 suites stopped before
  executing because the intentionally untracked `src/config/secrets.js` file was unavailable. The
  runnable suites passed 374 tests and 2 snapshots. Provide a secret-free Jest module mock or safe
  test-time provisioning in CI; never commit a real secret file.
- `npx expo-doctor@latest` could not start its project checks because evaluating Expo config reached
  the same missing `src/config/secrets.js` dependency. Ensure CI can evaluate Expo config through
  safe test-time provisioning.

These results are not caused by this documentation change. The v5 release candidate must not be
approved until the mandatory quality gates are fully green.

## 8. Test and acceptance matrix

### 8.1. Required automation

- `yarn lint`
- `yarn test`
- `npx expo-doctor@latest`
- clean iOS prebuild and build
- clean Android prebuild and build

For the accessibility changes, also run:

- `yarn test:accessibility`
- `yarn test:accessibility:axe`
- `yarn a11y:coverage`

### 8.2. Installation and upgrade scenarios

- fresh v5 installation with empty AsyncStorage;
- direct in-place upgrade from the published v4.3.0 binary to the v5 binary;
- signed-in and signed-out users;
- existing bookmarks, wallet entries, accessibility preferences, and personalized tiles;
- first launch while online, offline, and while Main-Server is unavailable;
- cached legacy `globalSettings` followed by the new 5.0.0 content;
- cold start in light, dark, and system theme modes;
- no OTA, downloading OTA, OTA ready, and reload flows.

### 8.3. Module smoke tests

| Area | Acceptance criteria |
| --- | --- |
| BUS | Area search, initial area, life situations, A–Z, text search, pagination, detail, and sharing work; every request contains the correct state header |
| Main GraphQL | News, events, POIs, tours, categories, and generic item queries complete without schema errors |
| Participation | Home, category, featured/all sections, status filters, map/list, detail, bookmark, share, search, and add-to-calendar work |
| Theme | App shell, tabs/drawer, modals, forms, maps, calendar, WebView loading, SUE, and static carousels are checked in both themes |
| Accessibility | Text scaling, bold text, grayscale, high contrast, reduced motion/transparency, switch labels, and read aloud are tested on real devices |
| Upload | Volunteer calendar/post/email, Consul attachments, wallet card sharing, and AR download/delete work |
| Chat/carousel | GiftedChat messages, quick replies, attachments, links, carousel autoplay/pause, and single-image height work |
| Feedback | Diagnostic checkbox defaults to off; no device information is sent without opt-in; expected email/payload is produced after opt-in |
| SUE/Defect | Missing/partial/complete SUE configuration, reports with and without location, and category position ordering work |
| WebView | Incognito precedence, platform user agent, bot control, external browser, and modal browser behavior work |
| Maps | POI/Tour direction card, TourStop zoom/bounds, parking status, and invalid coordinates are handled |
| Push | Android cold start, iOS foreground/background, deep links, and notification categories work |

### 8.4. Pre-production monitoring

- verify the Sentry release/environment values and source-map upload;
- monitor GraphQL schema errors and `publicJsonFile` not-found errors;
- monitor BUS proxy 4xx, 5xx, timeout rates, and state distribution;
- monitor Main-Server feedback/AppUserContent email errors;
- monitor memory, startup, carousel, and chat crashes, with particular attention to
  Reanimated/Worklets;
- support v4.3.0 and v5.0.0 clients concurrently during staged rollout.

## 9. Rollback plan

1. Retain the versioned 4.3.x `globalSettings`; older clients continue to request it.
2. If the v5 remote configuration is invalid, correct the `5.0.0` StaticContent with a safe,
   minimal payload. A `5.0.1` record is not selected by a client requesting `5.0.0`.
3. For a JavaScript-only issue, publish an OTA hotfix to the same 5.0.0 runtime and production
   channel.
4. For a native dependency or native configuration issue, publish a new store binary and, when
   necessary, a new app/runtime version.
5. To disable BUS, remove its navigation entry and related home/service links together. Removing
   only the configuration key can leave inaccessible or broken routes.
6. To disable Participation Projects, remove their navigation/static content. The GenericItem data
   does not have to be deleted immediately.
7. Follow the Main-Server repository's backup and rollback procedure for server-side migrations.
   A mobile rollback does not authorize a backend schema downgrade.

Do not move the published `v5.0.0` tag during rollback. A corrected source release must use a new
semantic version and a new immutable tag.

## 10. Final checklist for each tenant/release branch

- [ ] The official `v5.0.0` tag exists and its commit SHA is recorded.
- [ ] The migration merge source is `v5.0.0`, not a moving `master` branch.
- [ ] The pre-merge tenant commit SHA is recorded.
- [ ] App identity, EAS project ID, update URL, Firebase configuration, icons, and build numbers are preserved.
- [ ] Node 22.13.0 and Yarn 1.22.22 are used locally and in CI/EAS.
- [ ] The Expo/React Native dependency set installs cleanly from the lockfile.
- [ ] Legacy navigation packages and `react-native-snap-carousel` were not restored.
- [ ] The theme migration dry run was reviewed and the light/dark palettes were approved.
- [ ] The `5.0.0` `globalSettings` StaticContent is ready in staging and production.
- [ ] Existing versioned `globalSettings` records are retained.
- [ ] If BUS is enabled, `settings.bus`, the proxy contract, and `federalState` are ready.
- [ ] If Participation Projects are enabled, data/importer, static content, and navigation are ready.
- [ ] Privacy and email processing are approved before feedback diagnostics are enabled.
- [ ] Template files match the real application and EAS configuration.
- [ ] `package.json`, `app.json`, `buildNumber`, and `versionCode` contain final values.
- [ ] Expo Doctor, lint, tests, accessibility checks, and both platform development builds pass.
- [ ] Fresh-install and v4.3.0-to-v5.0.0 upgrade tests pass.
- [ ] OTA channel and runtime behavior are verified.
- [ ] Main-Server and BUS deployment SHAs are included in the release notes.
- [ ] Staged rollout, monitoring, and rollback owners are identified.
