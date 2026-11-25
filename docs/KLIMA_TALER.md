# Klima-Taler integration

Klima-Taler uses the Changers native SDK for provider screens, onboarding, consent and tracking. The provider account is independent of the SVA profile. The shared app includes the native module; each customer controls its availability through the existing global settings.

For clean-checkout iOS framework preparation and native build requirements, see [Native build setup](KLIMA_TALER_NATIVE_SETUP.md). Historical device notes are not current release acceptance evidence.

The SVA module version is recorded as `expo.extra.klimaTalerVersion` in `app.json` and `app.json.erb.tmpl`, matching `modules/expo-changers/package.json`. About's version information shows it when Klima-Taler is enabled. This integration version is separate from the vendor's iOS and Android SDK versions; older app configurations without the field omit the entry.

## Customer configuration

Enable the integration with `globalSettings.settings["klima-taler"]`:

```json
{ "settings": { "klima-taler": true } }
```

An object also enables the module, including an empty object. This key controls module activation only.

Missing, `false`, `null`, arrays, strings and numbers disable it. The top-level `globalSettings["klima-taler"]` key is ignored. A module object always enables the integration; use `false` to disable the module. Provider credentials do not belong in global settings.

An enabled module adds one full-width card to the Home `Widgets` section. An explicit `klima-taler` widget entry controls its position and prevents automatic duplication. Home layouts must include a `Widgets` section. Service tiles with `routeName: "KlimaTaler"` use the same provider entry.

### Widget appearance and actions

Configure the card through `additionalProps` on its entry in `globalSettings.widgets`. Use `widgetName: "klima-taler"`; the existing `"klimaTaler"` spelling is also supported. All options are optional; `true` and an empty module object keep working. Defaults use the app theme, a standard leaf icon and German copy. No provider logo is bundled. Supply a customer-owned HTTPS image URL to use a logo; a failed image falls back to the icon.

```json
{
  "settings": {
    "personalizedWidgets": true,
    "klima-taler": true
  },
  "widgets": [
    "weather",
    "event",
    {
      "widgetName": "klima-taler",
      "id": "climate-balance",
      "additionalProps": {
        "enabled": true,
        "logo": { "uri": "https://example.org/assets/climate-logo.png", "icon": "leaf" },
        "texts": {
          "title": "Dein Klima-Bonus",
          "description": "Taler sammeln. Vorteile vor Ort entdecken.",
          "balance": "Deine Klima-Taler"
        },
        "colors": {
          "background": "#1b7d32",
          "text": "#ffffff",
          "button": "#ffffff",
          "buttonText": "#1b7d32",
          "shortcut": "#419757",
          "shortcutIcon": "#ffffff",
          "dark": {
            "background": "#1e1e1e",
            "text": "#f5f5f5",
            "button": "#8ad996",
            "buttonText": "#141414",
            "shortcut": "#333333",
            "shortcutIcon": "#f5f5f5"
          }
        },
        "styles": { "card": { "borderRadius": 16, "padding": 20 } },
        "actions": {
          "main": { "label": "Mein Bereich", "promoLabel": "Klima-Taler entdecken" },
          "wallet": false,
          "map": false,
          "badges": false,
          "settings": false
        }
      }
    }
  ]
}
```

