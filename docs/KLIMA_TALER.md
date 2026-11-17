# Klima-Taler integration

Klima-Taler uses the Changers native SDK for provider screens, onboarding, consent and tracking. The provider account is independent of the SVA profile. The shared app includes the native module; each customer controls its availability through the existing global settings.

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
          "wallet": { "enabled": true },
          "map": false,
          "badges": { "enabled": true },
          "settings": { "enabled": true }
        }
      }
    }
  ]
}
```

| Field         | Options                                                                                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enabled`     | `false` hides only the card; provider Service tiles and module activation remain available.                                                                                                                                                                                                      |
| `texts`       | `title` (promotional title), `description`, `balance` (balance heading/accessibility label), `opening`, `unavailableBalance`, `locale`, `comingSoonTitle`, `comingSoonMessage`.                                                                                                                  |
| `statusTexts` | `loading`, `disabled`, `unconfigured`, `noSession`, `ready`, `empty`, `error`, `unsupported`, `stale`. Empty strings suppress individual messages.                                                                                                                                               |
| `show`        | Boolean switches for `logo`, `title`, `description`, `balance`, `status`; all default to `true`.                                                                                                                                                                                                 |
| `logo`        | `uri` (HTTPS image), `icon` (SVA named icon fallback), `color` (icon color, defaults to card text), `size` and `promoSize` (icon sizes).                                                                                                                                                         |
| `colors`      | `background`, `text`, `button`, `buttonText`, `shortcut`, `shortcutIcon`. Optional `dark` object overrides the same fields in dark mode.                                                                                                                                                         |
| `styles`      | React Native JSON style objects for `card`, `summary`, `logo`, `title`, `description`, `balance`, `status`, `actions`, `button`, `buttonText`, `shortcut`. Dimensions use density-independent pixels. Styles override color/layout defaults; balance typography still adapts to available width. |
| `actions`     | `main`, `wallet`, `map`, `badges`, `settings`. Each accepts `false` or an object with the fields below.                                                                                                                                                                                          |

Action fields are `enabled`, `label`, `promoLabel`, `icon`, `showInPromo`, `target`, `alertTitle`, and `alertMessage`. Main is visible in both card states and opens the provider by default. Other actions are visible after onboarding, and display the configurable coming-soon alert. Their individual `alertTitle`/`alertMessage` override the shared alert copy when nonempty. `target: "provider"` opens the general provider screen; `"comingSoon"` (and unknown targets) shows the alert. Wallet, map, badge and settings deep links are not implemented. In particular, the wallet shortcut does not open an unrelated SVA wallet. Each shortcut can be hidden independently without affecting the others.

Explicit `additionalProps.texts` values override `text` on the widget entry. Appearance settings under `settings["klima-taler"]` are not read. Settings updates apply on refresh without a native rebuild. Wrong scalar types and unknown fields are ignored. Customer styles should retain readable contrast, text scaling and at least 48-point touch targets.

### Theme and accessibility

The card follows SVA's active light/dark palette through `useTheme`, including customer theme palettes. Colors resolve in this order: active app palette, shared `additionalProps.colors` fields, then `additionalProps.colors.dark` fields when the resolved theme is dark (including system-selected dark mode). Missing or incorrectly typed dark fields retain their shared or palette value. Switching themes updates the mounted widget immediately. Explicit `styles` colors still override these colors, so configure theme-dependent colors in `colors` rather than hard-coding them in `styles`. Accessibility adjustments described below take precedence. It uses the shared text component for system/app text scaling and bold text. At large text sizes, the summary stacks vertically and the balance can wrap instead of shrinking away the user's preferred size.

High contrast takes precedence over widget branding colors and uses the theme's surface/text pairs with visible borders. Reduce Transparency replaces translucent color pairs with opaque theme pairs, removes configured opacity, and disables faded press feedback. Grayscale adapts configured colors; the existing app-wide filter also covers logo images. Reduce Motion suppresses the opening spinner while retaining its accessible busy/disabled state; widget ordering continues to use the existing reduced-motion behavior.

Actions have separate screen-reader labels, minimum 48-point touch targets, and coming-soon hints for placeholder destinations. Decorative artwork is excluded from the accessibility tree. The balance includes its meaning in its spoken label and announces updates politely on Android. These settings apply to the SVA widget. The provider's own native screens remain controlled by the Changers SDK; the current SDK bridge has no theme or accessibility preference API.

