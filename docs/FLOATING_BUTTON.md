# Floating Button (SVASD-537)

A server-configurable floating action button that appears at a fixed position in the bottom-right corner of the screen.

## Overview

`FloatingButton` is a FAB (Floating Action Button) component that can be displayed on any screen and navigates the user to a configured target screen. Button content (icon, target screen, visibility rules) is fetched from the server via a `publicJsonFile` GraphQL query. This allows buttons to be managed dynamically without releasing a new app version.

## Architecture

### New Files

| File                                | Description                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/components/FloatingButton.tsx` | Main component — data fetching, filtering, and rendering                                                       |
| `src/navigation/navigationRef.ts`   | Global `NavigationContainerRef` — provides access to the active route name from anywhere in the component tree |

### Modified Files

| File                                  | Change                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/navigation/Navigator.tsx`        | Added `ref={navigationRef}` to `NavigationContainer`; integrated `FloatingButton` rendering    |
| `src/components/SafeAreaViewFlex.tsx` | `edges` prop made conditional based on navigation type (`tab` → `[]`, `drawer` → `['bottom']`) |
| `src/components/index.js`             | Added `FloatingButton` export                                                                  |

## Data Flow

```
Server (CMS)
    │
    ▼
publicJsonFile GraphQL query  (name: "floatingButton", type: "json")
    │
    ▼
useStaticContent hook  →  TButton[]
    │
    ▼
FloatingButton component
    ├── Filter by active screen (visibleScreens)
    └── Render → TouchableOpacity + Icon/Image
```

### Server-Side JSON Structure

A `publicJsonFile` record named `floatingButton` must be created on the server. Its content must be a JSON array:

```json
[
  {
    "accessibilityLabel": "Create Event",
    "routeName": "EventCreate",
    "params": {},
    "iconName": "calendar-plus",
    "visibleScreens": ["Index"]
  },
  {
    "accessibilityLabel": "Open Chatbot",
    "icon": "url",
    "iconName": "",
    "visibleScreens": ["Home"],
    "routeName": "Web",
    "params": {
      "webUrl": "url",
      "title": "Chatbot"
    }
  }
]
```

#### Field Descriptions

| Field                | Type         | Required | Description                                                                                    |
| -------------------- | ------------ | -------- | ---------------------------------------------------------------------------------------------- |
| `accessibilityLabel` | `string`     | Yes      | Accessibility label used by screen readers and as the button identifier                        |
| `routeName`          | `ScreenName` | Yes      | Target screen name (one of the `ScreenName` enum values in `src/types/Navigation.ts`)          |
| `params`             | `object`     | No       | Navigation parameters to pass to the target screen                                             |
| `iconName`           | `string`     | No       | Icon name from the `tabler-icons` set (e.g. `calendar-plus`)                                   |
| `icon`               | `string`     | No       | Remote icon URL (used instead of `iconName`)                                                   |
| `visibleScreens`     | `string[]`   | No       | Screens on which the button is visible. If omitted or empty, the button appears on all screens |

> **Note:** If both `icon` and `iconName` are provided, `icon` (URL) takes priority.

## Integration Steps

### 1. Server Configuration

Create a **publicJsonFile** record in the CMS (Main Server):

- **name:** `floatingButton`
- **content:** A JSON array matching the structure above

### 2. App Side (Already Done)

The changes on this branch add the following integrations to the app:

1. **`navigationRef`** — Created via `createNavigationContainerRef()` and attached to the `NavigationContainer`. This allows accessing the active route via `navigationRef.getCurrentRoute()` from anywhere outside the component tree.

2. **`FloatingButton` in `Navigator`** — Rendered in `src/navigation/Navigator.tsx` as a sibling of the active navigator (`DrawerNavigator` or `MainTabNavigator`) inside the `NavigationContainer`.

3. **Tab-bar clearance in `Navigator`** — For tab navigation, `Navigator` computes `bottomOffset` using tab bar height + safe-area bottom inset and passes it to `FloatingButton`, so the FAB stays above the tab bar.

4. **`SafeAreaViewFlex` behavior** — In tab navigation, `edges` is set to an empty array (`[]`); in drawer navigation, `edges` remains `['bottom']`. This keeps screen safe-area behavior aligned with the selected navigation type.

### 3. Visibility Control

The FloatingButton component subscribes to navigation state changes via the `useNavigationState` hook, causing a re-render on every screen transition. The active screen name is obtained through `navigationRef.getCurrentRoute()` and compared against the `visibleScreens` array from the server data.

- `visibleScreens` **is defined**: Button appears only on the listed screens
- `visibleScreens` **is empty or undefined**: Button appears on all screens

### 4. Navigation Type Support

The component supports both `drawer` and `tab` navigation types:

- **Tab:** Button uses `bottom: normalize(16) + bottomOffset`, where `bottomOffset` is computed in `Navigator` from tab bar height + bottom safe area
- **Drawer:** Button uses `bottom: '5%'`

## Styling and Appearance

- Button size: `normalize(56)` × `normalize(56)` (circular)
- Background color: `colors.primary`
- Shadow: `shadowColor/shadowOffset/shadowOpacity/shadowRadius` on iOS, `elevation: 6` on Android
- Multiple buttons are spaced vertically with `normalize(8)` gap

## Testing

### Manual Testing

1. Create a `floatingButton` publicJsonFile record on the server
2. Start the app: `yarn start`
3. Verify the button appears in the bottom-right corner on the home screen
4. Tap the button and confirm navigation to the target screen
5. Test that buttons restricted via `visibleScreens` only appear on the specified screens

### Unit Test Suggestions

- `FloatingButton` render test: `loading` and `data` states
- `visibleScreens` filtering logic
- Navigation triggering via `navigationRef`