| Field         | Options                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`     | `false` hides only the card; provider Service tiles and module activation remain available.                                                                                                                                                                                                                                                                                                                                 |
| `texts`       | `title` (promotional title), `description`, `balance` (balance heading/accessibility label), `opening`, `unavailableBalance`, `locale`, `comingSoonTitle`, `comingSoonMessage`.                                                                                                                                                                                                                                             |
| `statusTexts` | `loading`, `disabled`, `unconfigured`, `noSession`, `ready`, `empty`, `error`, `unsupported`, `stale`. Messages provide accessible labels and the detail text for the status indicator. Empty strings suppress individual indicators.                                                                                                                                                                                       |
| `show`        | Boolean switches for `logo`, `title`, `description`, `balance`, `status`; all default to `true`.                                                                                                                                                                                                                                                                                                                            |
| `logo`        | `uri` (HTTPS image), `icon` (SVA named icon fallback), `color` (icon color, defaults to card text), `size` and `promoSize` (icon sizes).                                                                                                                                                                                                                                                                                    |
| `colors`      | `background`, `text`, `button`, `buttonText`, `shortcut`, `shortcutIcon`. Optional `dark` object overrides the same fields in dark mode.                                                                                                                                                                                                                                                                                    |
| `styles`      | React Native JSON style objects for `card`, `summary`, `logo`, `title`, `description`, `balance`, `status`, `actions`, `button`, `buttonText`, `shortcut`. Dimensions use density-independent pixels. Styles override color/layout defaults; balance typography still adapts to available width. The compact status indicator uses only `status.color`; legacy status text layout and typography overrides no longer apply. |
| `actions`     | `main`, `wallet`, `map`, `badges`, `settings`. Each accepts `false` or an object with the fields below.                                                                                                                                                                                                                                                                                                                     |

Action fields are `enabled`, `label`, `promoLabel`, `icon`, `showInPromo`, `target`, `alertTitle`, and `alertMessage`. Main is visible in both card states and opens the provider by default. Other actions are hidden by default until explicitly enabled. Explicit action objects or `true` enable a shortcut. Karte defaults to the public map target and is visible before onboarding as well; other shortcuts retain their configured promotional visibility and show a configurable coming-soon alert unless assigned a supported target. Use `false` or `enabled: false` to hide them. Explicit placeholders remain unsupported product functions, not completed deep links. Their individual `alertTitle`/`alertMessage` override the shared alert copy when nonempty. `target: "provider"` opens the general provider screen; `"comingSoon"` (and unknown targets) shows the alert. `target: "map"` opens the existing POI map with Klima-Taler locations. The badge shortcut defaults to `target: "badges"`, opening the SDK badge page on a compatible native build. Wallet and settings deep links are not implemented. In particular, the wallet shortcut does not open an unrelated SVA wallet. Each shortcut can be hidden independently without affecting the others.

Explicit `additionalProps.texts` values override `text` on the widget entry. Appearance settings under `settings["klima-taler"]` are not read. Settings updates apply on refresh without a native rebuild. Wrong scalar types and unknown fields are ignored. Customer styles should retain readable contrast, text scaling and at least 48-point touch targets.

### Theme and accessibility

The card follows SVA's active light/dark palette through `useTheme`, including customer theme palettes. Colors resolve in this order: active app palette, shared `additionalProps.colors` fields, then `additionalProps.colors.dark` fields when the resolved theme is dark (including system-selected dark mode). Missing or incorrectly typed dark fields retain their shared or palette value. Switching themes updates the mounted widget immediately. Explicit `styles` colors still override these colors, so configure theme-dependent colors in `colors` rather than hard-coding them in `styles`. Accessibility adjustments described below take precedence. It uses the shared text component for system/app text scaling and bold text. At large text sizes, the summary stacks vertically and the balance can wrap instead of shrinking away the user's preferred size.

High contrast takes precedence over widget branding colors and uses the theme's surface/text pairs with visible borders. Reduce Transparency replaces translucent color pairs with opaque theme pairs, removes configured opacity, and disables faded press feedback. Grayscale adapts configured colors; the existing app-wide filter also covers logo images. Reduce Motion replaces the balance refresh spinner with a static icon and suppresses the opening spinner while retaining accessible busy/disabled states; widget ordering continues to use the existing reduced-motion behavior.

Actions have separate screen-reader labels, minimum 48-point touch targets, and coming-soon hints for placeholder destinations. Decorative artwork is excluded from the accessibility tree. The balance includes its meaning in its spoken label and announces updates politely on Android. These settings apply to the SVA widget. The provider's own native screens remain controlled by the Changers SDK; the current SDK bridge has no theme or accessibility preference API.

### Optional widget ordering

The saved order is restored once before navigation mounts and the startup splash is dismissed. Home therefore first renders with the saved order and retains it across screen remounts. Missing, invalid or unreadable local preferences fall back to the configured order without overwriting the stored value.

`globalSettings.settings.personalizedWidgets: true` enables **Anpassen** below the Home widgets. It is off by default. Editing takes place directly on Home: the actual widgets gently wiggle. Holding a widget for 250 ms lifts it with a small scale increase and shadow; its wiggle pauses while held. The other widgets animate into place as it is dragged, and releasing settles it into the previewed position. Widgets keep their component identity when crossing rows, so moving them does not remount their content. Each visual is anchored to the grid independently of its layout slot: reflow animates neighbouring widgets without changing the held widget’s position or width. Releasing it springs it into the final slot. Interrupted gestures restore the order from before that drag. No modal or separate screen opens. Reduce Motion disables the wiggle, lift scaling and animated reflow while keeping drag ordering available. Screen readers offer increment/decrement actions to move a widget forward or backward. Widget actions are inactive while editing, so dragging cannot open the provider or navigate away. **Fertig** saves the order on this installation; cancelling leaves the previous order. A storage failure keeps editing active for retry. Widget sizes remain unchanged; resizing is not part of this feature. Disabling personalization immediately restores the configured order without deleting the saved preference.

The existing global widget list still defines which widgets exist, their texts and per-widget `widgetStyle`. Give object entries an explicit unique `id` when multiple widgets have the same `widgetName`, for example `{ "id": "local-weather", "widgetName": "weather" }`. IDs keep preferences stable across label and server-order changes. Without IDs, identity uses widget name plus occurrence. Removed widgets are ignored and new widgets are appended to a saved order. Remote feature visibility always takes precedence; users cannot re-enable a remotely hidden widget.

Compact widgets share each row's full available width, including incomplete rows. The Klima-Taler card occupies a full-width row at its configured or personalized position. The grid owns vertical spacing for all widget types: a normalized 16-point top inset, 24-point row gaps and a 16-point bottom inset before the next section. Compact widget content does not add another vertical inset inside this grid. These rules also apply when the card is first, between compact rows, or the only widget. With personalization enabled, the bottom grid inset is replaced by the controls' own spacing. The edit button uses the service tile editor's normalized 14-point vertical padding and retains a minimum 48-point touch target. Editing and reordering use the same grid spacing.

`SettingsProvider` applies configuration when global settings load or change. Disabling hides the widget and Service tiles, cancels pending UI results, closes provider UI and requests `stopTracking`. It preserves the provider identity and activation history for later re-enabling. An offline app learns configuration changes only when settings refresh. Enabling does not grant permissions or register an account; provider onboarding still controls consent.

## Native build setup

Install JavaScript dependencies from the checked-in lockfile with `yarn install --frozen-lockfile` before generating native projects. Native module or credential changes require a development build; they cannot be delivered to Expo Go.

1. Supply customer-issued mobile SDK values in `secrets[<expo.slug>]['klima-taler']` in the existing private `src/config/secrets.js`: `clientId` (numeric identifier), `clientSecret`, and `clientName` (provider application identifier / `x-app`). Optional `environment` is `production` (default) or `stage`; it must match the credentials. Existing staging customers must explicitly select `stage`. Empty placeholders are available in both public secret templates.
2. For local iOS builds, run `yarn changers:prepare:ios` before prebuild. The EAS `eas-build-pre-install` hook downloads the same pinned frameworks for iOS builds.
3. Use the normal Expo prebuild and native build workflow. Expo Go cannot load this module.

Credentials are consumed by native build mods and are not serialized in Expo `extra`. The provider requires them in the native binary, where they can be extracted; use only credentials issued for a mobile client, never server-only secrets. Credential changes require a new binary. After installing a compatible binary, global settings toggles require no code changes or rebuild.

## Compatibility

- OTA runtime: `<app version>-changers-8-<environment>`. This isolates native badge-link support and must not share updates with app-version-only or `changers-1` through `changers-7` binaries. Existing activation and registration journals are retained. Install a new native build before publishing matching updates.
- iOS: Changers 4.3.0 / MotionTag 6.3.4, pinned to vendor commit `4bcbd85dcf3d303fd262b2165d5f57fa6c620ad0`.
- Android: `com.github.Changers.Android-SDK:sdk:1.20.7` for production or `sdkstaging:1.20.7` for stage / MotionTag 7.2.5.
- The provider environment is independent of the SVA customer slug. Production uses iOS `.production`, Android `sdk`, and `https://activity.changers.com/api/statistics/sdk`. Stage uses iOS `.stage`, Android `sdkstaging`, and `https://activity.maroshi.de/api/statistics/sdk`. The config plugin writes the same selected environment to native configuration and Android's `expo.changers.environment` Gradle property. Android fails closed if generated credentials and the compiled environment disagree. Production and staging OTA runtimes are isolated.

