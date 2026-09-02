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

If no accessibility configuration is provided, all app-level accessibility features are disabled
until they are enabled explicitly in `globalSettings.settings.accessibility.enabledFeatures`.

Read Aloud no longer has a user-facing on/off preference. Operators enable it globally with
`enabledFeatures.readAloud: true`; the player then appears automatically on supported screens when
readable content is available.

## Ready-to-use examples

### Built-in bookmark default

No configuration is required for the built-in Heart bookmark icon:

```json
{
  "settings": {}
}
```

This uses `HeartEmpty` / `HeartFilled` for bookmark states. Read Aloud remains disabled until its
global feature gate is enabled.

### Recommended accessibility controls

```json
{
  "settings": {
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
      }
    }
  }
}
```

`defaults.readAloudEnabled` is intentionally omitted. `enabledFeatures.readAloud` is the global
feature gate, and TTS does not expose a user-facing on/off toggle.

### Bookmark icon overrides

The `heart` and `bookmark` presets can be selected with a short string:

```json
{
  "settings": {
    "bookmarkIcon": "bookmark"
  }
}
```

Use the same `iconName` / `activeIconName` contract as custom tab configuration. Each value first
resolves against the app's `Icon` registry and then falls back to a raw Tabler icon name:

```json
{
  "settings": {
    "bookmarkIcon": {
      "iconName": "Pin",
      "activeIconName": "PinFilled"
    }
  }
}
```

The legacy `default` / `selected` aliases are also supported, and raw Tabler names can be used
directly:

```json
{
  "settings": {
    "bookmarkIcon": {
      "default": "star",
      "selected": "bookmark-filled"
    }
  }
}
```

Registry and Tabler names can be mixed in the same configuration. For example, `ArrowDown` resolves
to `Icon.ArrowDown`, while `bookmark` resolves through `Icon.NamedIcon`. Invalid icon names fall back
to the built-in Heart icons.

## Global Configuration Schema

Use the following JSON shape in `globalSettings`:

```json
{
  "settings": {
    "bookmarkIcon": "heart",
    "accessibility": {
      "enabledFeatures": {
        "settingsEntry": false,
        "headerEntry": false,
        "textScaling": false,
        "boldText": false,
        "isGrayscaleEnabled": false,
        "highContrast": false,
        "reduceMotion": false,
        "reduceTransparency": false,
        "switchLabels": false,
        "readAloud": false,
        "theming": false
      },
      "defaults": {
        "textScaleLevel": 2,
        "boldTextEnabled": false,
        "isGrayscaleEnabled": false,
        "highContrastEnabled": false,
        "reduceMotionEnabled": false,
        "reduceTransparencyEnabled": false,
        "themeMode": "system"
      },
      "themePalettes": {
        "light": {
          "primary": "#107821",
          "onPrimary": "#FFFFFF",
          "background": "#FFFFFF",
          "surface": "#FFFFFF",
          "text": "#141414"
        },
        "dark": {
          "primary": "#8AD996",
          "onPrimary": "#141414",
          "background": "#121212",
          "surface": "#1E1E1E",
          "surfaceElevated": "#2A2A2A",
          "text": "#F5F5F5"
        }
      }
    }
  }
}
```

## Configuration Keys

### `enabledFeatures`

Controls which accessibility capabilities are available in the UI and behavior layer.
Any omitted key in `enabledFeatures` defaults to `false`.

- `settingsEntry`
  - `true`: show Accessibility section in the Settings screen.
  - `false`: hide Accessibility section from Settings.
  - If omitted, defaults to `false`.
- `headerEntry`
  - `true`: show accessibility icon in screen headers.
  - `false`: hide header accessibility icon and modal entry.
  - If omitted, defaults to `false`.
- `textScaling`
  - Enables/disables text size controls (`A-`, slider, `A+`) in Settings and Header modal.
- `boldText`
  - Enables/disables an in-app bold text toggle.
- `isGrayscaleEnabled`
  - Enables/disables the in-app grayscale preference and filter behavior.
- `highContrast`
  - Enables/disables the in-app higher-contrast preference.
- `reduceMotion`
  - Enables/disables in-app reduced-motion preference.
- `reduceTransparency`
  - Enables/disables in-app reduced-transparency preference.
- `switchLabels`
  - Enables an app-level On/Off Labels preference and app-controlled switch rendering on iOS and Android.
  - On iOS, the app follows the current system **On/Off Labels** setting until an app override is stored.
  - Android has no matching public system preference, so it uses the app preference or configured default.
  - A new native build is required only on iOS because the system value is provided by a local Expo module.