### Optional widget ordering

`globalSettings.settings.personalizedWidgets: true` enables **Anpassen** below the Home widgets. It is off by default. Editing takes place directly on Home: the actual widgets gently wiggle. Holding a widget for 250 ms lifts it with a small scale increase and shadow; its wiggle pauses while held. The other widgets animate into place as it is dragged, and releasing settles it into the previewed position. Widgets keep their component identity when crossing rows, so moving them does not remount their content. Each visual is anchored to the grid independently of its layout slot: reflow animates neighbouring widgets without changing the held widget’s position or width. Releasing it springs it into the final slot. Interrupted gestures restore the order from before that drag. No modal or separate screen opens. Reduce Motion disables the wiggle, lift scaling and animated reflow while keeping drag ordering available. Screen readers offer increment/decrement actions to move a widget forward or backward. Widget actions are inactive while editing, so dragging cannot open the provider or navigate away. **Fertig** saves the order on this installation; cancelling leaves the previous order. A storage failure keeps editing active for retry. Widget sizes remain unchanged; resizing is not part of this feature. Disabling personalization immediately restores the configured order without deleting the saved preference.

The existing global widget list still defines which widgets exist, their texts and per-widget `widgetStyle`. Give object entries an explicit unique `id` when multiple widgets have the same `widgetName`, for example `{ "id": "local-weather", "widgetName": "weather" }`. IDs keep preferences stable across label and server-order changes. Without IDs, identity uses widget name plus occurrence. Removed widgets are ignored and new widgets are appended to a saved order. Remote feature visibility always takes precedence; users cannot re-enable a remotely hidden widget.

Compact widgets share each row's full available width, including incomplete rows. The Klima-Taler card occupies a full-width row at its configured or personalized position.

`SettingsProvider` applies configuration when global settings load or change. Disabling hides the widget and Service tiles, cancels pending UI results, closes provider UI and requests `stopTracking`. It preserves the provider identity and activation history for later re-enabling. An offline app learns configuration changes only when settings refresh. Enabling does not grant permissions or register an account; provider onboarding still controls consent.

## Native build setup

1. Supply customer-issued mobile SDK values in `secrets[<expo.slug>]['klima-taler']` in the existing private `src/config/secrets.js`: `clientId` (numeric identifier), `clientSecret`, and `clientName` (provider application identifier / `x-app`). Empty placeholders are available in both public secret templates.
2. For local iOS builds, run `sh scripts/fetch-changers-ios-frameworks.sh` before prebuild. The EAS `eas-build-pre-install` hook downloads the same pinned frameworks for iOS builds.
3. Use the normal Expo prebuild and native build workflow. Expo Go cannot load this module.

Credentials are consumed by native build mods and are not serialized in Expo `extra`. The provider requires them in the native binary, where they can be extracted; use only credentials issued for a mobile client, never server-only secrets. Credential changes require a new binary. After installing a compatible binary, global settings toggles require no code changes or rebuild.

## Compatibility

- OTA runtime: `<app version>-changers-3`. This includes the native registration attempt journal and must not share updates with app-version-only, `changers-1` or `changers-2` binaries. Install a new native build before publishing matching updates.
- iOS: Changers 4.2.0 / MotionTag 6.3.4, pinned to vendor commit `33c65f9b8db1618dfff3530c73a061935a66a9ff`.
- Android: `com.github.Changers.Android-SDK:sdkstaging:1.20.6` / MotionTag 7.2.5.
- The provider connection uses iOS `.stage` and Android `sdkstaging`. These names are vendor transport identifiers, not SVA customer environment selectors.

The plugin preserves existing permission descriptions, activities, providers and backup rules. It enables iOS Scene support through Expo build-properties, requiring the included Expo SDK 57 patch updates. Lifecycle integration uses Expo subscribers rather than edits to generated application delegates.

The iOS vendor framework contains arm64 device and x86_64 simulator slices, but no arm64 simulator slice. Apple Silicon simulator builds use an unavailable adapter (`E_SIMULATOR_UNSUPPORTED`). A prebuild-persistent CocoaPods hook excludes only that unsupported framework from linking and embedding. Provider testing requires a supported native target.