The plugin preserves existing permission descriptions, activities, providers and backup rules. It enables iOS Scene support through Expo build-properties, requiring the included Expo SDK 57 patch updates. Lifecycle integration uses Expo subscribers rather than edits to generated application delegates.

The iOS vendor frameworks contain arm64 device and arm64/x86_64 simulator slices. Apple Silicon simulators now use the same provider adapter as devices. The config plugin removes the legacy generated simulator hook while preserving customer Podfile hooks. Regenerate the native project and reinstall pods before rebuilding; do not reuse previously patched CocoaPods build output. Simulator support does not establish physical-device permission or background-tracking acceptance.

Android uses the OkHttp 5.1.0 BOM to align MotionTag's HTTP client with React Native/MapLibre's cookie adapter. Mixing the 4.x cookie adapter with the 5.x client causes a missing-class crash. `ChangersBootReceiver` replaces the vendor boot/update receiver. The Expo Application listener restores the last successfully applied native customer gate and previous explicit activation before initializing Changers in a cold process. The receiver forwards only supported boot/update actions after that initialization. Neither path calls `startTracking`, signs up, or requests permissions. The pinned MotionTag implementation restores its persisted session state during initialization; its boot receiver itself only records the event. Actual resumption still requires provider consent, OS permissions and device verification.