- `readAloud`
  - Global feature gate for detail and HTML-page TTS behavior.
  - `true`: show the player automatically when supported readable content is available.
  - If disabled or omitted, the player is not rendered.
  - This does not add an on/off toggle to the accessibility settings UI.
- `theming`
  - Enables/disables the Light, Dark, and System theme selector in both accessibility entry points.
  - When disabled or omitted, the app uses the built-in light palette and ignores stored theme selections and configured palette overrides.

### `defaults`

Defines default user preference values applied when a user has no stored accessibility preferences yet.

- `textScaleLevel` (0..6, where `2` is default/normal size)
- `boldTextEnabled`
- `isGrayscaleEnabled`
- `highContrastEnabled`
- `reduceMotionEnabled`
- `reduceTransparencyEnabled`
- `switchLabels` or `switchLabelsEnabled` (optional boolean; `switchLabelsEnabled` wins when both are present)
  - If omitted, follows the iOS system **On/Off Labels** value and defaults to `false` on Android.
  - Once changed in the app, the explicit app value overrides the platform fallback.
- `themeMode` (`"light"`, `"dark"`, or `"system"`; defaults to `"system"`)

`readAloudEnabled` is retained only as a legacy stored preference field. It no longer controls TTS
availability and should not be added to new `globalSettings` payloads.

### `themePalettes`

Defines optional, partial palette overrides for `light` and `dark`. Each mode is merged with its built-in palette, so operators only need to provide tokens that differ from the defaults.

The preferred semantic tokens are:

- Surfaces: `background`, `surface`, `surfaceElevated`
- Content: `text`, `textMuted`, `onPrimary`
- Brand and actions: `primary`, `lighterPrimary`, `lighterPrimaryRgba`, `darkerPrimary`, `darkerPrimaryRgba`, `secondary`, `accent`, `blue`
- State and structure: `error`, `errorRgba`, `border`, `borderRgba`, `placeholder`, `shadow`, `shadowRgba`, `overlayRgba`, `backgroundRgba`
- Calendar: `calendarBackground`, `calendarTodayText`, `calendarSelectedDayText`, `calendarSelected`
- Utility: `gray20`, `gray40`, `gray60`, `refreshControl`, `transparent`

`darkText` and `lightestText` remain available as compatibility aliases. Prefer `text` and `onPrimary` in new configuration and application code. Overriding `text` automatically synchronizes `darkText`; overriding `onPrimary` automatically synchronizes `lightestText`.

Palette rules:

- Accepted values are CSS-style hex (`#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`), `rgb(...)`, `rgba(...)`, and `transparent`.
- Unknown tokens, malformed colors, and values of the wrong type are ignored.
- Critical text pairs must meet a WCAG contrast ratio of at least `4.5:1`: `text/background`, `text/surface`, `textMuted/background`, `textMuted/surface`, `onPrimary/primary`, and `error/background`.
- If a critical pair is invalid, translucent, or below the threshold, both tokens in that pair fall back to the built-in palette for that mode. Use opaque values for critical foreground/background tokens.
- Palette changes received through `globalSettings` are resolved at runtime; no app rebuild is required.

### Complete remote palette example

The following payload enables theming and supplies every preferred configurable token. It can be
sent as part of `globalSettings`; omitted palette tokens continue to use the built-in value for the
corresponding mode.

