# HomeScreen Section Configuration Integration Guide

## Overview

This document explains the integration and configuration of the HomeScreen sections in the Smart Village App. It summarizes the latest changes in `src/screens/HomeScreen.js` and provides step-by-step instructions for integrating and customizing HomeScreen sections.

## Summary of Changes

- HomeScreen now supports dynamic configuration of sections via `homeScreenConfig` from global settings.
- Each section (News, Points of Interest, Events) can be customized or extended using configuration objects.
- Default and custom section logic is unified, supporting flexible layouts and data sources.
- Category-based news sections and volunteer event toggles are supported.

## Integration Steps

1. **Configuration Source**: Ensure `globalSettings` provides `homeScreenConfig` and `sections` objects. These are typically loaded from remote or local settings.
2. **Section Structure**: Each section in `homeScreenConfig` should define at minimum:
   - `query`: One of `QUERY_TYPES.NEWS_ITEMS`, `QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS`, or `QUERY_TYPES.EVENT_RECORDS`.
   - `show`: Boolean to toggle visibility.
   - `limit`, `buttonTitle`, `title`, and `queryVariables` as needed.
   - For news: `categoriesNews` array for category-based sections.
3. **Default Fallback**: If `homeScreenConfig` is empty, HomeScreen falls back to default sections using `sections` config.
4. **Widget Integration**: `widgets` and `widgetStyle` are injected from `appDesignSystem` and rendered above the section list.
5. **Refresh Logic**: Pull-to-refresh and event-based refresh are handled via `DeviceEventEmitter` and the `HOME_REFRESH_EVENT` constant.
6. **Navigation**: Section navigation is handled via the `NAVIGATION` object, supporting both index and detail navigation for each section type.

## Example Configuration

```js
  "homeScreenConfig": [
    {
      "limit": 5,
      "query": "newsItems",
      "show": true,
      "categoriesNews": [
        {
          "categoryId": 1,
          "categoryTitle": "Nachrichten",
          "categoryTitleDetail": "Nachricht",
          "categoryButton": "Alle Nachrichten anzeigen",
          "indexCategoryIds": [
            1,
            78
          ]
        },
        {
          "categoryId": 2,
          "categoryTitle": "Meldungen",
          "categoryTitleDetail": "Meldung",
          "categoryButton": "Alle Meldungen anzeigen",
          "rootRouteName": "Meldungen"
        }
      ]
    }
  ],

```

## Testing & Validation

- Test with both default and custom `homeScreenConfig` values.
- Validate navigation for each section and category.
- Check pull-to-refresh and event-based refresh.
- Ensure widgets and footers render as expected.

## Notes & Warnings

- All user-facing text should be sourced from `src/config/texts.js` for localization.
- Do not remove or bypass the default fallback logic unless all deployments provide a valid `homeScreenConfig`.
- When adding new section types, extend the switch-case in HomeScreen accordingly.

## References

- See `src/screens/HomeScreen.js` for implementation details.
- See `src/config/texts.js` for UI copy and localization.
- See `src/components/HomeSection.js` for section rendering logic.