The last known gate is intentionally used while JS/network configuration is unavailable. A remote change cannot take effect until received. A successfully persisted disable survives process recreation; a storage failure is reported and stop is still requested. Never-activated, disabled, unreadable-gate or unconfigured installations do not initialize from the background. Re-enabling initializes the SDK if necessary but does not override a provider pause/withdrawn consent state; reopen the provider to manage tracking.

| Lifecycle event                                 | Host behavior / remaining limit                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Process death / OS eviction                     | On the next OS-created process, restore the saved gate and activation. No guarantee that the OS immediately recreates it.             |
| Task dismissed                                  | Does not call logout or stop; vendor service declares `stopWithTask=false`. OEM restrictions still apply.                             |
| User force-stop                                 | No host workaround; user interaction is needed to leave Android's stopped state.                                                      |
| Reboot / package update                         | Initialize under the saved gate, then delegate the broadcast. This is implemented; actual route recording is not yet device-verified. |
| Permission revoked / provider consent withdrawn | Do not call start or grant consent; the provider and OS enforce eligibility. Tracking status remains unknown.                         |
| Remote disable                                  | Persist gate, close UI and request stop, retaining identity. Offline installations cannot observe new settings immediately.           |
| Re-enable                                       | Initialize if required; do not automatically undo a provider stop or consent withdrawal.                                              |

See Android's [background service restrictions](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start) and [stopped-state behavior](https://developer.android.com/about/versions/15/behavior-changes-all#stopped-state).

The production correction changes the provider transport while keeping activation/registration storage keys, the read-only statistics path and provider presentation/close flow. Provider accounts and tokens from stage must not be treated as production identities. It does not wire the new deep-link methods or implement map/offer navigation. Android session accessors remain version-bound and have been checked against the 1.20.7 artifact; the vendor statistics method is still bypassed.

### Switching provider environments

Changing credentials alone does not switch the SDK server. A native rebuild with the matching environment is required; do not reuse staging credentials, tokens or UUIDs against production. The vendor iOS guide requires uninstall/reinstall when changing environments. Do not automatically uninstall, clear data or log out an existing installation: establish a provider-supported recovery/migration plan first. A successful build or launch does not establish that an existing account was migrated.

## Provider entry and widget lifecycle

Provider entry presents above the originating screen without an intermediate SVA route. Repeated taps share one pending request. iOS presents the provider full screen without a host close overlay. The SDK’s own close action/callback returns to the originating app screen; Android uses the existing provider activity and system Back. Closing preserves the account and tracking preference. Failed restoration of an existing session does not silently create another account.

The widget reads iOS `user.coins` or Android `user.recoins`. It distinguishes an actual zero balance from missing, unsupported or failed data. Without a provider session it shows a promotional card. The card uses SVA typography and accessibility text scaling.

The card keeps its compact height during refresh. A small indicator beside the balance shows loading; no status text row or vertical placeholder is added. Errors, unavailable data and stale cached values show an information button in the same space. Tapping it opens the configured message in a native alert. Screen readers receive the complete status label. `show.status: false` hides the indicator, and promotional cards have no status indicator.

The memory-only cache is scoped to provider identity. Home revisits reuse verified values for up to five minutes; pull-to-refresh and provider return request fresh statistics. Backgrounding or provider entry hides old values until identity is revalidated. Temporary failures can display a verified cached value as stale. Late results cannot overwrite a newer session. Rendering and refreshing never activate the module, create accounts or request permissions.

Provider entry pauses new summary reads and waits for an in-flight native statistics request before opening SDK UI. Dismissal or cancellation resumes refreshes; stale results remain hidden and identity is revalidated before displaying a balance.

## Android statistics safety

The vendor `readStatistics()` method logs an authenticated cURL command and may invoke `signup()` after a Forbidden response. The widget does not call it. `ChangersStatisticsClient` instead performs a read-only request to the pinned SDK's HTTPS statistics endpoint using the existing native session.

The dedicated HTTP client has no logging interceptors, shared cookies or cache. Redirects and automatic retries are disabled. Requests time out after 20 seconds, responses are limited to 1 MiB, and only finite numeric `user.recoins` is accepted as a balance. Errors expose fixed codes and messages without response bodies, request details or exception causes. No error path clears credentials, creates an account or changes tracking permissions.

`ChangersStatisticsSession.java` uses environment-specific `ChangersSdkAccess.java` sources to read the matching SDK session without reflection. Production and stage expose different JVM accessor names. Revalidate those accessors, headers, endpoint and response fields when upgrading the vendor SDK. This adapter protects the widget request path; it does not change every logging path inside the vendor SDK.