```json
{
  "settings": {
    "accessibility": {
      "enabledFeatures": {
        "settingsEntry": true,
        "headerEntry": true,
        "theming": true
      },
      "defaults": {
        "themeMode": "system"
      },
      "themePalettes": {
        "light": {
          "primary": "#107821",
          "lighterPrimary": "#5EC66F",
          "lighterPrimaryRgba": "rgba(15, 70, 24, 0.10)",
          "darkerPrimary": "#0F4618",
          "darkerPrimaryRgba": "rgba(15, 70, 24, 0.60)",
          "secondary": "#09483C",
          "accent": "#0F4618",
          "blue": "#5C7ADB",
          "background": "#FFFFFF",
          "backgroundRgba": "rgba(162, 162, 162, 0.08)",
          "surface": "#FFFFFF",
          "surfaceElevated": "#FFFFFF",
          "text": "#141414",
          "textMuted": "#595959",
          "onPrimary": "#FFFFFF",
          "border": "#DBDBE6",
          "borderRgba": "rgba(162, 162, 162, 0.75)",
          "placeholder": "#A2A2A2",
          "shadow": "#BCBBC1",
          "shadowRgba": "rgba(188, 187, 193, 0.40)",
          "overlayRgba": "rgba(20, 20, 20, 0.70)",
          "error": "#AE001D",
          "errorRgba": "rgba(174, 0, 29, 0.10)",
          "calendarBackground": "#FFFFFF",
          "calendarTodayText": "#107821",
          "calendarSelected": "#5EC66F",
          "calendarSelectedDayText": "#141414",
          "gray20": "#EAEAEA",
          "gray40": "#DBDBE6",
          "gray60": "#BCBBC1",
          "refreshControl": "#0F4618",
          "transparent": "transparent"
        },
        "dark": {
          "primary": "#5EC66F",
          "lighterPrimary": "#8AD996",
          "lighterPrimaryRgba": "rgba(94, 198, 111, 0.18)",
          "darkerPrimary": "#8AD996",
          "darkerPrimaryRgba": "rgba(138, 217, 150, 0.65)",
          "secondary": "#73D6C2",
          "accent": "#8AD996",
          "blue": "#91A7FF",
          "background": "#121212",
          "backgroundRgba": "rgba(255, 255, 255, 0.08)",
          "surface": "#1E1E1E",
          "surfaceElevated": "#2A2A2A",
          "text": "#F5F5F5",
          "textMuted": "#C7C7CC",
          "onPrimary": "#141414",
          "border": "#54545A",
          "borderRgba": "rgba(199, 199, 204, 0.75)",
          "placeholder": "#AFAFB5",
          "shadow": "#000000",
          "shadowRgba": "rgba(0, 0, 0, 0.55)",
          "overlayRgba": "rgba(0, 0, 0, 0.78)",
          "error": "#FF8A9D",
          "errorRgba": "rgba(255, 138, 157, 0.18)",
          "calendarBackground": "#1E1E1E",
          "calendarTodayText": "#8AD996",
          "calendarSelected": "#8AD996",
          "calendarSelectedDayText": "#141414",
          "gray20": "#2A2A2A",
          "gray40": "#54545A",
          "gray60": "#85858D",
          "refreshControl": "#8AD996",
          "transparent": "transparent"
        }
      }
    }
  }
}
```

