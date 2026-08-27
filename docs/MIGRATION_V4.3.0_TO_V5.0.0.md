# Smart Village App v4.3.0 to v5.0.0 Migration Guide

## 1. Purpose, scope, and release status

This guide explains how to migrate a tenant or release branch of Smart Village App from the
`v4.3.0` codebase to `v5.0.0`. It covers the mobile application, Main-Server configuration, and
external service contracts that must be considered together during the migration.

In this guide, a _tenant branch_ means a municipality- or deployment-specific branch that keeps
its own branding, application identifiers, navigation, and remote configuration on top of the
shared Smart Village App codebase.

Reference points used while preparing this guide:

- Mobile starting tag: `v4.3.0` / `c14bbad7e708a34f3c931e87d7d26f98e288f37b`
  (4 May 2026)
- Reviewed `master` snapshot: `47508475dfe22661e24c0f76f155c0c52b8481c7`
  (27 August 2026)
- Reviewed range: 501 commits and changes in 934 files
- Main-Server comparison baseline: `5b4ba192705c3e1c8cb269bdaf301ea1fc5c43f0`
  (4 May 2026)
- Reviewed remote Main-Server `saas` head: `d3c803683d6b041421df656644c610ede61878c5`
  (26 August 2026)

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
3. Authenticated profile users can create, edit, list, and remove their own news, events, and POIs;
   the profile noticeboard flow also uses the new user-auth scope. Enabling this requires more than
   adding tiles: deploy the `/member` user/data-provider contract, provision the correct roles,
   provide three profile StaticContent records, and verify the member and user GraphQL tokens.
4. The GraphQL mutations needed for profile content already exist in the reviewed Main-Server
   baseline and do not require a new schema migration. Local waste reminders do require Main-Server
   database and REST-contract changes. Deploy the `local_coverage_until` and `reminder_slot_id`
   columns and the slot-identity index before enabling flexible reminders.
5. Main-Server content changes are still mandatory. At minimum, a versioned `globalSettings`
   StaticContent record compatible with `5.0.0` must be prepared. Existing 4.3.x records must be
   retained for older clients.
6. Accessibility, dark mode, Participation Projects, interactive floor plans, cache lifetimes,
   SUE internal-status presentation, feedback diagnostics, and flexible waste reminders are
   configuration-driven. Introduce them deliberately through `globalSettings`, module
   configuration, static content, and the required backend data.
7. Generic Item records can now become calendar events, and icon libraries can be selected globally
   or per configured tab/service tile. Both features depend on validated tenant configuration;
   Generic Item events additionally depend on complete, bounded datasets with usable dates.
8. Profile header login now uses `expo-auth-session`, SecureStore-backed token restoration, and a
   configurable OAuth endpoint set. Register the app redirect URI, use a public-client/PKCE setup,
   and test legacy, expired, invalid, and temporarily unrefreshable sessions.
9. Push navigation now handles foreground, background, and Android cold-start responses at the app
   root. Push producers must supply the supported `query_type`/`queryType` and `id` payload contract.
10. The highest merge-conflict risk is in `app.json`, `eas.json`, their template files,
    `package.json`, `yarn.lock`, the legacy `src/config/colors.js`, and tenant-specific navigation or
    static content.

## 3. Platform and dependency changes

| Area          | v4.3.0                                   | Reviewed v5 target                         | Migration impact                                                                                    |
| ------------- | ---------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Node.js       | 20.19.4                                  | 22.13.0                                    | Align local development, CI, and EAS                                                                |
| Yarn          | 1.22.22                                  | 1.22.22                                    | Unchanged; generate the lockfile with Yarn 1                                                        |
| Expo          | 54.0.34                                  | 57.0.14                                    | Clean prebuild and new development/production builds required                                       |
| React Native  | 0.81.5                                   | 0.86.2                                     | Retest native behavior and the supported device matrix                                              |
| React         | 19.1.0                                   | 19.2.3                                     | Keep React and the test renderer on compatible versions                                             |
| TypeScript    | 5.9.2                                    | 6.0.3                                      | Recheck tenant-specific type errors                                                                 |
| Reanimated    | 4.1.1                                    | 4.5.1                                      | Keep it paired with `react-native-worklets` 0.10.1                                                  |
| Navigation    | Direct `@react-navigation/*` imports     | Primarily `expo-router` entry points       | Do not restore removed navigation packages; review the temporary Floor Plan direct-import exception |
| File system   | Primarily legacy API                     | `File`, `Directory`, `Paths`, `expo/fetch` | Retest upload, AR download, and wallet sharing                                                      |
| Carousel      | `react-native-snap-carousel`             | `react-native-reanimated-carousel`         | Retest sizing, autoplay, reduced motion, and accessibility                                          |
| Chat          | GiftedChat 2.8.1 plus patch              | GiftedChat 3.4.0                           | Message dates and matcher/action APIs changed                                                       |
| Profile OAuth | No direct `expo-auth-session` dependency | `expo-auth-session` 57.0.7                 | Register the scheme redirect, verify the fixed OAuth endpoints, and upgrade-test stored sessions    |
| Rich text     | No `react-native-enriched` dependency    | `react-native-enriched` 0.4.0              | Rebuild native apps and test the content editor, keyboard, links, lists, and persisted HTML         |

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
- Application code should use the Expo Router navigation entry points after the SDK 56 migration.
  The reviewed Floor Plan/navigation helper and several new profile content screens/forms still
  import from `@react-navigation/native` or `@react-navigation/stack`, even though those packages
  are not declared directly. Align them with `expo-router/react-navigation` and
  `expo-router/js-stack` before release; do not rely silently on transitive packages or restore the
  removed direct dependencies.
- The SDK 57 Hermes/Reanimated memory regression was fixed in `expo@57.0.9` and React Native
  0.86.2. The reviewed target uses `expo@57.0.14` and React Native 0.86.2. Do not resolve merge
  conflicts by downgrading to an earlier SDK 57 combination.
- With SDK 57, `expo prebuild` cleans and regenerates native projects by default. In this repository,
  `ios/` and `android/` are generated directories and are ignored by Git.
- `expo-speech`, `react-native-color-matrix-image-filters`, the Reanimated/Worklets updates, and
  `modules/on-off-switch-labels` make a store binary update mandatory.
- `expo-auth-session` is now a direct dependency for profile header login. The configured OAuth
  client must accept `<app-scheme>://redirect`; do not treat a value shipped as `clientSecret` in
  `globalSettings` as confidential mobile-app secret material.
- `react-native-enriched` powers the news/event/POI rich-text editor. Keep version 0.4.0 in the v5
  dependency set, create clean native builds, and test it on both platforms with the production New
  Architecture configuration. A JavaScript-only OTA cannot introduce this dependency to a v4.3.0
  binary.

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
- existing waste reminder registrations, selected collection address, and push-token ownership;
- tenant cache policy and the `wasteTypes`, `floorPlan`, `feedbackContent`, and `tabNavigation`
  StaticContent records;
- Generic Item event sources and their expected type/status/date payloads;
- the global icon-family priority and any per-tab or per-service-tile `iconSet` overrides;
- profile OAuth client registration, redirect URI, scopes, endpoint base URL, and staged test
  accounts;
- `profileService`, `profileCreateContentServiceTop`, and
  `profileCreateContentServiceBottom` StaticContent, plus each tenant's editorial and noticeboard
  role assignments;