Android statistics require the native `safeStatistics: true` capability. Older binaries retain the unavailable state even with newer JavaScript. Rebuilding Android enables the balance; the capability was introduced in the `changers-2` runtime; current builds use `changers-8-<environment>`.

## Testing and limitations

Run the repository quality gates:

```sh
yarn lint
yarn test
```

Focused checks:

```sh
yarn test __tests__/klimaTaler --runInBand
cd android
./gradlew :expo-changers:testDebugUnitTest :expo-changers:testReleaseUnitTest
./gradlew :expo-changers:testDebugUnitTest :expo-changers:testReleaseUnitTest -Pexpo.changers.environment=stage
```

The plugin tests cover removal of the legacy simulator workaround. Run the UIKit presentation harness on a booted Apple Silicon simulator with `sh __tests__/klimaTaler/ios/run-presentation-tests.sh <UDID>`.

Device acceptance should cover initial consent, denied and granted permissions, opening/closing, session restoration, widget refresh, disabling the module, and tracking lifecycle. Account deletion, actual background journey collection, buffered data handling and reboot recovery require separate provider/device validation. A separately rendered native badge list and general provider POI details still need data/target contracts. SVA profiles are not synchronized with provider accounts.

### Registration recovery

On iOS, activation and registration are separate. Native status reports `notStarted`, `uncertain`, or `existing`. A known offline path rejects before calling the SDK and leaves registration retryable, including after restarting the app. Activation interrupted before dispatch is also retryable. The attempt marker is persisted before dispatch; repeated taps share the entry request. An existing UUID always uses login, never signup. Logout, tracking stop, and remote disable do not reset the registration history.

A vendor connection error after dispatch is **not** proof that signup failed on the server. Without a UUID, timeout/connection-loss outcomes remain uncertain across restarts and the entry explains that provider recovery is required. The pinned iOS framework exposes no signup idempotency key or lookup for a lost signup response. Automatically retrying these outcomes would risk duplicate accounts. Previously activated installations without a journal/UUID are likewise treated as uncertain. Full recovery of those installations remains a provider dependency.

Run the credential-free native journal harness:

```sh
xcrun swiftc modules/expo-changers/ios/ChangersRegistration.swift __tests__/klimaTaler/ios/RegistrationHarness.swift -o /tmp/changers-registration-tests
/tmp/changers-registration-tests
```

### iOS timeout recovery

The upgraded Changers 4.3.0 public Swift interface stores authentication/setup/statistics delegates on the singleton. It exposes no cancellation handle from register/login/statistics, no documented non-destructive reset, and no request identifier in callbacks. The public `URLSessionDataTaskProtocol.cancel()` is not a request handle returned by those methods. `logoutUser`, `clearCache`, and `stopTrackingAndClearData` are not documented cancellation barriers.

Accordingly the unresolved operation is still quarantined after `E_TIMEOUT`; freeing it would allow an old callback to settle a newer request or mutate its session. Late completion releases the slot and cannot settle the timed-out promise twice. If no callback arrives, a process restart is still required; **the permanent busy defect is not fixed**. Provider delivery needed: cancellable operations with completion acknowledgment, request-scoped delegates, or a documented reset that preserves identity and prevents late callbacks/session mutation. Registration outcomes also remain uncertain across restart, so restarting is not permission to repeat signup.

## Troubleshooting

### iOS scene lifecycle

For an iOS launch failure mentioning `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`, verify that installed Expo dependencies match the lockfile, regenerate the native project with the configured scene-support plugin, and reinstall the affected pods before rebuilding. The generated `UIApplicationSceneManifest` should reference `EXExpoAppSceneDelegate`. Do not patch generated application delegates to bypass the plugin. See Expo's [scene lifecycle guidance](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md).

### Offline provider content

The provider modal can display only `Loading...` while offline, without a specific network error. Content may recover when connectivity returns; this is not a guarantee of bounded timeout recovery. The SDK owns the visible close controls; test its close action while content is still loading. Test offline entry and reconnect with the SDK version and customer configuration being shipped. A wireless development client also depends on Metro for JavaScript reloads, so distinguish a lost development-server connection from provider request failures.

### Tracking status

`tracking: "unknown"` does not establish that tracking is active or stopped. Opening the dashboard, retaining an account or receiving a successful host stop request is not proof of route collection or deletion. Validate consent, OS permissions, background journeys and server-side credit separately. Keep logout, tracking pause, consent withdrawal and server account deletion as distinct operations.

## Extending badge and map support

### Public offer feed foundation

`src/klimaTaler/createOffersClient.ts` provides a read-only client for the public
`/api/v1/map/offers` endpoint. The existing POI map (`LocationOverview`) consumes this feed as an additional data
source. Creating the client does not initialize the SDK, register a user, request location permission
or fetch data. Pass `expo/fetch` as the transport when connecting a screen.