Android uses the OkHttp 5.1.0 BOM to align MotionTag's HTTP client with React Native/MapLibre's cookie adapter. Mixing the 4.x cookie adapter with the 5.x client causes a missing-class crash. `ChangersBootReceiver` replaces the vendor boot/update receiver and delegates only after settings, activation and SDK initialization permit it. Cold boot/update broadcasts do not initialize the SDK; automatic tracking resumption while the app remains closed is not implemented.

## Provider entry and widget lifecycle

Provider entry presents above the originating screen without an intermediate SVA route. Repeated taps share one pending request. iOS provides an accessible close control over the provider content; Android uses the provider activity and system Back. Closing preserves the account and tracking preference. Failed restoration of an existing session does not silently create another account.

The widget reads iOS `user.coins` or Android `user.recoins`. It distinguishes an actual zero balance from missing, unsupported or failed data. Without a provider session it shows a promotional card. The card uses SVA typography and accessibility text scaling.

The memory-only cache is scoped to provider identity. Home revisits reuse verified values for up to five minutes; pull-to-refresh and provider return request fresh statistics. Backgrounding or provider entry hides old values until identity is revalidated. Temporary failures can display a verified cached value as stale. Late results cannot overwrite a newer session. Rendering and refreshing never activate the module, create accounts or request permissions.

Provider entry pauses summary refreshes and waits for an in-flight native statistics request to finish before presenting the provider. Invalidation only hides stale values; it does not cancel the native SDK operation. On dismissal or cancellation, refreshes resume, and subsequent reads wait for the previous native read to release its operation slot.

## Android statistics safety

The vendor `readStatistics()` method logs an authenticated cURL command and may invoke `signup()` after a Forbidden response. The widget does not call it. `ChangersStatisticsClient` instead performs a read-only request to the pinned SDK's HTTPS statistics endpoint using the existing native session.

The dedicated HTTP client has no logging interceptors, shared cookies or cache. Redirects and automatic retries are disabled. Requests time out after 20 seconds, responses are limited to 1 MiB, and only finite numeric `user.recoins` is accepted as a balance. Errors expose fixed codes and messages without response bodies, request details or exception causes. No error path clears credentials, creates an account or changes tracking permissions.

`ChangersStatisticsSession.java` isolates version-specific JVM accessors to the SDK's session. Revalidate those accessors, headers, endpoint and response fields when upgrading the vendor SDK. This adapter protects the widget request path; it does not change every logging path inside the vendor SDK.

Android statistics require the native `safeStatistics: true` capability. Older binaries retain the unavailable state even with newer JavaScript. Rebuilding Android enables the balance; the capability was introduced in the `changers-2` runtime; current builds use `changers-3`.

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
```

iOS compatibility checks are in `__tests__/klimaTaler/simulator_compatibility_test.rb`. Run the UIKit presentation harness on a booted Apple Silicon simulator with `sh __tests__/klimaTaler/ios/run-presentation-tests.sh <UDID>`.

Device acceptance should cover initial consent, denied and granted permissions, opening/closing, session restoration, widget refresh, disabling the module, and tracking lifecycle. Account deletion, actual background journey collection, buffered data handling and reboot recovery require separate provider/device validation. Map/POI navigation, badge data and SVA profile linkage are not implemented.

### Registration recovery (SVAK-228 / SVAK-230)

On iOS, activation and registration are separate. Native status reports `notStarted`, `uncertain`, or `existing`. A known offline path rejects before calling the SDK and leaves registration retryable, including after restarting the app. Activation interrupted before dispatch is also retryable. The attempt marker is persisted before dispatch; repeated taps share the entry request. An existing UUID always uses login, never signup. Logout, tracking stop, and remote disable do not reset the registration history.

A vendor connection error after dispatch is **not** proof that signup failed on the server. Without a UUID, timeout/connection-loss outcomes remain uncertain across restarts and the entry explains that provider recovery is required. The pinned iOS framework exposes no signup idempotency key or lookup for a lost signup response. Automatically retrying these outcomes would risk duplicate accounts. Previously activated installations without a journal/UUID are likewise treated as uncertain. Full recovery of those installations remains a provider dependency.

Run the credential-free native journal harness:

```sh
xcrun swiftc modules/expo-changers/ios/ChangersRegistration.swift __tests__/klimaTaler/ios/RegistrationHarness.swift -o /tmp/changers-registration-tests
/tmp/changers-registration-tests
```