- representative profile users with a linked data provider and owned news/event/POI records for
  create, edit, hide/delete, and cross-provider authorization tests;
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
- `UIDesignRequiresCompatibility` and the final iOS compatibility policy;
- `runtimeVersion.policy: "appVersion"` and the corresponding update configuration;
- required blocked permissions, including removal of legacy Android read-media permissions.

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
- `react-native-snap-carousel` in place of `react-native-reanimated-carousel`;
- `react-native-enriched` 0.4.0 when profile content creation is enabled.

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
- Interactive floor plans use the `FloorPlan` route. Its default JSON StaticContent name is
  `floorPlan`; a navigation item may override it with `staticJsonName`.
- The `Detail` screen now resolves bookmark and share actions internally by content type. Restoring
  old tenant-specific header options may render duplicate actions.
- Configure tab colors and icon fill behavior through the dark-mode-aware `tabNavigation` static
  content.
- Dynamic tabs and service tiles may set `iconSet` to force one supported icon family. Preserve
  tenant icon names and overrides together; an unresolved name renders a question-mark fallback.
- `getScreenOptions` can expose profile login/logout through `withProfile`, but the reviewed default
  stack does not currently enable it. Enabling the header action therefore requires an explicit
  navigation-code decision in addition to `settings.profile`.