Each `load(environment, query)` explicitly selects `stage` or `production`. The caller
must use the native configuration's environment; do not infer it from the customer slug.
Supply either an area preset or coordinates, optionally a radius of 0.5–25 km. Language
defaults to German and is sent through `Accept-Language`. The client sends no account
headers or cookies and rejects redirects. Detmold is supplied by the caller as
`{ area: 'detmold' }`, not hard-coded into shared map code.

Successful results, including empty results, are cached in memory for five minutes,
separately by environment, language and query. Concurrent identical requests share one
operation. Requests have a 15-second timeout; failures are not cached as empty results.
HTTP 429 blocks further network reads in the affected environment until `Retry-After`
(seconds or HTTP date); a missing/invalid header uses 60 seconds. There are no automatic
retries. Cached successful data can still be read during this interval.

The client validates response coordinates, counts, offers and their documented HTTPS
detail links. It preserves all offers per location, shared offer IDs across locations,
server-adjusted pin positions, empty location images and null offer images. A malformed
response rejects with a fixed error code; raw response bodies and transport errors are
not exposed. The Klima-Taler map remains empty if its feed fails or is empty; it never falls back to backend POIs.

Run `yarn test __tests__/klimaTaler/OffersClient.test.ts --runInBand` to check this layer.
Enable the existing widget's Karte shortcut through
`globalSettings.widgets[].additionalProps.actions.map: true` (or an object with
`enabled: true, target: "map"`). It opens the existing POI overview directly in map
mode with only the Klima-Taler source enabled. Backend POI reads, category filters and the
list switch are disabled for this entry. No standalone screen is added. The shortcut
is also available before onboarding; `showInPromo: false` hides it in that state.
Explicit action targets and disabling the shortcut remain supported. Other POI map
entries keep their existing sources. The existing map's chip
filter includes a Klima-Taler source toggle. External pins share MapLibre clustering and
use an existing fallback marker image. They have namespaced `klima-taler:<id>` IDs; selecting
them never issues a backend POI-detail request. The existing bottom preview shows the partner;
tapping a single-offer partner opens that offer inside the existing Klima-Taler provider.
For multiple offers, tapping the partner reveals an accessible offer selector; an explicit
selection opens that offer, rather than choosing the first one silently. No host POI-detail
page is built and no voucher is redeemed automatically.

Only a positive safe-integer offer ID crosses the new `openOffer` bridge. Both native
platforms independently construct `https://open.klima-taler.com/offers/<id>`; arbitrary
URLs, a location ID and credentials are not passed. iOS uses `handleDeepLink` after the
existing wrapped modal is presented. Android uses `openLink`, or `handleDeepLink` when
its provider activity already exists. External browser navigation and OS-level universal
link registration are not needed for this internal entry.

On iOS 4.3.0, `handleDeepLink` can return `false` after handing an ordinary offer to the
web app. Its Bool is not a navigation-success acknowledgement. The adapter deliberately
ignores that result for its validated offer URL; it must not reject or close the modal.
The native offer-link harness covers both SDK results and the target-free dashboard case.

Changers 4.3.0 retains `isWebAppReadyForDeepLinks` on its singleton after dismissal.
Before constructing a fresh provider web controller, the adapter resets this public flag
so the SDK queues the target until the new web app signals readiness. Reusing an already
presented controller does not reset it. Without this reset, the first offer can open
correctly while subsequent presentations lose their target and remain on the dashboard.

The central entry coordinator still prepares the existing session before presenting.
Repeated taps share a request; retries retain the selected ID. Cancellation during
session preparation prevents late target delivery. The SDK is responsible for deferring
a handed-over offer until its own web app/onboarding is ready. This requires native device
acceptance: especially initial onboarding, closing before completion, reopening the normal
widget, selecting a different offer and remote disable. Host tests cannot prove vendor
queue consumption or cancellation. No target is persisted by the host across process death.
Older binaries fail with the existing app-update message before activation or signup.
Build runtime `changers-7-<environment>` before distributing the current native presentation changes.

The search defaults to the existing `mapSettings.mapCenterPosition` and German content.
Radius is omitted unless configured; the API currently defaults to 10 km. An optional `settings["klima-taler"].offers` object can supply `area`,
`radius` and `language`; shared code does not hard-code a customer. Opening or moving the
map does not request device location or initialize a provider account. Equivalent map
settings and map pans do not trigger additional feed requests.

The source toggle affects Klima-Taler pins. Other map entries retain their existing backend category chips. External locations are hidden when the overview requires opening
hours or a device-centered radius filter, because the public feed cannot verify those
filters. Remote module disable hides pins and preview immediately and ignores late results.
Feed errors and empty results are indicated in the source chip without replacing the map.

