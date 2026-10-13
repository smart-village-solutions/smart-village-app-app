# Klima-Taler integration

Klima-Taler uses the Changers native SDK for provider screens, onboarding, consent and tracking. The provider account is independent of the SVA profile. The shared app includes the native module; each customer controls its availability through the existing global settings.

For clean-checkout iOS framework preparation and native build requirements, see [Native build setup](KLIMA_TALER_NATIVE_SETUP.md). Historical device notes are not current release acceptance evidence.

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

Action fields are `enabled`, `label`, `promoLabel`, `icon`, `showInPromo`, `target`, `alertTitle`, and `alertMessage`. Main is visible in both card states and opens the provider by default. Other actions are hidden by default until their destinations are available. Existing explicit action objects or `true` keep their configured visibility after onboarding, and display the configurable coming-soon alert unless assigned a supported target. Use `false` or `enabled: false` to hide them. Explicit placeholders remain unsupported product functions, not completed deep links. Their individual `alertTitle`/`alertMessage` override the shared alert copy when nonempty. `target: "provider"` opens the general provider screen; `"comingSoon"` (and unknown targets) shows the alert. Wallet, map, badge and settings deep links are not implemented. In particular, the wallet shortcut does not open an unrelated SVA wallet. Each shortcut can be hidden independently without affecting the others.

Explicit `additionalProps.texts` values override `text` on the widget entry. Appearance settings under `settings["klima-taler"]` are not read. Settings updates apply on refresh without a native rebuild. Wrong scalar types and unknown fields are ignored. Customer styles should retain readable contrast, text scaling and at least 48-point touch targets.

### Theme and accessibility

The card follows SVA's active light/dark palette through `useTheme`, including customer theme palettes. Colors resolve in this order: active app palette, shared `additionalProps.colors` fields, then `additionalProps.colors.dark` fields when the resolved theme is dark (including system-selected dark mode). Missing or incorrectly typed dark fields retain their shared or palette value. Switching themes updates the mounted widget immediately. Explicit `styles` colors still override these colors, so configure theme-dependent colors in `colors` rather than hard-coding them in `styles`. Accessibility adjustments described below take precedence. It uses the shared text component for system/app text scaling and bold text. At large text sizes, the summary stacks vertically and the balance can wrap instead of shrinking away the user's preferred size.

High contrast takes precedence over widget branding colors and uses the theme's surface/text pairs with visible borders. Reduce Transparency replaces translucent color pairs with opaque theme pairs, removes configured opacity, and disables faded press feedback. Grayscale adapts configured colors; the existing app-wide filter also covers logo images. Reduce Motion replaces the balance refresh spinner with a static icon and suppresses the opening spinner while retaining accessible busy/disabled states; widget ordering continues to use the existing reduced-motion behavior.

Actions have separate screen-reader labels, minimum 48-point touch targets, and coming-soon hints for placeholder destinations. Decorative artwork is excluded from the accessibility tree. The balance includes its meaning in its spoken label and announces updates politely on Android. These settings apply to the SVA widget. The provider's own native screens remain controlled by the Changers SDK; the current SDK bridge has no theme or accessibility preference API.

### Optional widget ordering

The saved order is restored once before navigation mounts and the startup splash is dismissed. Home therefore first renders with the saved order and retains it across screen remounts. Missing, invalid or unreadable local preferences fall back to the configured order without overwriting the stored value.

`globalSettings.settings.personalizedWidgets: true` enables **Anpassen** below the Home widgets. It is off by default. Editing takes place directly on Home: the actual widgets gently wiggle. Holding a widget for 250 ms lifts it with a small scale increase and shadow; its wiggle pauses while held. The other widgets animate into place as it is dragged, and releasing settles it into the previewed position. Widgets keep their component identity when crossing rows, so moving them does not remount their content. Each visual is anchored to the grid independently of its layout slot: reflow animates neighbouring widgets without changing the held widget’s position or width. Releasing it springs it into the final slot. Interrupted gestures restore the order from before that drag. No modal or separate screen opens. Reduce Motion disables the wiggle, lift scaling and animated reflow while keeping drag ordering available. Screen readers offer increment/decrement actions to move a widget forward or backward. Widget actions are inactive while editing, so dragging cannot open the provider or navigate away. **Fertig** saves the order on this installation; cancelling leaves the previous order. A storage failure keeps editing active for retry. Widget sizes remain unchanged; resizing is not part of this feature. Disabling personalization immediately restores the configured order without deleting the saved preference.

