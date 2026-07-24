# Accessibility Settings

## Overview

This document describes the app-level accessibility settings introduced on top of the existing system accessibility support.

The feature has three goals:

1. Allow app operators to enable/disable accessibility capabilities globally via `globalSettings`.
2. Allow users to manage accessibility preferences from:
   - the **Settings** screen, and
   - the **header accessibility modal**.
3. Persist user preferences locally so selections survive app restarts.

In addition, pull requests are validated with a PR-scoped accessibility workflow that reports missing accessibility requirements per changed component.

## PR Accessibility Workflow (Component-Scoped)

The CI workflow is defined in:

- `.github/workflows/accessibility-checks.yml`

PR behavior:

1. Detect changed files in the PR diff.
2. Scope accessibility checks to changed files under:
   - `src/components`
   - `src/screens`
   - `src/navigation`
   - `src/config/navigation`
3. Run ESLint accessibility rules on scoped files.
4. Publish a Markdown/JSON report as build artifacts.
5. Post or update a PR comment with component-level findings.
6. Fail the PR only when scoped component checks fail.

Full accessibility tests still run for visibility, but PR gate/fail status is determined by scoped component findings.

## Configuration Source

Accessibility configuration is read from:

- `globalSettings.settings.accessibility`

If no configuration is provided, all accessibility features are enabled by default.

## Global Configuration Schema

Use the following JSON shape in `globalSettings`:

```json
{
  "settings": {
    "accessibility": {
      "enabledFeatures": {
        "settingsEntry": true,
        "headerEntry": true,
        "textScaling": true,
        "boldText": true,
        "highContrast": true,
        "reduceMotion": true,
        "reduceTransparency": true,
        "readAloud": true
      },
      "defaults": {
        "textScaleLevel": 2,
        "highContrastEnabled": false,
        "reduceMotionEnabled": false,
        "reduceTransparencyEnabled": false,
        "readAloudEnabled": false
      }
    }
  }
}
```

## Configuration Keys

### `enabledFeatures`

Controls which accessibility capabilities are available in the UI and behavior layer.

- `settingsEntry`
  - `true`: show Accessibility section in the Settings screen.
  - `false`: hide Accessibility section from Settings.
- `headerEntry`
  - `true`: show accessibility icon in screen headers.
  - `false`: hide header accessibility icon and modal entry.
- `textScaling`
  - Enables/disables text size controls (`A-`, slider, `A+`) in Settings and Header modal.
  - `boldText` is still read as a backward-compatible alias when `textScaling` is not provided.
- `boldText`
  - Backward-compatible alias for `textScaling`.
- `highContrast`
  - Enables/disables the in-app higher-contrast preference.
- `reduceMotion`
  - Enables/disables in-app reduced-motion preference.
- `reduceTransparency`
  - Enables/disables in-app reduced-transparency preference.
- `readAloud`
  - Enables/disables read-aloud capability toggle (feature gate for detail and HTML-page TTS behavior).

### `defaults`

Defines default user preference values applied when a user has no stored accessibility preferences yet.

- `textScaleLevel` (0..6, where `2` is default/normal size)
- `highContrastEnabled`
- `reduceMotionEnabled`
- `reduceTransparencyEnabled`
- `readAloudEnabled`

## Precedence and Persistence

## Runtime precedence

For motion/transparency/text-scaling-related behavior, effective runtime values are resolved from:

1. system accessibility state (OS),
2. app-level user preference,
3. feature availability (`enabledFeatures`).

This means OS accessibility still works even if the app-level preference is off.

## Local persistence

User selections are stored in local storage under:

- `accessibilityUserSettings`

Behavior:

- If stored settings exist, they are reused.
- If no stored settings exist, `defaults` from `globalSettings` are applied.
- Changes in the Settings screen and header modal update the same stored state.

## User-Facing Behavior

## Settings screen

- Accessibility appears as a dedicated Settings entry when `enabledFeatures.settingsEntry !== false`.
- The screen exposes toggles only for features enabled by `enabledFeatures`.
- A reset action restores values to global defaults (`defaults`).

## Header modal

- Header accessibility icon is shown when `enabledFeatures.headerEntry !== false`.
- Tapping the icon opens a modal with the same toggle set as the Settings screen.
- Changes made in the modal are applied immediately and persisted.

## Feature Behavior Summary

- **Text Size (A- / Slider / A+)**
  - Controls app typography scale level and persists user preference.
  - Applied to app text components and HTML rendering (`Text`, `HtmlView`).