Acceptance: open Karte in the Klima-Taler widget, check that only Klima-Taler pins appear,
toggle the source, then open a single-offer partner or select one of multiple offers. Check normal POI selection
and category filters through an ordinary POI map entry. Check dark mode/large text.
An empty staging feed should show `Klima-Taler (0)` without unrelated POI pins.
Automated fixtures cover populated pins/previews; actual populated device testing requires
Changers to supply public staging partners.
The integration reuses the existing `MapLibre` and `ChipFilter` components. Normal POIs
and Klima-Taler locations share `MapPreview`, extracted from the existing location preview,
with consistent inset image/text spacing. Klima-Taler only adds offer selection and provider
navigation as optional preview content. Offer rows reuse `TextListItem` and show the
offer image when supplied. A single-offer preview prefers that image over the partner
image. Availability is displayed as `10+` above ten and as the exact count at ten or below. The separate SVA wallet in the design reference is not a Klima-Taler balance
or an SDK wallet target.

### Remaining provider contracts

Badges use the confirmed provider page link described below; the app does not fetch or synthesize badge records. A separately rendered SVA badge list would still require a JSON contract with stable IDs, labels, images, acquisition state and update signals. The other supplied page links (`app`, `offers`, `teams`, `map`) are reserved for future provider navigation; they do not replace the existing SVA map or wallet flows.

For general partner/location details, a provider target remains unconfirmed. Preserve selected targets across onboarding or session recovery. A public POI feed must not contain personal tracking or account data.

Use the existing SVA map and preview components once these contracts are available. Generic backend POI fields or test fixtures alone do not establish a working provider integration. The current contract targets offers; a general partner/location detail link remains unconfirmed.

## Device acceptance checklist

Use a native binary with the matching runtime and customer-issued configuration. Record results separately for iOS and Android; passing unit tests or a simulator presentation harness does not establish provider or tracking acceptance.

1. On Home, verify that rendering and refreshing the widget do not register an account or request permissions. Check a real zero, a nonzero balance, missing data and stale cached data.
2. On an authorized fresh test installation, attempt entry while offline, reconnect and retry. Repeat with an app restart between attempts. Distinguish definitely undispatched registration from an ambiguous response after dispatch, and verify that repeated taps or restarts do not create duplicate accounts.
3. With an existing account, interrupt login/statistics and restore connectivity. Verify the same identity and balance, and that changing the account cannot display the previous account's cached data.
4. Open and close the provider repeatedly, including rapid taps. Verify balance refresh, compact loading/error indicators, large text and VoiceOver/TalkBack navigation. Test light/dark themes and customer overrides.
5. Disable the module remotely: verify provider closure and the stop request, with identity retained. Restart to verify persisted disable. Re-enable and manage tracking through the provider; independently verify actual stop/server effects.
6. Complete provider consent and test real route recording after backgrounding, OS process recreation, reboot and package update. Test Android force-stop separately and reopen manually. Revoke permissions and provider consent, confirming that the host does not silently restore them.
7. Validate logout, consent withdrawal, account deletion and buffered data separately using disposable accounts where necessary. Never infer deletion from hiding the module or stopping tracking.
8. Review sanitized device logs for sensitive data, verify native/OTA compatibility, and resolve the repository quality gates before release. Badge and POI acceptance additionally require the contracts described above.

## Imported POIs and provider coupons

Instances that import the public feed into Mainserver can use the ordinary POI map,
preview, POI detail and voucher detail instead of the live provider overlay. This is
an explicit instance setting; existing instances retain their current map behavior.
Merge these fields into the existing module configuration:

```json
{
  "settings": {
    "klima-taler": {
      "offers": {
        "source": "mainserver",
        "dataProviderId": "<instance-provider-id>",
        "categoryId": "<instance-category-id>"
      }
    }
  }
}
```

Keep the widget's existing `additionalProps.actions.map: true` setting. Both IDs
must be positive numeric IDs from the same Mainserver instance. Incomplete settings
stop navigation rather than opening an unrestricted map. The category is the initial
`categoryIds` selection; the provider ID is validated but does not constrain the map.
The imported-map route opts into `showAllPoiCategories`: chips load the instance's
active categories with positive POI tree counts, retaining the initial KT category
also at zero count. The initial KT category is placed first so its selected state
is visible without horizontal scrolling. Only KT starts selected; other categories
can be added/removed. In this mode the map owns the category selection and updates
query variables declaratively, avoiding a disposed legacy Apollo `refetch` callback.
Changing categories clears the old selected marker/preview. Existing category
maps retain their previous refetch behavior. The catalog uses a separate minimal query without non-null
variable defaults for compatibility with older Mainserver GraphQL validators.
Marktplatz category scope and the legacy public-feed map retain their defaults. For the current demo
staging import they are provider **601**, category **6013**; these values are not
shared application defaults. Changing `secrets.js` alone does not enable this map
source; configure these non-secret global settings on the matching instance.