The existing global widget list still defines which widgets exist, their texts and per-widget `widgetStyle`. Give object entries an explicit unique `id` when multiple widgets have the same `widgetName`, for example `{ "id": "local-weather", "widgetName": "weather" }`. IDs keep preferences stable across label and server-order changes. Without IDs, identity uses widget name plus occurrence. Removed widgets are ignored and new widgets are appended to a saved order. Remote feature visibility always takes precedence; users cannot re-enable a remotely hidden widget.

Compact widgets share each row's full available width, including incomplete rows. The Klima-Taler card occupies a full-width row at its configured or personalized position.

`SettingsProvider` applies configuration when global settings load or change. Disabling hides the widget and Service tiles, cancels pending UI results, closes provider UI and requests `stopTracking`. It preserves the provider identity and activation history for later re-enabling. An offline app learns configuration changes only when settings refresh. Enabling does not grant permissions or register an account; provider onboarding still controls consent.

## Native build setup

Install JavaScript dependencies from the checked-in lockfile with `yarn install --frozen-lockfile` before generating native projects. Native module or credential changes require a development build; they cannot be delivered to Expo Go.

1. Supply customer-issued mobile SDK values in `secrets[<expo.slug>]['klima-taler']` in the existing private `src/config/secrets.js`: `clientId` (numeric identifier), `clientSecret`, and `clientName` (provider application identifier / `x-app`). Empty placeholders are available in both public secret templates.
2. For local iOS builds, run `yarn changers:prepare:ios` before prebuild. The EAS `eas-build-pre-install` hook downloads the same pinned frameworks for iOS builds.
3. Use the normal Expo prebuild and native build workflow. Expo Go cannot load this module.

Credentials are consumed by native build mods and are not serialized in Expo `extra`. The provider requires them in the native binary, where they can be extracted; use only credentials issued for a mobile client, never server-only secrets. Credential changes require a new binary. After installing a compatible binary, global settings toggles require no code changes or rebuild.

## Compatibility

- OTA runtime: `<app version>-changers-3`. This includes the native registration attempt journal and must not share updates with app-version-only, `changers-1` or `changers-2` binaries. Install a new native build before publishing matching updates.
- iOS: Changers 4.2.0 / MotionTag 6.3.4, pinned to vendor commit `33c65f9b8db1618dfff3530c73a061935a66a9ff`.
- Android: `com.github.Changers.Android-SDK:sdkstaging:1.20.6` / MotionTag 7.2.5.
- The provider connection uses iOS `.stage` and Android `sdkstaging`. These names are vendor transport identifiers, not SVA customer environment selectors.

The plugin preserves existing permission descriptions, activities, providers and backup rules. It enables iOS Scene support through Expo build-properties, requiring the included Expo SDK 57 patch updates. Lifecycle integration uses Expo subscribers rather than edits to generated application delegates.

The iOS vendor framework contains arm64 device and x86_64 simulator slices, but no arm64 simulator slice. Apple Silicon simulator builds use an unavailable adapter (`E_SIMULATOR_UNSUPPORTED`). A prebuild-persistent CocoaPods hook excludes only that unsupported framework from linking and embedding. Provider testing requires a supported native target.

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

## Provider entry and widget lifecycle

Provider entry presents above the originating screen without an intermediate SVA route. Repeated taps share one pending request. iOS provides an accessible close control over the provider content; Android uses the provider activity and system Back. Closing preserves the account and tracking preference. Failed restoration of an existing session does not silently create another account.

The widget reads iOS `user.coins` or Android `user.recoins`. It distinguishes an actual zero balance from missing, unsupported or failed data. Without a provider session it shows a promotional card. The card uses SVA typography and accessibility text scaling.

The card keeps its compact height during refresh. A small indicator beside the balance shows loading; no status text row or vertical placeholder is added. Errors, unavailable data and stale cached values show an information button in the same space. Tapping it opens the configured message in a native alert. Screen readers receive the complete status label. `show.status: false` hides the indicator, and promotional cards have no status indicator.

The memory-only cache is scoped to provider identity. Home revisits reuse verified values for up to five minutes; pull-to-refresh and provider return request fresh statistics. Backgrounding or provider entry hides old values until identity is revalidated. Temporary failures can display a verified cached value as stale. Late results cannot overwrite a newer session. Rendering and refreshing never activate the module, create accounts or request permissions.