- **High Contrast**
  - Replaces low-contrast text colors in app text rendering with stronger contrast where applicable.
- **Reduce Motion**
  - Exposes reduced-motion state in accessibility context.
  - Stack navigation transitions are disabled in reduced-motion mode.
  - Image/media carousel autoplay and pause controls are disabled in reduced-motion mode.
  - Onboarding terms modal switches to `animationType="none"` in reduced-motion mode.
- **Reduce Transparency**
  - Exposes reduced-transparency state for app-level transparency handling.
  - Already consumed in several UI components (`Input`, `Switch`, `Results`, `VersionNumber`, etc.).
- **Read Aloud (Feature Gate)**
  - Provides a persisted toggle and feature gate.
  - Adds detail page TTS playback controls (start, pause, resume, stop).
  - Adds TTS playback controls to static HTML screens (`HtmlScreen`).
  - Displays read-aloud controls directly below the media slider/image area on supported detail screens.
  - Supports in-screen speech speed selection (`0.8x`, `1.0x`, `1.2x`).
  - The read-along text panel can be toggled on/off by the user.
  - When **High Contrast** is enabled, the currently spoken word is highlighted in the read-aloud panel (dark background / light text).
  - Reads detail content block-by-block in display order.
  - Uses `expo-speech` and automatically chunks long strings according to `Speech.maxSpeechInputLength`.
  - Stops playback when app goes to background or when leaving the screen.

### Read Aloud Coverage (Screen-by-Screen)

When `enabledFeatures.readAloud` is enabled and user preference `readAloudEnabled` is on, TTS controls are available on the following screens:

1. Core detail and HTML foundations
   - `DetailScreen` (detail content blocks, media/detail layout flow)
   - `HtmlScreen` (generic static HTML pages)
   - `NestedInfoScreen` (header HTML section)
   - `MultiButtonScreen` (per-item HTML intro blocks)
2. City and onboarding-related informational content
   - `CitySelectionScreen` (city intro HTML)
3. Voucher flow
   - `VoucherHomeScreen` (home intro HTML)
   - `VoucherLoginScreen` (login intro HTML)
   - `VoucherDetailScreen` (content block bodies, per block)
4. Wallet flow
   - `WalletHomeScreen` (wallet info/help HTML)
5. Reporting and forms
   - `DefectReportFormScreen` (intro HTML)
   - `NoticeboardFormScreen` (form/detail HTML)
   - `EventSuggestionScreen` (intro HTML)
   - `WhistleblowFormScreen` (intro HTML)
   - `WhistleblowCodeScreen` (edit info + code page HTML)
6. Volunteer flow
   - `VolunteerIndexScreen` (groups intro HTML)
   - `VolunteerGroupSearchScreen` (group search intro HTML)
   - `VolunteerRegisteredScreen` (registration success HTML)
7. Profile flow
   - `ProfileSignupScreen` (signup intro HTML)
   - `ProfileDeleteScreen` (top + bottom informational HTML)
   - `ProfileEditMailScreen` (top + bottom informational HTML)
   - `ProfileEditPasswordScreen` (top + bottom informational HTML)
   - `ProfileUpdateScreen` (top + bottom informational HTML)
8. AR and SUE flow
   - `ARInfoScreen` (AR info HTML)
   - `ArtworkDetailScreen` (artwork description HTML)
   - `SueDetailScreen` (description + service notice HTML)
9. Other informational screens
   - `EncounterHomeScreen` (additional info HTML)
   - `ConsulRegisteredScreen` (registration success HTML)

Implementation notes:

- All HTML-based integrations use the reusable `ReadAloudContent` component to avoid code duplication.
- Each placement uses a stable `contentId` so playback/highlight state is isolated per content block.
- Controls are rendered close to the corresponding content area so users can start/stop playback in context.

## Rollout Checklist

1. Add `settings.accessibility` to your `globalSettings` payload.
2. Enable only the features you want to release.
3. Set defaults according to your accessibility policy.
4. Verify:
   - Settings entry visibility,
   - header icon visibility,
   - persistence after app restart,
   - expected behavior on iOS and Android.

## Troubleshooting

- Accessibility entry does not appear in Settings:
  - Check `enabledFeatures.settingsEntry` is not `false`.
- Header icon does not appear:
  - Check `enabledFeatures.headerEntry` is not `false`.
- User settings are not persisted:
  - Verify local storage availability and inspect `accessibilityUserSettings`.
- Feature toggle visible but no effect:
  - Confirm the related feature key in `enabledFeatures` is `true`.
  - Confirm target components consume accessibility context values.
