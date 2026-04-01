# HomeScreen Section Configuration Integration Guide

## Overview

This document explains the integration and configuration of the HomeScreen in the Smart Village App. It summarizes the latest changes in `src/screens/HomeScreen.js` and provides step-by-step instructions for integrating and customizing the entire HomeScreen – including static UI components like the carousel, widgets, live ticker, and footer, as well as data-driven sections (news, events, points of interest).

## Summary of Changes

- HomeScreen now supports dynamic, full-screen configuration via `homeScreenConfig` from global settings.
- Every visible element on the HomeScreen – including LiveTicker, ConnectedImagesCarousel, Widgets, Disturber, HomeService, HomeButtons, and About – can be controlled through `homeScreenConfig`.
- Each entry in `homeScreenConfig` uses either a `type` field (for static UI components) or a `query` field (for data-driven sections).
- Default and custom section logic is unified. If `homeScreenConfig` is not provided, a default configuration is applied automatically.
- Category-based news sections and volunteer event toggles are supported.

## Integration Steps

1. **Configuration Source**: Ensure `globalSettings` provides `homeScreenConfig` and `sections` objects. These are typically loaded from remote or local settings.
2. **Entry Types**: Each `homeScreenConfig` entry must define either:
   - `type`: One of `liveTicker`, `carousel`, `widgets`, `disturber`, `homeService`, `homeButtons`, `about` (for static UI components).
   - `query`: One of `newsItems`, `pointsOfInterestAndTours`, or `eventRecords` (for data-driven sections).
3. **Visibility**: Use `show: true/false` on every entry to toggle visibility. Omitting `show` defaults to `true` for `type`-based entries.
4. **Order**: The order of entries in `homeScreenConfig` determines the render order on screen.
5. **Drawer-only components**: `homeService` and `about` are only rendered when the screen is opened as a drawer (`isDrawer`). The `show` flag alone is not sufficient; the drawer context must match.
6. **Default Fallback**: If `homeScreenConfig` is empty or not provided, HomeScreen uses a built-in default that mirrors the previous hardcoded layout.
7. **Refresh Logic**: Pull-to-refresh and event-based refresh are handled via `DeviceEventEmitter` and the `HOME_REFRESH_EVENT` constant.

## Component Types Reference

| `type`        | Component                   | Notes                                                              |
| ------------- | --------------------------- | ------------------------------------------------------------------ |
| `liveTicker`  | `<LiveTicker>`              | Defaults to `publicJsonFile: "homeLiveTicker"`                     |
| `carousel`    | `<ConnectedImagesCarousel>` | Defaults to `publicJsonFile: "homeCarousel"`                       |
| `widgets`     | `<Widgets>`                 | Uses `widgetConfigs` and `widgetStyle` from `appDesignSystem`      |
| `disturber`   | `<Disturber>`               | Defaults to `publicJsonFile: "homeDisturber"`                      |
| `homeService` | `<HomeService>`             | Only rendered in drawer context                                    |
| `homeButtons` | `<HomeButtons>`             | Defaults to `publicJsonFile: "homeButtons"`                        |
| `about`       | `<About>`                   | Only rendered in drawer context; always includes `withHomeRefresh` |

All `type`-based entries support an optional `publicJsonFile` field to override the default JSON file name.

## Example Configuration

The following example shows a full `homeScreenConfig` that controls the complete HomeScreen layout:

```json
"homeScreenConfig": [
  {
    "type": "liveTicker",
    "show": true
  },
  {
    "type": "carousel",
    "show": true,
    "publicJsonFile": "homeCarousel"
  },
  {
    "type": "widgets",
    "show": true
  },
  {
    "type": "disturber",
    "show": true
  },
  {
    "limitNews": 15,
    "query": "newsItems",
    "queryVariables": {
      "limit": 3
    },
    "show": true,
    "categoriesNews": [
      {
        "categoryId": 1,
        "categoryTitle": "Nachrichten",
        "categoryTitleDetail": "Nachricht",
        "categoryButton": "Alle Nachrichten anzeigen",
        "indexCategoryIds": [1, 78]
      },
      {
        "categoryId": 2,
        "categoryTitle": "Meldungen",
        "categoryTitleDetail": "Meldung",
        "categoryButton": "Alle Meldungen anzeigen",
        "rootRouteName": "Meldungen"
      }
    ]
  },
  {
    "limitPointsOfInterestAndTours": 15,
    "query": "pointsOfInterestAndTours",
    "queryVariables": {
      "limit": 10,
      "orderPoi": "RAND",
      "orderTour": "RAND",
      "onlyWithImage": true
    },
    "show": true,
    "title": "Sehenswürdigkeiten & Touren",
    "buttonTitle": "Alle Sehenswürdigkeiten & Touren anzeigen"
  },
  {
    "limitEvents": 15,
    "query": "eventRecords",
    "queryVariables": {
      "limit": 3
    },
    "show": true,
    "title": "Veranstaltungen",
    "buttonTitle": "Alle Veranstaltungen anzeigen"
  },
  {
    "type": "homeService",
    "show": true
  },
  {
    "type": "homeButtons",
    "show": true
  },
  {
    "type": "about",
    "show": true
  }
]
```

### Default Fallbacks for Query Sections

For data-driven sections (`query`-based entries), the following fields are **optional**. When omitted, they fall back to the defaults defined in the `sections` object of `globalSettings` (or the built-in defaults from `src/config/texts.js`):

| Query                      | Optional field                  | Falls back to                                            |
| -------------------------- | ------------------------------- | -------------------------------------------------------- |
| `newsItems`                | `categoriesNews`                | `sections.categoriesNews` (default news categories)      |
| `newsItems`                | `limitNews`                     | `sections.limitNews` (default: `15`)                     |
| `pointsOfInterestAndTours` | `title`                         | `sections.headlinePointsOfInterestAndTours`              |
| `pointsOfInterestAndTours` | `buttonTitle`                   | `sections.buttonPointsOfInterestAndTours`                |
| `pointsOfInterestAndTours` | `limitPointsOfInterestAndTours` | `sections.limitPointsOfInterestAndTours` (default: `15`) |
| `eventRecords`             | `title`                         | `sections.headlineEvents`                                |
| `eventRecords`             | `buttonTitle`                   | `sections.buttonEvents`                                  |
| `eventRecords`             | `limitEvents`                   | `sections.limitEvents` (default: `15`)                   |

### Backward Compatibility

Existing configurations that only contain `query`-based entries (without any `type` entries) continue to work. However, header components (LiveTicker, Carousel, Widgets, Disturber) and footer components (HomeService, HomeButtons, About) **will not be rendered** unless explicitly added as `type` entries. To retain the full layout, add the desired `type` entries to the config.

## Testing & Validation

- Test with both default (no `homeScreenConfig`) and custom configurations.
- Validate that `show: false` hides the component completely.
- Test drawer vs. non-drawer context for `homeService` and `about` entries.
- Validate navigation for each data section and category.
- Check pull-to-refresh and event-based refresh.
- Verify that component order in the config matches the visual render order.

## Notes & Warnings

- All user-facing text should be sourced from `src/config/texts.js` for localization.
- Do not remove or bypass the default fallback logic unless all deployments provide a valid `homeScreenConfig`.
- When adding new section types, extend the `switch` statement in `renderItem` inside `HomeScreen.js` accordingly.

## References

- See `src/screens/HomeScreen.js` for implementation details.
- See `src/config/texts.js` for UI copy and localization.
- See `src/components/HomeSection.tsx` for data section rendering logic.