Flow: Karte → normal Mainserver map → normal preview → normal POI detail → tap an
imported voucher → native SDK offer detail. The shared POI detail opts into direct
provider opening, including when reached from Marktplatz. Ordinary SVA vouchers
still open their existing voucher detail. Other voucher lists retain the voucher
detail and its **In Klima-Taler nutzen** button. Both entry points share availability,
duplicate-tap protection and failure recovery. The database coupon ID
remains the SVA route/cache identity; the validated `payload.klimaTaler.offerId`
is the provider destination. The native runtime environment must match the
coupon's imported environment. No user credentials are stored in this payload.

The importer writes schema version 1 with `redemptionMode: "provider"`, environment,
location/offer IDs, cost, remaining stock and canonical provider deeplink. Imported
coupons have no SVA quota/discount fields, require no local voucher login and do
not call local quota redemption. Invalid provider metadata cannot fall back to
local redemption. Lists display `10+` above ten remaining coupons and exact values
at ten or below; depleted imported coupons are excluded from available lists.
Provider stock is a database snapshot and Changers remains authoritative at use time.
Ordinary SVA coupons retain their existing login, quota and redemption flow.

Test on the matching staging instance:

1. Configure the imported source and both instance IDs. Open Karte and verify only
   KT starts selected, with the other POI category chips also available. Select
   another category and deselect KT to show ordinary POIs. Close/reopen to verify
   the initial KT selection and compare with the unchanged Marktplatz scope.
2. Tap a pin, then its preview. The ordinary POI detail must open without the SDK.
3. Select an imported coupon on the POI detail. Verify that the SDK opens the matching
   offer directly, without an intermediate SVA voucher detail. Close it, then repeat
   with the same and another coupon. Repeat after reaching the POI from Marktplatz.
4. Open an imported coupon from an ordinary voucher list. Its existing detail and
   **In Klima-Taler nutzen** button must still open the matching SDK offer.
5. Verify an ordinary SVA coupon on either POI detail or voucher lists still follows
   its existing detail, login and redemption flow. Disabled KT, depleted stock,
   mismatched environments and invalid provider metadata must not open an offer.
6. Disable the override and verify the existing direct provider map remains available.

The Mainserver `preserveVouchers` opt-in must be deployed before ongoing imports
update existing POIs or append coupons. This app change does not deploy that API.
It reuses the existing native bridge and requires the compatible Changers binary
from the SDK feature branch; it adds no new native API or runtime requirement.


## Badge shortcut

Enable the existing widget shortcut through `additionalProps.actions`:

```json
{ "actions": { "badges": true } }
```

Existing explicit action options remain supported, for example `"badges": { "enabled": true, "label": "Deine Badges", "target": "badges" }`. Remove a previously configured `target: "comingSoon"` override to use the new default destination. The shortcut stays opt-in and is hidden before onboarding by default, like the existing customer configuration. Set `showInPromo: true` explicitly if it should also start onboarding.

The medal shortcut opens the existing full-screen SDK modal at `https://open.klima-taler.com/badges`. These are provider page links, not a public JSON badge API. The authenticated SDK renders badge data, progress and images; the host supplies no example badge artwork or invented achievements. Provider styling may differ from the design reference.

Both platforms use the same session coordinator as dashboard/offer entry. iOS resets web readiness for each new modal, then forwards the link after presentation. Android opens the link through `Changers.openLink` or forwards it to the current provider activity. Only the fixed `badges` target is accepted for this feature; arbitrary URLs, query strings and unimplemented page names are rejected. Existing marketplace behavior is retained.

The native `badgeLinks` capability and `changers-8-<environment>` runtime require a new iOS/Android binary. Older binaries report unavailable rather than opening the dashboard. The JavaScript bridge preserves the badge target on retries and after closing/reopening, and disabling the module uses the existing close/cancellation flow without discarding the account.

Device acceptance: enable the shortcut, open Badges, verify the SDK list, close with the SDK control and reopen twice. Then open an imported coupon and dashboard to verify independent destinations. Check an existing signed-out session and an explicitly enabled promotional shortcut; onboarding must precede badge display and existing accounts must not be replaced. Test Android separately on a matching native build.

Provider references: [iOS deep links](https://github.com/Changers/changers-ios-sdk#5-deep-links), [Android deep links](https://github.com/Changers/Sample-Android-SDK#5-deep-links).