- The default stack now registers `ProfileContent`, `ProfileCreateContentForm`,
  `ProfileCreateContentHome`, and `ProfileSettings`. Preserve these routes when resolving tenant
  stack conflicts. Their visibility and authorization must come from profile state, roles, and
  Main-Server ownership checks, not by removing the routes for unauthorized users.

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
    "cache": {
      "general": "endDay",
      "apollo": "endDay",
      "home": "endDay",
      "sue": 14
    },
    "defectReports": {
      "withoutLocation": false
    },
    "eventCalendar": {
      "genericItemEventSources": [
        {
          "genericType": "ParticipationProject",
          "filterTypes": ["Veranstaltung"],
          "filterStatuses": ["active", "announced"]
        }
      ]
    },
    "feedback": {
      "htmlContentName": "feedbackContent",
      "includePermissions": false,
      "includePushInformation": false,
      "includeSystemInformation": false,
      "includeWasteConfiguration": false,
      "includeWasteDisruptionNotifications": false,
      "includeWasteReminderScheduling": false
    },
    "iconFamilies": ["tabler", "ionicons"],
    "locationService": {
      "tours": {
        "initialMapMinZoom": 14
      }
    },
    "news": {
      "listDateFormat": "YYYY-MM-DD HH:mm:ss Z",
      "detailDateFormat": "YYYY-MM-DD HH:mm:ss Z"
    },
    "profile": {
      "clientId": "<public-mobile-client-id>",
      "clientSecret": "",
      "scopes": ["openid", "profile", "email"],
      "serverUrl": "https://identity.example.org/realms/example/protocol/openid-connect",
      "usePKCE": true
    },
    "showDistanceDirection": {
      "poi": false,
      "tour": false
    },
    "sue": {
      "showInternalPendingStatus": true
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

Grayscale no longer means only desaturating a few built-in colors. When enabled, v5 derives a
luminance-preserving grayscale palette for light and dark themes, recursively transforms color
values in remote `appDesignSystem` configuration, filters images on iOS and Android, and adds a
descendant filter on Android as a safeguard. Validate tenant logos, remote images, gradients,
overlays, configured component colors, and contrast in both themes; testing the settings modal
alone is not sufficient.

The home widget grid is now responsive to safe-area width, system font scale, and the app's text
scale. At the standard effective text scale (`<= 1.1`) it can use up to five columns with a minimum
64-point item width; at larger scales it reduces and balances columns and may switch widgets to
their list presentation. Do not carry forward tenant assumptions that widgets always render three
per row. Test every supported device width, orientation, widget count, and text-scale level.

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

`payload.type` is now also used as the preferred human-readable participation type in bookmark and
share action labels. Keep it populated and localized; the first category and the route title are
only fallbacks. The default status selection includes `active`, and the map shows projects that
match any selected status and have valid coordinates.

### 5.5. Configurable cache expiration

Cache lifetime is controlled by `globalSettings.settings.cache`:

```json
{
  "settings": {
    "cache": {
      "general": "endDay",
      "apollo": 6,
      "home": "endOfHour",
      "sue": 14
    }
  }
}
```

Numeric values are hours. String values may use Moment-style end-of-period aliases such as
`endDay`, `endOfDay`, `endOf('day')`, `endWeek`, `endMonth`, or `endYear`. Supported units are
`hour`, `day`, `week`, `isoWeek`, `month`, `quarter`, and `year`. A value of `0` expires the scope
immediately and should normally be limited to testing.

| Scope     | Affects                                                            | Fallback               |
| --------- | ------------------------------------------------------------------ | ---------------------- |
| `general` | Default React Query cache and all scopes without a valid override  | End of the current day |
| `apollo`  | Persisted Apollo cache in AsyncStorage                             | `general`              |
| `home`    | Home data sections, including the stable POI/Tour random selection | `general`              |
| `sue`     | SUE request-list queries                                           | `general`              |

Important upgrade behavior:

- missing or invalid scoped values fall back to `general`, then to end of day;
- an existing `apollo-cache-persist` entry without expiration metadata is retained and receives a
  new `apollo-cache-persist:expires-at` value on first access;
- an expired Apollo cache and its metadata are removed together;
- React Query defaults are reapplied when live `globalSettings` change, and inactive queries are
  removed when the configured general period expires;
- the development build exposes a cache-reset action, but production migration must not depend on
  that action being available to users.

Test the first v5 launch with an existing v4.3.0 Apollo cache as well as an empty installation.
See [Cache Configuration](./CACHE_CONFIGURATION.md) for the complete parser and fallback rules.

### 5.6. Local and flexible waste reminders

Waste pickup reminders are now scheduled locally with `expo-notifications`. The app supports the
legacy one-time setting and a flexible per-waste-type mode with multiple reminder slots. It keeps a
server registration as a fallback outside the locally scheduled coverage window.

Flexible mode is configured in the JSON StaticContent record named `wasteTypes`:

```json
{
  "paper": {
    "color": "#3366cc",
    "selected_color": "#224488",
    "icon": "paper",
    "label": "Papier",
    "reminders": {
      "channels": {
        "calendar": true,
        "email": false,
        "push": true
      },
      "push": {
        "slots": [
          {
            "id": "day-before",
            "default_lead_days": 1,
            "max_lead_days": 7
          },
          {
            "id": "week-before",
            "default_lead_days": 7,
            "max_lead_days": 14
          }
        ]
      }
    }
  },
  "disruption_location": {
    "color": "#cc6600",
    "selected_color": "#884400",
    "icon": "warning",
    "label": "Störungen am eigenen Abholort",
    "notification_kind": "disruption"
  },
  "disruption_all_locations": {
    "color": "#cc0000",
    "selected_color": "#880000",
    "icon": "warning",
    "label": "Störungen an allen Abholorten",
    "notification_kind": "disruption"
  }
}
```

Configuration rules:

- keep every slot `id` stable after release; it becomes part of the client/server registration
  identity;
- `default_lead_days` and `max_lead_days` are non-negative whole-day values; defaults are clamped to
  the maximum;
- if `reminders` is absent, the app retains the legacy one-day reminder UI for compatibility;
- if `reminders` exists but `channels.push` is not `true`, that waste type has no push reminder
  slot;
- the presence of at least one explicit push slot enables the flexible per-type UI;
- disruption entries are recognized only when `notification_kind` is `disruption`; the two current
  registration keys are `disruption_location` and `disruption_all_locations`.

The app schedules at most 50 pickup reminders in the native notification inventory. If known
pickups extend beyond that inventory, it schedules coverage notifications that ask the user to
reopen the app and refresh the plan. Reminders are reconstructed on startup, foregrounding,
permission changes, token changes, and manual retry. Changing the selected street, disabling push,
or rotating the push token must remove or migrate reminders owned by the old state.

#### Mandatory Main-Server contract for waste reminders

Deploy the Main-Server changes before publishing flexible reminder configuration:

1. Add `waste_device_registrations.local_coverage_until` (`datetime`).
2. Add `waste_device_registrations.reminder_slot_id` (`string`).
3. Deduplicate non-null slot registrations and add the unique
   `idx_waste_device_regs_slot_identity` index over notification device token, street, city, ZIP,
   waste type, and reminder slot.
4. Make `GET /notification/wastes.json` return `reminder_slot_id`, `local_coverage_until`, and the
   existing reminder fields.
5. Make `POST /notification/wastes.json` accept both new fields, identify flexible registrations by
   slot, and migrate an unambiguous legacy registration instead of creating a duplicate.
6. Make the server notification job suppress fallback delivery while the matching reminder is
   covered by the device's `local_coverage_until` value.
7. Support disruption registrations and municipality-scoped targeted delivery when disruption
   notifications are enabled.

During the staged rollout, the endpoint must continue accepting the device token from
`X-Notification-Device-Token`, `notification_device.token`, and the legacy `token` query parameter
so published v4.3.0 and v5 clients can coexist. Authentication still uses the bearer access token.

The reviewed Main-Server `saas` branch contains the corresponding work in commits `d482201d`
(local coverage), `52954249`/`ab295278` (slots and fallback synchronization), and
`cfd68584`/`9497c4ae`/`75e55c94` (disruption delivery, tenant scoping, and token transport).
Equivalent behavior is required if production is deployed from another branch.

Local registration does not guarantee exact delivery time. The app does not request
`SCHEDULE_EXACT_ALARM` or `USE_EXACT_ALARM`; Android may defer alarms because of OEM power policy.
Use the device matrix and privacy-safe diagnostics in
[Local waste reminder operations](./local-waste-reminder-operations.md).

### 5.7. Interactive floor plans

The new `FloorPlan` route renders one or more zoomable SVG floors with selectable pins and an
accessible list alternative. The default JSON StaticContent name is `floorPlan`; navigation may
select another record with `staticJsonName` and may override `initialFloorId` or `initialViewMode`.

Example StaticContent payload:

```json
{
  "id": "town-hall",
  "title": "Rathaus",
  "initialFloorId": "ground-floor",
  "initialViewMode": "svg",
  "floors": [
    {
      "id": "ground-floor",
      "title": "Erdgeschoss",
      "svgUrl": "https://cdn.example.org/floor-plans/town-hall-ground.svg",
      "viewBox": { "x": 0, "y": 0, "width": 1200, "height": 800 },
      "pins": [
        {
          "id": "citizen-service",
          "title": "Bürgerservice",
          "description": "Zimmer 0.12",
          "accessibilityLabel": "Bürgerservice im Erdgeschoss",
          "type": "service",
          "x": 410,
          "y": 260,
          "linkedContentType": "poi",
          "linkedContentId": "123"
        }
      ]
    }
  ]
}
```

Validation and content rules:

- every floor requires a unique `id` and a `viewBox` with positive `width` and `height`;
- provide one of `svgUrl`, inline `svgXml`, or the legacy inline `svg` alias; remote SVG URLs must
  be reachable without custom authentication headers and return a successful text response;
- every usable pin requires a unique `id`, a `title`, numeric `x`/`y` coordinates inside the
  floor's view box, and preferably a meaningful `accessibilityLabel`;
- supported pin types are `info`, `room`, `service`, and `warning`;
- supported linked-content types are `poi`, `event`, `news`, `page`, and `contact`; alternatively,
  use a valid `routeName` with `params`;
- `initialViewMode` is `svg` or `list`. A screen reader always starts with the list alternative,
  and all actionable pins must remain reachable without zoom or pan gestures.

This feature requires a new StaticContent record and navigation entry but no Main-Server schema
change. Test every remote SVG URL, floor switch, pin coordinate, linked route, light/dark theme, text
scaling, reduced motion, and screen-reader list flow.

### 5.8. SUE report and status migration

The SUE module now stores submitted reports under “My reports”, refreshes non-final status values,
supports paginated locations and requests, performs client-side search across loaded pages, and
preserves report drafts across camera/gallery flows.

To hide the app-generated `Unbearbeitet` status until the Open311/SUE API returns an official
status, set this in the existing SUE configuration inside `globalSettings`:

```json
{
  "settings": {
    "sue": {
      "showInternalPendingStatus": false
    }
  }
}
```

The default is `true` for backward compatibility. v5 records whether a stored status came from the
app or the API. Existing local reports without that provenance are migrated by inference; an
`Unbearbeitet` value is treated as internal and other non-empty values as API values.

Verify the external SUE service contract:

- `/locations` and `/requests` accept `limit` and `offset`; unbounded location loads use pages of
  100 until a short page is returned;
- `/requests/:serviceRequestId` returns a report object and an official string status when one is
  available; non-final local reports are refreshed no more than once every five minutes;
- `media_url` may be a JSON string but malformed values must not invalidate the whole result set;
- report creation continues to accept multipart files named `media_file_1`, `media_file_2`, and so
  on;
- the configured attachment count, size, MIME types, required contact fields, and map/location
  requirements match the deployed SUE API.

The Android app now blocks legacy `READ_EXTERNAL_STORAGE`/read-media permissions and requests
camera or save permissions only for the action that needs them. Test camera capture, optional save
to gallery, existing-image selection, EXIF coordinates, draft restoration, reverse geocoding, and
the no-permission path on supported Android versions.

### 5.9. Push notification navigation contract

Push interaction handling moved from the Home screen to the stable app root. It now queues
navigation until the root navigator is ready, normalizes Expo and FCM response shapes, deduplicates
responses without an Android notification identifier, and handles foreground, background, and
cold-start taps.

The canonical data payload is:

```json
{
  "id": "123",
  "query_type": "NewsItem",
  "title": "Optional navigation title"
}
```

`queryType` is accepted as an alias for `query_type`. Android/FCM producers may place a JSON object
or serialized JSON in `content.data`, `body`, `data`, or `payload`; the normalized result must still
contain a non-empty `id` and a recognized query type. Local waste notifications use
`query_type: "WasteAddresses"` and navigate to the waste screen.

Before rollout, test real provider payloads rather than only console notifications. Include Android
terminated-app launches, taps while the app is backgrounded, repeated delivery of the same response,
drawer and tab navigation roots, and every supported detail query type. Unsupported or incomplete
payloads are intentionally ignored and logged as warnings.

### 5.10. Feedback content and granular diagnostics

The feedback form loads optional HTML StaticContent at the bottom. Its default name is
`feedbackContent`; override it with `settings.feedback.htmlContentName`.

Diagnostic collection is opt-in per submission and can be enabled granularly:

| Field                                 | Data category made available after user consent                          |
| ------------------------------------- | ------------------------------------------------------------------------ |
| `includeSystemInformation`            | Device and operating-system properties                                   |
| `includePermissions`                  | Current app permission states                                            |
| `includePushInformation`              | In-app push setting, token presence/ownership, and Android channel state |
| `includeWasteConfiguration`           | Sanitized waste reminder configuration and validation state              |
| `includeWasteDisruptionNotifications` | Boolean own-location/all-location disruption switches                    |
| `includeWasteReminderScheduling`      | Sanitized scheduling status, counts, dates, and native inventory         |

`includeScheduledNotifications` and `includeWastePushDiagnostics` remain legacy umbrella flags and
enable several categories together. Prefer the granular flags for new v5 content. No diagnostic
payload is sent unless the user selects the diagnostic checkbox. Review the explanatory HTML,
privacy notice, retention, payload-size handling, and Main-Server email templates before enabling
any category.

### 5.11. Other remote-configuration changes

| Feature                        | New or important field                                            | Backend impact                                                                  |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Cache expiration               | `settings.cache.general/apollo/home/sue`                          | No schema change; test legacy persisted-cache migration                         |
| News date format               | `settings.news.listDateFormat`, `detailDateFormat`                | No schema change; must match incoming timestamps                                |
| Defect report without location | `settings.defectReports.withoutLocation`                          | When `true`, the mutation omits empty `addresses`; backend must accept it       |
| Defect category order          | GraphQL `Category.position`                                       | Field already exists; populate it in CMS/import data                            |
| Feedback diagnostics           | `settings.feedback.htmlContentName` and granular `include*` flags | Add optional HTML StaticContent; review opt-in, retention, and email processing |
| WebView                        | `settings.webView.isIncognito`, `mobileUserAgent.ios/android`     | No Main-Server schema change                                                    |
| Bot-controlled WebView         | Route parameter `hasBotControl`                                   | Update static navigation/widget parameters                                      |
| POI/Tour direction             | `settings.showDistanceDirection.poi/tour`                         | Requires coordinates; no schema change                                          |
| Tour stop initial zoom         | `settings.locationService.tours.initialMapMinZoom`                | Valid range 0–18; invalid values fall back to 14                                |
| Parking availability           | POI `payload.freeStatusUrl` and external feature payload          | Main-Server carries the URL/payload; verify the external endpoint               |
| Bookmark icon                  | `settings.bookmarkIcon`                                           | No Main-Server schema change                                                    |
| SUE version label              | `app.json.expo.extra.sueVersion`                                  | Build-time value, not server configuration                                      |
| SUE pending status             | `settings.sue.showInternalPendingStatus`                          | No schema change; verify stored-report and API-status behavior                  |
| Tab navigation refresh         | `tabNavigation` StaticContent                                     | v5 checks for updates once per minute while the app is active                   |
| Generic Item events            | `settings.eventCalendar.genericItemEventSources`                  | Existing Generic Item query; validate complete dated datasets and result limits |
| Icon-family priority           | `settings.iconFamilies`; per-item `iconSet`                       | No schema change; exact supported identifiers and icon names are required       |
| Profile OAuth                  | `settings.profile`; navigation `withProfile`                      | Register redirect/client; `/member` must accept the OAuth bearer token          |
| Profile content creation       | Three `profile*Service*` JSON records; profile routes and roles   | Requires member/user tokens, linked provider, roles, and ownership enforcement  |

Feedback diagnostics are not sent without user consent. Before enabling them, review privacy text,
retention periods, recipient email templates, and access permissions for GDPR compliance.

### 5.12. Generic Item event sources

One or more Generic Item datasets can be merged into the event list, calendar dots and selected-day
list, home event section, and event widget count. Configure the source list in
`globalSettings.settings.eventCalendar.genericItemEventSources`:

```json
{
  "settings": {
    "eventCalendar": {
      "genericItemEventSources": [
        {
          "genericType": "ParticipationProject",
          "filterTypes": ["Veranstaltung"],
          "filterStatuses": ["active", "announced"]
        }
      ]
    }
  }
}
```

Migration and content rules:

- `genericType` is required, surrounding whitespace is removed, and duplicate source queries use
  the normalized value;
- `filterTypes` and `filterStatuses` are optional. Missing or empty arrays disable that filter;
- type matching uses `payload.type` and every `categories[].name`; status matching accepts a scalar
  `payload.status` or structured status values such as `label`, `text`, `title`, `name`, `status`,
  or `value`;
- comparisons ignore surrounding whitespace and letter case, and known localized status aliases
  are normalized;
- every valid entry in `dates[]` creates one occurrence from `dateStart` or `dateFrom`. Date ranges
  are not expanded, malformed dates are ignored, and a source without dates produces no events;
- native EventRecord category or location filters suppress Generic Item and other external events,
  because those native filters do not describe the external datasets;
- query-based home sections may set `skipLastDivider: true` to remove the divider after all event
  sources have been merged, sorted, and limited.

The client requests and caches the complete result once per distinct `genericType`, then applies
date, type, and status filtering locally. The current GraphQL contract has no server-side
`dateRange`, and the request does not set an explicit limit. Confirm that production does not apply
an undocumented default limit and that the dataset remains small enough for mobile download and
parsing. If not, add backend date filtering or pagination before enabling the source. Monitor widget
counts and calendar/list parity so truncated data is not mistaken for a client rendering issue.

This feature does not require a new GraphQL type, but it does require existing Generic Item fields,
including `genericType`, `categories`, `dates`, `mediaContents`, `addresses`, and `payload`, to be
populated consistently. See [Generic Item events](./GENERIC_ITEM_EVENTS.md) for the detailed parser
contract.

### 5.13. Multiple icon libraries

The runtime icon priority is configured through `globalSettings.settings.iconFamilies`. It accepts
one supported string or an ordered array:

```json
{
  "settings": {
    "iconFamilies": ["tabler", "ionicons", "materialicons"]
  }
}
```

Supported values are `tabler`, `ionicons`, `materialicons`, `materialcommunityicons`,
`fontawesome`, `fontawesome5`, `fontawesome6`, and `simplelineicons`. Missing or empty
configuration falls back to `tabler`, then `ionicons`.

Resolution order is:

1. an app-provided custom SVG with the requested unified name;
2. an explicit `iconSet` on a dynamic tab or service tile;
3. the configured `iconFamilies` order;
4. the Tabler question-mark fallback.

Preserve both `iconName` and `iconSet` while merging tenant `tabNavigation` or service-tile content.
An explicit `iconSet` does not fall through to the global family list when the requested icon is
missing. Test every configured icon in active/inactive, light/dark, and accessibility states,
including tab fill overrides. No Main-Server schema or native plugin change is required, but the
versioned static content must use exact supported family identifiers.

The separate multi-icon reference currently shows the obsolete key `settings.icon`; the reviewed
implementation reads `settings.iconFamilies`. Use `iconFamilies` for this snapshot and align the
reference document or implementation before the v5 tag is created.

### 5.14. Profile OAuth and session migration

Profile header authentication uses `expo-auth-session` and reads this configuration from
`globalSettings.settings.profile`:

```json
{
  "settings": {
    "profile": {
      "clientId": "<public-mobile-client-id>",
      "clientSecret": "",
      "scopes": ["openid", "profile", "email"],
      "serverUrl": "https://identity.example.org/realms/example/protocol/openid-connect",
      "usePKCE": true
    }
  }
}
```

The feature is configured only when `clientId` and `serverUrl` are non-empty. The app constructs
discovery metadata for `/auth`, `/token`, `/revoke`, and `/logout` from `serverUrl`; the current
flow actively uses authorization, token/refresh, and logout. It uses
`<app.json expo.scheme>://redirect` as the redirect URI. Register that exact URI for every tenant
bundle and environment. Use a public mobile client with PKCE; a `clientSecret` shipped through
`globalSettings` is visible to installed clients and must not be treated as confidential.

The full OAuth token response is stored in SecureStore under `profileAccessToken`, while the access
token is mirrored to the existing `PROFILE_AUTH_TOKEN` key used by Main-Server requests. On startup
the app requires valid numeric `issuedAt` and `expiresIn` values, restores a valid access token, and
uses a refresh token after expiry. Structured OAuth `invalid_grant`/`invalid_token`, revoked,
expired, or malformed-token failures clear the stored session; transient refresh errors keep the
current login state so a temporary identity-provider outage does not force logout.

The Main-Server `/member` endpoint is not called without a stored bearer token. In the reviewed
snapshot, both a missing `member` and a missing `member.keycloak_refresh_token` clear the member and
user tokens plus cached profile data. Verify that `/member` accepts the identity-provider access
token and returns `member`, `member.keycloak_refresh_token`, the linked `user`, `roles`, and
`data_provider_id`. Upgrade-test valid legacy sessions, expired tokens with and without refresh
tokens, malformed SecureStore data, revoked sessions, offline startup, temporary refresh failures,
logout, and a deleted/missing member.

`withProfile` support exists in shared screen options, but the reviewed default stack does not
enable it. A tenant that wants the header login/logout action must deliberately enable it in its
navigation configuration; adding `settings.profile` alone does not display the action.

### 5.15. Authenticated profile content creation and owner editing

v5 adds profile-based creation and owner management for NewsItem, EventRecord, PointOfInterest, and
profile-scoped Noticeboard entries. The feature is enabled only when all four layers below are
ready:

1. the profile login returns a member linked to a Main-Server user and data provider;
2. Main-Server returns that user, its `authentication_token`, `data_provider_id`, and current roles
   from `/member`;
3. the mobile client stores both the member and user GraphQL tokens; and
4. the profile routes are exposed by valid StaticContent tiles.

#### Authentication and authorization contract

GraphQL calls now select an explicit authentication mode:

| Mode      | `X-Authorization`                                | `X-User-Authorization`           | Intended use                                   |
| --------- | ------------------------------------------------ | -------------------------------- | ---------------------------------------------- |
| `public`  | Empty                                            | Empty                            | Existing anonymous read operations             |
| `member`  | Member token, with the existing voucher fallback | Empty                            | Member-scoped operations                       |
| `user`    | Member token, with the existing voucher fallback | Linked user authentication token | Editorial/owner reads, writes, and noticeboard |
| `voucher` | Voucher token                                    | Empty                            | Existing voucher operations                    |

The existing application OAuth bearer token continues to be sent separately as `Authorization`.
Main-Server resolves the member and user headers inside the current municipality and uses the user
as the GraphQL `current_user`. The user token is not interchangeable with the identity-provider
access token. Never put either profile token into `globalSettings` or StaticContent.

The reviewed legacy profile-login flow stores `member.authentication_token` and
`user.authentication_token`. The reviewed header OAuth flow currently stores the identity-provider
access token as the member token, then only caches the `/member` response; it does not replace that
value with `member.authentication_token` or persist `user.authentication_token` to
`PROFILE_USER_AUTH_TOKEN`. Therefore a Keycloak-only login can appear successful while `user` mode
GraphQL calls are unauthorized. This is a v5 release blocker: complete that token handoff, await the
storage writes, and add an end-to-end Keycloak login plus create-content test before enabling these
tiles.

#### Required profile StaticContent

Create and version these JSON records for every enabled tenant:

- `profileService`: the signed-in profile home tiles; include `ProfileCreateContentHome` and
  `ProfileContent` for editorial users;
- `profileCreateContentServiceTop`: signed-in noticeboard creation tiles; and
- `profileCreateContentServiceBottom`: editorial creation tiles, filtered by role in the app.

The following is a minimal structural example. Keep tenant titles, icon names, layout styles, and
any noticeboard-specific category/date/media parameters from the existing configuration. Merge the
new entries into existing profile arrays instead of replacing unrelated tiles.

`profileService`:

```json
[
  {
    "title": "Inhalt erstellen",
    "accessibilityLabel": "Inhalt erstellen",
    "routeName": "ProfileCreateContentHome",
    "iconName": "pencil-plus"
  },
  {
    "title": "Meine Inhalte",
    "accessibilityLabel": "Meine Inhalte",
    "routeName": "ProfileContent",
    "iconName": "list"
  }
]
```

`profileCreateContentServiceTop`:

```json
[
  {
    "title": "Anzeige",
    "accessibilityLabel": "Anzeige erstellen",
    "routeName": "NoticeboardForm",
    "iconName": "plus",
    "params": {
      "query": "noticeboard",
      "genericType": "Noticeboard",
      "isLoginRequired": true,
      "isNewEntryForm": true,
      "queryVariables": {
        "genericType": "Noticeboard",
        "currentMember": true
      }
    }
  }
]
```

`profileCreateContentServiceBottom`:

```json
[
  {
    "title": "Nachricht",
    "accessibilityLabel": "Nachricht erstellen",
    "routeName": "ProfileCreateContentForm",
    "iconName": "pen",
    "params": { "query": "newsItem" }
  },
  {
    "title": "Veranstaltung",
    "accessibilityLabel": "Veranstaltung erstellen",
    "routeName": "ProfileCreateContentForm",
    "iconName": "calendar",
    "params": { "query": "eventRecord" }
  },
  {
    "title": "Ort",
    "accessibilityLabel": "Ort erstellen",
    "routeName": "ProfileCreateContentForm",
    "iconName": "location",
    "params": { "query": "pointOfInterest" }
  }
]
```

Service tiles automatically attach their source StaticContent and route names. The noticeboard
scope helper uses those values to select `user` mode for profile-originated Noticeboard content;
ordinary Noticeboard navigation remains public. An explicit `authMode` in query variables takes
precedence, followed by an explicit `currentMember` value.

#### Roles, ownership, and content lifecycle

The client maps creation tiles as follows:

| Content type | Tile `params.query` | Mobile tile role            | Mutation                |
| ------------ | ------------------- | --------------------------- | ----------------------- |
| News         | `newsItem`          | `role_news_item`            | `createNewsItem`        |
| Event        | `eventRecord`       | `role_event_record`         | `createEventRecord`     |
| POI          | `pointOfInterest`   | `role_point_of_interest`    | `createPointOfInterest` |
| Noticeboard  | `noticeboard`       | No type-specific app filter | `createGenericItem`     |

The mobile role filter is a presentation control, not an authorization boundary. News, event, and
POI tiles are hidden when their role is false, and `ProfileContent`/
`ProfileCreateContentHome` are hidden when the user has no editorial role. Noticeboard tiles inside
the create-content screen are kept independently of those three editorial roles. However, the
`ProfileCreateContentHome` entry itself is also hidden from a noticeboard-only user. If that user
must create entries, add a direct `NoticeboardForm` tile with the same protected parameters to
`profileService`, or extend the role helper to recognize `role_noticeboard` before rollout.

The reviewed Main-Server mutation layer verifies a current user/data provider, rejects certain
general user roles, and scopes updates to the provider, but it does not use these type-specific
data-provider flags to authorize create mutations. If the tenant expects the flags to be a security
boundary, add and test server-side checks for every mutation before enabling the feature; hiding a
tile is not sufficient. When Keycloak manages roles, provision realm roles named
`mainserver_role_news_item`, `mainserver_role_event_record`,
`mainserver_role_point_of_interest`, and, when required by backend policy,
`mainserver_role_noticeboard`. Enable `member_keycloak_manages_roles` only after verifying that
role synchronization will not unintentionally clear existing data-provider roles.

`ProfileContent` requests up to 100 news, event, and POI records for the linked
`data_provider_id`, hides invisible records, and exposes edit/delete actions only when the detail
record's `dataProvider.id` matches the current user's provider. Delete is implemented as
`changeVisibility(..., visible: false)`, not a hard delete. Edit reuses the create mutation with an
ID and must preserve fields that the form does not change. Main-Server must enforce municipality,
general user-role, and data-provider ownership rules for every read and mutation. Add
content-type-role enforcement when it is part of the tenant's authorization policy; never rely on
the client-side comparison alone.

Before rollout, use a staging user for each role combination to create, reopen, edit, hide, and
reload every enabled type. Also verify image upload before mutation, rich-text round trips,
categories, dates/opening hours, contacts, URLs, prices, push-notification options, validation
scrolling, offline/error recovery, and denial of cross-provider IDs.

## 6. Main-Server migration decision

### 6.1. GraphQL schema changes that are not mandatory for the reviewed v5 client

The following GraphQL fields already exist in the Main-Server baseline from 4 May 2026:

- `Category.position`;
- GenericItem fields including `updatedAt`, `description`, `teaser`, `addresses`, `locations`,
  `openingHours`, `webUrls`, `settings`, and `dataProvider.notice`;
- date fields including `dateStart`, `dateEnd`, `timeStart`, `timeEnd`, `timeDescription`, and
  `weekday`;
- GenericItem filters for `genericType`, IDs, category, and search;
- versioned StaticContent lookup through `publicJsonFile(name, version)`;
- `createNewsItem`, `createEventRecord`, `createPointOfInterest`, `createGenericItem`, and
  `changeVisibility` mutations;
- member and user resolution through `X-Authorization` and `X-User-Authorization`; and
- general user-role gating and data-provider owner scoping for resource writes.

Consequently, the reviewed v5 GraphQL queries do not by themselves require a new Main-Server column
or GraphQL type. This finding does not cover the waste-reminder REST API: flexible local reminders
have mandatory database and endpoint changes described below. Verify that the deployed production
Main-Server is compatible with both contracts. Do not infer compatibility from a deployment name or
date.

Generic Item event sources reuse the existing `genericItems(genericType: ...)` query and therefore
do not add a schema migration. They do add a data-volume and completeness requirement: every
configured type must return all occurrences needed by the client, with usable `dates` and filter
payloads, without an undocumented default limit.

Profile content creation likewise does not add a database migration by itself, but it requires a
deployed Main-Server revision that returns the linked user/token/roles/provider from `/member` and
enforces general current-user and ownership checks on the existing mutations. Type-specific
data-provider flags are only mobile visibility controls in the reviewed baseline; add server-side
enforcement when the tenant's policy requires them. Treat that operational contract as mandatory
whenever the profile creation tiles are enabled.

### 6.2. Mandatory Main-Server operational changes

At minimum:

1. Run the waste registration migrations
   `20260608120000_add_local_coverage_until_to_waste_device_registrations.rb`,
   `20260613130000_add_reminder_slot_id_to_waste_device_registrations.rb`, and
   `20260613131000_add_unique_index_to_waste_device_registration_slots.rb` before enabling flexible
   waste reminders.
2. Deploy the matching waste REST contract, fallback-suppression job behavior, token transport, and
   tenant-scoped disruption delivery described in section 5.6.
3. Create a `5.0.0` JSON StaticContent record named `globalSettings`.
4. Retain the versioned 4.3.x content records for existing clients.
5. Prepare v5-compatible `tabNavigation`, carousel, introductory HTML, and other static content for
   every enabled module. This includes `wasteTypes`, `floorPlan`, and `feedbackContent` when the
   corresponding features are enabled.
6. When profile content creation is enabled, create `profileService`,
   `profileCreateContentServiceTop`, and `profileCreateContentServiceBottom`, and retain any
   existing profile/conversation/settings tiles required by the tenant.
7. Configure and validate `iconFamilies`, per-item `iconSet`, `eventCalendar`, and `profile` only
   after their dependent static content, identity-provider client, and Generic Item datasets are
   ready.
8. Link every editorial member to a user and data provider; provision the news/event/POI and
   optional noticeboard roles; then verify `/member` returns `member.authentication_token`,
   `member.keycloak_refresh_token`, `user.authentication_token`, `roles`, and `data_provider_id`.
9. Verify `X-Authorization` and `X-User-Authorization` resolve within the correct municipality and
   that mutation authorization rejects a missing/forbidden user and cross-provider resources. If
   content-type roles are an authorization boundary, deploy their server-side checks as well.
10. If Participation Projects or Generic Item event sources are enabled, provide the GenericItem
    import data, category relationships, dates, payload types/statuses, and bounded query results.
11. Populate `position` values when category ordering is required.
12. If feedback diagnostics are enabled, update recipient email templates and the privacy/retention
    policy.
13. Record the exact production Main-Server deployment SHA and completed database migrations in the
    release notes.

### 6.3. Conditional or recommended Main-Server code changes

- Commit `04d9eb41` (`fix(mail): expose feedback metadata in templates`) or an equivalent change
  exposes `email` directly to feedback email templates, makes missing values visible, and keeps
  compatibility with nested payloads. This is required if new feedback templates depend on those
  values.
- If automatic Participation Project push notifications are required, extend
  `GenericItem::GENERIC_TYPES`, push configuration, and I18n support.
- Keycloak-managed data-provider role synchronization uses the `mainserver_` prefix and replaces
  all managed role flags with the roles present in the access token. Use it only when the realm and
  municipality are provisioned as one system; otherwise manage data-provider roles explicitly.
- The waste reminder work in commits `d482201d`, `52954249`, `ab295278`, `cfd68584`, `9497c4ae`, and
  `75e55c94`, or equivalent code, becomes mandatory when local/flexible reminders or disruption
  delivery are enabled. Do not deploy the `wasteTypes` reminder configuration ahead of this server
  capability.
- Other Main-Server survey, TMB, Redis, and importer changes from May to August are not general
  prerequisites for the v5 mobile binary. Deploy them through their own migration plans when the
  corresponding features are enabled.

The reviewed Main-Server repository does not use semantic release tags. Identify the deployed
server by its commit SHA. During the review, the local `saas` branch was 110 commits behind
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
    categories {
      id
      name
      position
    }
    addresses {
      city
      street
      zip
      geoLocation {
        latitude
        longitude
      }
    }
    locations {
      name
      geoLocation {
        latitude
        longitude
      }
    }
    dates {
      dateStart
      dateEnd
      timeStart
      timeEnd
      timeDescription
      weekday
    }
    openingHours {
      dateFrom
      dateTo
      timeFrom
      timeTo
      open
      useYear
      description
    }
    webUrls {
      url
      description
    }
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

Run the Generic Item query for every configured event `genericType`. Compare the returned count with
the source/import count and verify representative `payload.type`, `payload.status`, category, date,
image, and address values; a successful but truncated response is not sufficient.

Also perform these read-only REST/content checks in staging:

- request `globalSettings`, `tabNavigation`, and every enabled `wasteTypes`, `floorPlan`, or
  `feedbackContent` record with the exact name and version the client will use;
- request `profileService`, `profileCreateContentServiceTop`, and
  `profileCreateContentServiceBottom`; validate every route, query value, icon, and required form
  parameter;
- verify that `globalSettings` contains the intended `iconFamilies`, `eventCalendar`, and `profile`
  values, and that every tab/service-tile `iconSet` resolves to a visible icon;
- verify the profile OAuth `/auth`, `/token`, and `/logout` flows, the configured `/revoke` metadata,
  the registered app redirect URI, and the Main-Server `/member` bearer-token contract with a
  staging account;
- call `GET /notification/wastes.json` with a dedicated test device token and verify that each
  flexible registration returns `reminder_slot_id` and `local_coverage_until`;
- verify that legacy registrations without a slot still deserialize and that no duplicate slot
  identities remain after the unique-index migration;
- exercise POST/delete registration changes only with a staging test device and confirm that the
  three supported token transports resolve to the same device during the coexistence period.

Profile writes cannot be proven with read-only checks. In staging, sign in through every supported
profile login path and inspect header presence without logging token values. Confirm that
`/member` returns fresh member/user credentials, create one record for each granted type, read it
back through `ProfileContent`, edit it, and hide it through `changeVisibility`. Repeat with a
forbidden general user and with another provider's record ID; both negative cases must be rejected
by Main-Server rather than merely hidden by the mobile UI. If content-type roles are part of the
tenant policy, also verify that direct API calls with a missing type role are rejected.

## 7. Build, versioning, tagging, and OTA

### 7.1. Known release blockers in the reviewed snapshot

At the time of review on 27 August 2026:

- `package.json.version` is still `4.3.0`;
- `app.json.expo.version` is still `4.3.0`;
- the `v5.0.0` tag and the v5 `CHANGELOG.md` section do not exist yet, as expected before the
  release is finalized;
- `app.json.erb.tmpl` is not synchronized with `app.json`: its SUE version is still `1.0.0`, its
  splash plugin lacks the dark configuration, it still grants legacy Android read permissions,
  and it registers the MapLibre plugin twice;
- the Floor Plan/navigation helper and the profile content home, content overview, settings, form,
  NewsForm, EventForm, and PointOfInterestForm implementations directly import
  `@react-navigation/native` or `@react-navigation/stack`, although neither package is declared as
  a direct dependency;
- `.github/scripts/eas-update.js` does not provide the `eas update --environment ...` argument
  required after the SDK 55 update;
- `APP_DESIGN_SYSTEM_DARK_MODE.md` links to a missing
  `docs/app-design-system-dark-mode.json` file;
- `docs/icons/MULTI_ICON_LIBRARY.md` documents `settings.icon`, while the reviewed implementation
  reads `settings.iconFamilies`;
- profile header OAuth support is implemented but no reviewed default stack screen enables
  `withProfile`; confirm the intended product entry point and public-client/PKCE policy before
  release;
- the header OAuth flow does not persist the member/user authentication tokens returned by
  `/member`, so Keycloak-only users can be logged in without the headers required by profile content
  mutations. Complete and end-to-end test the token handoff described in section 5.15;
- the reviewed Main-Server does not enforce the content-type data-provider flags used to hide
  profile creation tiles. Add backend checks before release when those flags are intended as an
  authorization boundary.

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

EAS has `autoIncrement: false`, so build numbers must be incremented explicitly. Both `eas.json`
and `eas.json.erb.tmpl` now select Node 22.13.0; keep that alignment when resolving tenant template
conflicts.

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

The local review on 27 August 2026 found existing quality/infrastructure failures:

- `yarn lint` does not reach a result. It repeatedly reports parser errors where the outdated
  `@typescript-eslint/parser` encounters Flow syntax in React Native, and the review run was stopped
  after 30 seconds of repeated errors. Align the ESLint/parser/import-resolver toolchain with
  TypeScript 6 and React Native 0.86, then resolve remaining project errors before release.
- `yarn test --runInBand` passes 121 of 164 suites and 623 of 628 tests. It fails 43 suites and 3
  tests, with 2 skipped tests. Most suite failures are caused by the intentionally untracked
  `src/config/secrets.js` file being unavailable; the remaining failures include obsolete
  `@react-navigation/native` mocks and stale waste/settings mocks. Provide a secret-free Jest module
  mock or safe test-time provisioning in CI; never commit a real secret file.
- `npx expo-doctor@latest` cannot start its project checks because evaluating Expo config reaches
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
- valid, expired, revoked, malformed, offline, and transiently unrefreshable profile OAuth
  sessions, including member records removed on the server;
- profile users with no linked user/provider, each individual editorial role, all editorial roles,
  no editorial roles, and a changed/revoked Keycloak role set;
- an upgrade with only the legacy member token present, followed by `/member` synchronization and
  creation of the missing user-token state;
- existing bookmarks, wallet entries, accessibility preferences, and personalized tiles;
- an existing `apollo-cache-persist` value without expiration metadata and an already expired cache;
- existing locally stored SUE reports without `statusSource`, including an `Unbearbeitet` report;
- existing waste push registrations, reminder settings, selected address, and scheduled native
  notifications followed by a push-token or permission change;
- first launch while online, offline, and while Main-Server is unavailable;
- cached legacy `globalSettings` followed by the new 5.0.0 content;
- concurrent use by a v4.3.0 client and a v5 client against the same Main-Server deployment;
- cold start in light, dark, and system theme modes;
- no OTA, downloading OTA, OTA ready, and reload flows.

### 8.3. Module smoke tests

| Area            | Acceptance criteria                                                                                                                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BUS             | Area search, initial area, life situations, A–Z, text search, pagination, detail, and sharing work; every request contains the correct state header                                                                                                                      |
| Main GraphQL    | News, events, POIs, tours, categories, and generic item queries complete without schema errors                                                                                                                                                                           |
| Participation   | Home, category, featured/all sections, status filters, map/list, detail, bookmark, share, search, and add-to-calendar work                                                                                                                                               |
| Generic events  | Every configured Generic Item type/filter/date maps consistently into list, calendar, home, and widget; native filters suppress external data; refresh, loading, deduplication, and large/truncated datasets are verified                                                |
| Icons           | Global family order, per-tab/tile overrides, unified mappings, custom SVG priority, missing-name fallback, fill/stroke, theme, and accessibility states render correctly                                                                                                 |
| Profile OAuth   | Redirect, authorization-code exchange, PKCE, restore, refresh, transient outage, invalid/revoked token, logout, missing-member cleanup, and offline-to-online recovery work without exposing confidential secrets                                                        |
| Profile content | Member/user token handoff, role-filtered tiles, owner lists, create/edit/hide for news/events/POIs/noticeboard, image and rich-text round trips, cross-provider denial, and Keycloak role refresh work                                                                   |
| Cache           | General, Apollo, Home, and SUE expiration values apply; invalid values fall back safely; legacy Apollo data receives metadata; expiration removes the expected scope only                                                                                                |
| Waste           | Legacy and flexible UI modes work; per-type slots, 50-item limit, coverage reminders, permission/token/address resync, disruption registration, local tap navigation, and server fallback suppression are verified                                                       |
| Floor Plan      | Remote and inline SVG floors render; floor/view switches, pins, linked content, invalid config, theme, scaling, gestures, and the screen-reader list alternative work                                                                                                    |
| Theme           | App shell, tabs/drawer, modals, forms, maps, calendar, WebView loading, SUE, and static carousels are checked in both themes                                                                                                                                             |
| Accessibility   | Text scaling, bold text, luminance-preserving grayscale for remote colors/images, responsive 1–5-column widget layout, high contrast, reduced motion/transparency, switch labels, and read aloud are tested on real devices                                              |
| Upload          | Volunteer calendar/post/email, Consul attachments, wallet card sharing, and AR download/delete work                                                                                                                                                                      |
| Chat/carousel   | GiftedChat messages, quick replies, attachments, links, carousel autoplay/pause, and single-image height work                                                                                                                                                            |
| Feedback        | Configured HTML renders; diagnostic checkbox defaults to off; each granular/legacy flag exposes only the intended category; nothing is sent without opt-in; expected email/payload is produced after opt-in                                                              |
| SUE/Defect      | Missing/partial/complete SUE configuration, paginated locations/requests, stored-report status refresh and provenance, hidden/shown internal pending status, camera/gallery draft and EXIF flows, reports with and without location, and category position ordering work |
| WebView         | Incognito precedence, platform user agent, bot control, external browser, and modal browser behavior work                                                                                                                                                                |
| Maps            | POI/Tour direction card, TourStop zoom/bounds, parking status, and invalid coordinates are handled                                                                                                                                                                       |
| Push            | Canonical and normalized payloads navigate once in foreground/background/cold start; queueing before navigator readiness, query type aliases, missing fields, local waste taps, deep links, and notification categories work                                             |

### 8.4. Pre-production monitoring

- verify the Sentry release/environment values and source-map upload;
- monitor GraphQL schema errors and `publicJsonFile` not-found errors;
- monitor invalid cache-setting warnings and unexpected Apollo/home/SUE cache churn;
- monitor Floor Plan StaticContent validation and remote SVG download/render failures;
- monitor waste reminder scheduling, ownership migration, maintenance sync, native-inventory limits,
  registration conflicts, and server fallback deliveries inside local coverage windows;
- monitor SUE pagination/status-refresh errors and stored-report migration failures;
- monitor push payload normalization, ignored payloads, and duplicate navigation warnings;
- monitor BUS proxy 4xx, 5xx, timeout rates, and state distribution;
- monitor Main-Server feedback/AppUserContent email errors;
- monitor Generic Item event query counts, payload/date parse failures, list/calendar/widget parity,
  and client-side processing time;
- monitor profile OAuth exchange/refresh failures separately from invalid-session cleanup and
  `/member` synchronization failures;
- monitor missing/invalid profile member and user headers, role synchronization changes,
  unauthorized content mutations, upload failures, and cross-provider access attempts without
  logging token values;
- monitor unresolved icon names and question-mark fallbacks after static-content updates;
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
7. To disable Generic Item events, remove `settings.eventCalendar.genericItemEventSources`. The
   source records can remain available to their original module.
8. To roll back icon-family selection, remove `settings.iconFamilies` and per-item `iconSet`
   overrides so the app returns to the built-in Tabler/Ionicons order.
9. To disable profile header OAuth, remove the `withProfile` header entry point and profile
   configuration together, then verify logout/session cleanup for already signed-in test users.
10. To disable profile content creation, remove `ProfileCreateContentHome` and `ProfileContent`
    from `profileService` and remove both `profileCreateContentService*` records or replace them with
    safe empty arrays. Do not delete or reassign created content; retain server authorization and
    token compatibility while already-installed v5 clients and cached content are still active.
11. To disable Floor Plan, remove its navigation entry and StaticContent reference. No stored user
    data or server schema needs to be deleted.
12. To disable flexible waste reminders, restore a `wasteTypes` payload without explicit push slots,
    resynchronize/clear the app-owned native reminders, and keep the compatible server columns and
    index in place during the client rollback window.
13. Removing cache overrides returns invalid or missing scopes to the end-of-day fallback. Do not
    delete persisted data manually unless the rollback procedure explicitly requires it.
14. Follow the Main-Server repository's backup and rollback procedure for server-side migrations.
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
- [ ] Cache expiration scopes are configured and legacy Apollo persistence was upgrade-tested.
- [ ] If BUS is enabled, `settings.bus`, the proxy contract, and `federalState` are ready.
- [ ] If Participation Projects are enabled, data/importer, static content, and navigation are ready.
- [ ] Every Generic Item event source has complete dates/filter payloads, bounded results, and matching list/calendar/home/widget behavior.
- [ ] `iconFamilies`, tab/service-tile `iconSet` values, and every configured icon name are validated against the implementation.
- [ ] Profile OAuth uses an approved public client and PKCE, the redirect/endpoints are registered, and stored-session/member-sync upgrade cases pass.
- [ ] `/member` returns the linked user, data provider, roles, refresh token, and member/user authentication tokens required by the selected login paths.
- [ ] `profileService`, `profileCreateContentServiceTop`, and `profileCreateContentServiceBottom` contain valid routes, query values, form parameters, and icons.
- [ ] Profile content roles are provisioned, both GraphQL auth headers are persisted, and allowed/denied/cross-provider create, edit, list, and hide cases pass.
- [ ] News, event, and POI rich-text/media forms pass clean iOS and Android native-build tests.
- [ ] If Floor Plan is enabled, its StaticContent, SVG assets, accessible list, pins, and linked routes are verified.
- [ ] Waste registration migrations and REST/token/fallback contracts are deployed before flexible reminders or disruptions are enabled.
- [ ] Waste reminder slots use stable IDs, and legacy/flexible modes, local coverage, native inventory, token rotation, and selected-address migration are verified.
- [ ] SUE pagination, stored-status refresh/provenance, internal pending-status configuration, and media permission/draft flows are verified.
- [ ] Grayscale tenant colors/images and responsive widgets are verified across both themes, device widths, orientations, and text scales.
- [ ] Push producers emit a supported query type and ID, and foreground/background/cold-start navigation is verified.
- [ ] Privacy and email processing are approved before feedback diagnostics are enabled.
- [ ] Feedback HTML and every enabled granular diagnostic category are verified with and without user consent.
- [ ] Template files match the real application and EAS configuration.
- [ ] `package.json`, `app.json`, `buildNumber`, and `versionCode` contain final values.
- [ ] Expo Doctor, lint, tests, accessibility checks, and both platform development builds pass.
- [ ] Fresh-install and v4.3.0-to-v5.0.0 upgrade tests pass.
- [ ] OTA channel and runtime behavior are verified.
- [ ] Main-Server and BUS deployment SHAs are included in the release notes.
- [ ] Staged rollout, monitoring, and rollback owners are identified.