Provider entry pauses new summary reads and waits for an in-flight native statistics request before opening SDK UI. Dismissal or cancellation resumes refreshes; stale results remain hidden and identity is revalidated before displaying a balance.

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

Device acceptance should cover initial consent, denied and granted permissions, opening/closing, session restoration, widget refresh, disabling the module, and tracking lifecycle. Account deletion, actual background journey collection, buffered data handling and reboot recovery require separate provider/device validation. Map/POI navigation and badge data remain pending contracts. SVA profiles are not synchronized with provider accounts.

### Registration recovery

On iOS, activation and registration are separate. Native status reports `notStarted`, `uncertain`, or `existing`. A known offline path rejects before calling the SDK and leaves registration retryable, including after restarting the app. Activation interrupted before dispatch is also retryable. The attempt marker is persisted before dispatch; repeated taps share the entry request. An existing UUID always uses login, never signup. Logout, tracking stop, and remote disable do not reset the registration history.

A vendor connection error after dispatch is **not** proof that signup failed on the server. Without a UUID, timeout/connection-loss outcomes remain uncertain across restarts and the entry explains that provider recovery is required. The pinned iOS framework exposes no signup idempotency key or lookup for a lost signup response. Automatically retrying these outcomes would risk duplicate accounts. Previously activated installations without a journal/UUID are likewise treated as uncertain. Full recovery of those installations remains a provider dependency.

Run the credential-free native journal harness:

```sh
xcrun swiftc modules/expo-changers/ios/ChangersRegistration.swift __tests__/klimaTaler/ios/RegistrationHarness.swift -o /tmp/changers-registration-tests
/tmp/changers-registration-tests
```

### iOS timeout recovery

The pinned Changers 4.2.0 public Swift interface stores authentication/setup/statistics delegates on the singleton. It exposes no cancellation handle from register/login/statistics, no documented non-destructive reset, and no request identifier in callbacks. The public `URLSessionDataTaskProtocol.cancel()` is not a request handle returned by those methods. `logoutUser`, `clearCache`, and `stopTrackingAndClearData` are not documented cancellation barriers.

Accordingly the unresolved operation is still quarantined after `E_TIMEOUT`; freeing it would allow an old callback to settle a newer request or mutate its session. Late completion releases the slot and cannot settle the timed-out promise twice. If no callback arrives, a process restart is still required; **the permanent busy defect is not fixed**. Provider delivery needed: cancellable operations with completion acknowledgment, request-scoped delegates, or a documented reset that preserves identity and prevents late callbacks/session mutation. Registration outcomes also remain uncertain across restart, so restarting is not permission to repeat signup.

## Troubleshooting

### iOS scene lifecycle

For an iOS launch failure mentioning `UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`, verify that installed Expo dependencies match the lockfile, regenerate the native project with the configured scene-support plugin, and reinstall the affected pods before rebuilding. The generated `UIApplicationSceneManifest` should reference `EXExpoAppSceneDelegate`. Do not patch generated application delegates to bypass the plugin. See Expo's [scene lifecycle guidance](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md).

### Offline provider content

The provider sheet can display only `Loading...` while offline, without a specific network error. Content may recover when connectivity returns; this is not a guarantee of bounded timeout recovery. The host close control remains separate from the provider content. Test offline entry and reconnect with the SDK version and customer configuration being shipped. A wireless development client also depends on Metro for JavaScript reloads, so distinguish a lost development-server connection from provider request failures.

### Tracking status

`tracking: "unknown"` does not establish that tracking is active or stopped. Opening the dashboard, retaining an account or receiving a successful host stop request is not proof of route collection or deletion. Validate consent, OS permissions, background journeys and server-side credit separately. Keep logout, tracking pause, consent withdrawal and server account deletion as distinct operations.

## Extending badge and map support

Do not synthesize badge values or assume that generic provider navigation opens a wallet, badge or POI detail. These features require confirmed provider contracts before implementation.

For badges, obtain stable IDs, labels, images, acquisition state and update signals. For map integration, obtain the public feed's customer/source identification, stable partner/site/offer IDs, coordinates, title, image fallback, validity/deletion rules, pagination and synchronization behavior, plus a verified provider detail target for each platform. Preserve the selected target across onboarding or session recovery. A public POI feed must not contain personal tracking or account data.

Use the existing SVA map and preview components once these contracts are available. Generic backend POI fields or test fixtures alone do not establish a working provider integration.

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