Tab bar colors are not read from `globalSettings`. Configure their light/dark variants in the
`tabNavigation` static content as described in [Themed `tabNavigation` static content](#themed-tabnavigation-static-content).

## Precedence and Persistence

### Runtime precedence

For bold text, motion, transparency, and text-scaling-related behavior, effective runtime values are resolved from:

1. system accessibility state (OS),
2. app-level user preference,
3. feature availability (`enabledFeatures`).

This means OS accessibility still works even if the app-level preference is off.

Theme resolution follows this order:

1. `enabledFeatures.theming` decides whether theming is active.
2. A persisted user selection overrides `defaults.themeMode`.
3. `system` resolves through the current iOS/Android color scheme and updates while the app is running.
4. The matching built-in palette is merged with `themePalettes.light` or `themePalettes.dark`.
5. Invalid or insufficient-contrast overrides fall back to built-in tokens.

When theming is disabled, the resolved mode is always `light`, regardless of the OS scheme or stored preference.

Switch-label resolution follows this order:

1. `enabledFeatures.switchLabels` must be `true` to expose and apply the app preference.
2. An explicit app preference (`switchLabelsEnabled`) wins when the user has changed the control.
3. `defaults.switchLabels` or `defaults.switchLabelsEnabled` can opt in or out before the user creates an override.
4. On iOS, without an app override or configured default, the current system **On/Off Labels** setting is used.
5. On Android, which has no matching public system setting, the value resolves to `false` when no app override or configured default exists.
6. If the feature is disabled, each platform continues to use its standard native switch rendering.

### Local persistence

User selections are stored in local storage under:

- `accessibilityUserSettings`

Behavior:

- If stored settings exist, they are reused.
- If no stored settings exist, `defaults` from `globalSettings` are applied.
- Changes in the Settings screen and header modal update the same stored state.
- When theming is disabled, stored theme values are not applied; preference hydration normalizes them to the configured default while the runtime remains light.

## User-Facing Behavior

### Settings screen

- Accessibility appears as a dedicated Settings entry when `enabledFeatures.settingsEntry === true`.
- The screen exposes controls only for features enabled by `enabledFeatures`; Read Aloud is not an
  on/off control.
- A reset action restores values to global defaults (`defaults`).

### Header modal

- Header accessibility icon is shown when `enabledFeatures.headerEntry === true`.
- Tapping the icon opens a modal with the same toggle set as the Settings screen.
- Changes made in the modal are applied immediately and persisted.

## Feature Behavior Summary

- **Text Size (A- / Slider / A+)**
  - Controls app typography scale level and persists user preference.
  - Applied to app text components and HTML rendering (`Text`, `HtmlView`).
- **Bold Text**
  - Applies app-level bold text rendering.
  - System-level bold text (OS accessibility) continues to take precedence when active.
- **High Contrast**
  - Replaces low-contrast text colors in app text rendering with stronger contrast where applicable.
- **Grayscale**
  - Uses one shared app-root compositor controlled by the accessibility preference.
  - Android uses React Native's native descendant grayscale filter. React Native 0.86 does not
    support that filter on iOS, so iOS uses a local native Core Animation saturation compositor
    over the application window instead.
  - The root compositor covers React Native views, images, HTML/WebView content, maps, animated
    ticker content, tab navigation and remote runtime colors without component-specific grayscale
    logic.
  - Applies a luminance-preserving theme palette and converts the remote app design system only as
    centralized fallbacks for native portal surfaces that can render outside the root view tree.
  - The accessibility settings overlay uses the same shared root-filter component so its live
    preview remains synchronized while the grayscale preference is toggled.
- **Reduce Motion**
  - Exposes reduced-motion state in accessibility context.
  - Stack navigation transitions are disabled in reduced-motion mode.
  - Image/media carousel autoplay and pause controls are disabled in reduced-motion mode.
  - Onboarding terms modal switches to `animationType="none"` in reduced-motion mode.
- **Reduce Transparency**
  - Exposes reduced-transparency state for app-level transparency handling.
  - Already consumed in several UI components (`Input`, `Switch`, `Results`, `VersionNumber`, etc.).
- **On/Off Labels (iOS and Android)**
  - Adds a vertical line for the on state and a circle for the off state inside switches.
  - On iOS, follows the system setting until the user chooses an explicit app value.
  - On Android, uses only the app preference or configured default because no matching public system setting exists.
  - Refreshes the iOS system value when the app returns from the background.
  - Can be enabled or disabled independently inside the Settings screen or header accessibility modal.
  - Always shows a line/circle preview inside this preference's own switch, including while the preference is off.
  - Preserves switch role, checked/disabled state, reduced-motion behavior, and non-color state cues.
- **Read Aloud (Feature Gate)**
  - Is enabled globally with `enabledFeatures.readAloud: true`.
  - Has no user-facing on/off preference in Settings or the header modal.
  - Displays playback controls in a floating media player when readable content is available.
  - Provides start/pause, resume, stop, expand, and collapse controls in the floating media player.
  - Shows the currently read text in the compact player.
  - Shows speech speed selection (`0.8x`, `1.0x`, `1.2x`) and a scrollable read-along text area in the expanded player.
  - Automatically scrolls the expanded read-along text while speech playback advances.
  - Adds bottom spacing to supported screens while the floating player is visible so page content is not covered by the player.
  - Read-along panel availability is independent from High Contrast.
  - When **High Contrast** is enabled, the currently spoken word is highlighted in the expanded read-aloud player (dark background / light text).
  - Reads detail content block-by-block in display order.
  - Uses `expo-speech` and automatically chunks long strings according to `Speech.maxSpeechInputLength`.
  - Stops playback when app goes to background or when leaving the screen.
- **Theme (Light / Dark / System)**
  - Is shown when `enabledFeatures.theming` is enabled.
  - Uses one radio-group selector in both the Settings screen and header accessibility modal.
  - Applies immediately to navigation, headers, drawers, tabs, modals, forms, lists, cards, maps, HTML content, media surfaces, loaders, icons, and other shared primitives.
  - Persists the user selection under `accessibilityUserSettings.themeMode`.
  - Uses the current OS appearance in `system` mode.
  - Supports independently configurable light and dark palettes through `themePalettes`.

## Integrating Theme Support in App Code

All new or changed UI must resolve colors at render time. Do not import the backwards-compatible static `colors` object for component styling; it represents only the built-in light palette.

### Functional components and style sheets

Use `useThemeStyles` for style objects and `useTheme` for runtime props such as icon colors:

```tsx
import { useTheme, useThemeStyles } from '../hooks';

const ExampleCard = () => {
  const { colors, mode } = useTheme();
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.card}>
      <Icon.Info color={colors.primary} />
      <RegularText>{mode === 'dark' ? 'Dark' : 'Light'}</RegularText>
    </View>
  );
};

const createStyles = (colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border
  }
});
```

Use semantic tokens according to purpose: `background` for screen backgrounds, `surface`/`surfaceElevated` for cards and overlays, `text`/`textMuted` for content, `onPrimary` for content placed on `primary`, and `error` for destructive/error states.

### Styled components

The app provides the active palette through `styled-components`:

```tsx
const Card = styled.View`
  background-color: ${({ theme }) => theme.surface};
  border-color: ${({ theme }) => theme.border};
`;
```

### Class components

Set `static contextType = ThemeContext`, then build styles from `this.context.colors` during render. Do not create a module-level `StyleSheet` from the static light palette.

### Special renderers

- HTML/WebView CSS must be regenerated when `colors` changes and use `text`, `surface`, `surfaceElevated`, `border`, and `primary`.
- Map layers and calendar theme objects must be created from the current palette rather than module-level constants.
- Default icons and `IconUrl` already use the active `primary` token; pass an explicit semantic token when a different meaning is required.
- Pull-to-refresh controls created by `usePullToRefetch` already use `refreshControl` from the active palette.
- Status must never be communicated by color alone; retain a text or icon label in both themes.

### Themed `tabNavigation` static content

The four root-level tab bar color fields remain supported as legacy light-mode configuration. Dark mode uses the semantic app palette unless `themeColors.dark` is provided. This prevents an existing light-only `tabNavigation` payload from forcing a light tab bar in dark mode.

```json
{
  "activeTintColor": "#005A8D",
  "inactiveTintColor": "#666666",
  "activeBackgroundColor": "#FFFFFF",
  "inactiveBackgroundColor": "#FFFFFF",
  "tabBarIconFillOnFocus": true,
  "themeColors": {
    "light": {
      "activeTintColor": "#005A8D"
    },
    "dark": {
      "activeTintColor": "#8AD996",
      "inactiveTintColor": "#F5F5F5",
      "activeBackgroundColor": "#1E1E1E",
      "inactiveBackgroundColor": "#1E1E1E"
    }
  },
  "tabConfigs": ["Home", "Service", "Index", "Events", "About"]
}
```

Mode-specific values are partial. Any omitted value falls back to the active semantic palette. `themeColors.light` takes precedence over the legacy root-level light value when both are present.

Set `tabBarIconFillOnFocus` to `true` when inactive SVG tab icons should render as an
outline and focused icons should use the active tint as their fill. This root value applies
to every tab. A custom tab object can override it with its own
`tabBarIconFillOnFocus: true` or `tabBarIconFillOnFocus: false` value, so mixed icon sets do
not require app-specific navigation code.

Custom tab objects can use `iconName` / `activeIconName`, `svg` / `activeSvg`, or
`icon` / `activeIcon`. Named and SVG icons follow the resolved theme tint; tab SVGs are treated as
monochrome so their solid fill and stroke colors can adapt to light and dark mode. Raster images
keep their original colors. A custom tab can therefore define `themeImages.light` and
`themeImages.dark`, each with optional `icon` and `activeIcon` values. If a mode-specific `icon` is
present without an `activeIcon`, the same image is used for both focus states in that mode. The icon
visual is hidden from screen readers because the parent tab button already exposes its label, tab
role, position, and selected state. See [Tab Navigation Icons](./TAB_NAVIGATION_ICONS.md) for source
priority and configuration examples.

## Read Aloud Coverage (Screen-by-Screen)

When `enabledFeatures.readAloud` is `true`, TTS controls are available on the following screens when
readable content is present:

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
4. Configure and contrast-check both palettes when applying tenant branding.
5. Verify:
   - Settings entry visibility,
   - header icon visibility,
   - Light, Dark, and System selection in both entry points,
   - live OS appearance changes while System is selected,
   - navigation, modal, HTML, map, form, list, media, loading, and error surfaces in both modes,
   - persistence after app restart,
   - iOS On/Off Labels system inheritance and app override in both directions,
   - expected behavior on iOS and Android.

## Troubleshooting

- Accessibility entry does not appear in Settings:
  - Check `enabledFeatures.settingsEntry` is explicitly set to `true`.
- Header icon does not appear:
  - Check `enabledFeatures.headerEntry` is explicitly set to `true`.
- User settings are not persisted:
  - Verify local storage availability and inspect `accessibilityUserSettings`.
- Feature toggle visible but no effect:
  - Confirm the related feature key in `enabledFeatures` is `true`.
  - Confirm target components consume accessibility context values.
- Theme selector does not appear:
  - Check `enabledFeatures.theming` is explicitly set to `true`.
- Custom palette value is not applied:
  - Check the token name and color syntax.
  - Check the critical contrast pairs; unsafe overrides deliberately fall back to built-in values.
- A screen remains light after switching themes:
  - Replace module-level `colors` usage with `useTheme`, `useThemeStyles`, `ThemeContext`, or the styled-components theme as appropriate.
