# Participation Project Module Integration Guide

## Overview

The Participation Project module displays `GenericItem` records whose server-side
`genericType` is `ParticipationProject`.

The module has three user-facing layers:

- `ParticipationProjectHomeScreen`: a remotely configurable landing page.
- `IndexScreen`: the existing generic list screen, opened from a selected category.
- `DetailScreen`: the existing detail route, using a Participation Project specific detail view.

The home screen renders, in order: the optional carousel, the optional intro HTML
content, participation type category rows, optional featured project rows, and the
all-records button.
For this module, server-side categories should represent the participation type
(`Beteiligungsart`), for example `Veranstaltung`, `Umfrage`, `Dialog`,
`Bauleitplan` or `Terminvereinbarung`. Selecting a category opens `IndexScreen`,
which fetches and renders the projects in that category sorted by a payload field
configured through `indexOrder` (default: `itemIndex`).

## Required App Version

This module requires an app build that contains:

- `GenericType.ParticipationProject`
- `ScreenName.ParticipationProjectHome`
- `ParticipationProjectHomeScreen`
- `ParticipationProjectDetail`
- the `ParticipationProjects` root route name

If the app build does not include those changes, adding static content on the server
is not enough.

## Server Data Requirements

Participation Project records must be available through the existing generic item
GraphQL API:

```graphql
genericItems(genericType: "ParticipationProject")
genericItem(id: "...")
```

Recommended fields for a good first test:

```json
{
  "id": "participation-project-1",
  "genericType": "ParticipationProject",
  "title": "Public square redesign",
  "teaser": "Share your feedback on the redesign concept.",
  "description": "<p>The city is collecting feedback for the public square redesign.</p>",
  "publicationDate": "2026-06-01T09:00:00.000Z",
  "createdAt": "2026-06-01T09:00:00.000Z",
  "updatedAt": "2026-06-01T10:00:00.000Z",
  "visible": true,
  "categories": [
    {
      "id": "veranstaltung",
      "name": "Veranstaltung"
    }
  ],
  "dataProvider": {
    "id": "participation-provider",
    "name": "Participation Portal"
  },
  "mediaContents": [],
  "contentBlocks": [],
  "webUrls": [
    {
      "url": "https://example.org/projects/public-square",
      "description": "Open project page"
    }
  ],
  "payload": {
    "capacity": "120",
    "contact": "Participation office",
    "email": "participation@example.org",
    "endTime": "18:00",
    "instance": "Landeshauptstadt Magdeburg",
    "location": "Rathaus Magdeburg",
    "organizer": "City planning department",
    "phone": "+49 391 000000",
    "registrationRequired": false,
    "startTime": "16:00",
    "statistics": "42 submissions",
    "status": "Aktiv",
    "tags": ["Stadtentwicklung", "Dialog"],
    "theme": "Stadtentwicklung und Ländlicher Raum",
    "type": "Veranstaltung"
  }
}
```

Minimum usable fields:

- `id`
- `genericType: "ParticipationProject"`
- `title`
- `publicationDate` or `createdAt`
- `categories` if the item should appear under a real participation type category

The preferred read model is `categories { id name }`. `categoryName` is a mutation
input and is not expected to be returned by the query. The importer should send the
participation type (`payload.type` / source `typ`) as `categoryName`, not the theme.

Recommended importer mapping:

```graphql
createGenericItem(
  genericType: "ParticipationProject"
  categoryName: "{{ $json.typ }}"
  payload: {
    type: "{{ $json.typ }}"
    theme: "{{ $json.thema }}"
    instance: "{{ $json.mandant }}"
    statistics: "{{ $json.statistik }}"
    status: "{{ $json.status }}"
    tags: "{{ $json.tags }}"
  }
  # ...
)
```

In this mapping:

- `categoryName` creates or assigns the server-side category used by the home screen.
- `payload.type` keeps the participation type available in the detail/list payload.
- `payload.theme` keeps the source theme as metadata. It is not the home-screen category.
- Optional structured fields such as `payload.status`, `payload.tags`, `payload.organizer`,
  `payload.contact`, `payload.email`, `payload.phone`, `payload.capacity`,
  `payload.registrationRequired`, `payload.startTime` and `payload.endTime` improve the
  detail overview but are not required for the module to render.

If `categories` is empty, the app can fall back to one of these payload fields for
home-screen grouping:

- `payload.theme`
- `payload.categoryName`
- `payload.category`

If none of these fields exists, the item is grouped under the configured fallback
category.

## Static Content: Home Configuration

Create a JSON static content entry named:

```text
participationProjectHome
```

All fields are optional. The app merges this JSON with built-in defaults.

Default values:

```json
{
  "allButtonTitle": "Alle Beteiligungen ansehen",
  "carouselPublicJsonFile": "participationProjectHomeCarousel",
  "categoryOrder": [],
  "categoryTitle": "Kategorien",
  "fallbackCategoryTitle": "Beteiligungsprojekte",
  "featuredLimit": 3,
  "featuredTitle": "Besonders interessant",
  "hiddenCategoryIds": [],
  "homeLimit": 100,
  "indexLimit": 15,
  "indexOrder": "itemIndex",
  "introHtmlName": "participationProjectHomeText",
  "isCarouselImageFullWidth": true,
  "showAllButton": true,
  "showCarousel": true,
  "showEmptyCategories": false,
  "showFeatured": true,
  "showIntro": true,
  "title": "Beteiligung"
}
```

Example configuration for testing:

```json
{
  "showCarousel": true,
  "carouselPublicJsonFile": "participationProjectHomeCarousel",
  "isCarouselImageFullWidth": true,
  "showFeatured": true,
  "featuredLimit": 3,
  "featuredTitle": "Besonders interessant",
  "showAllButton": true,
  "allButtonTitle": "Alle Beteiligungen ansehen",
  "categoryTitle": "Beteiligungsarten",
  "fallbackCategoryTitle": "Other projects",
  "homeLimit": 100,
  "indexLimit": 15,
  "indexOrder": "itemIndex",
  "introHtmlName": "participationProjectHomeText",
  "showIntro": true,
  "categoryOrder": [
    {
      "id": "veranstaltung",
      "title": "Veranstaltung"
    },
    {
      "id": "umfrage",
      "title": "Umfrage"
    },
    {
      "id": "dialog",
      "title": "Dialog"
    }
  ],
  "hiddenCategoryIds": [],
  "showEmptyCategories": false
}
```

### Home Configuration Fields

| Field                      | Type      | Description                                                                                                                                     |
| -------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `allButtonTitle`           | `string`  | Text for the row that opens all Participation Project records without a category filter.                                                        |
| `carouselPublicJsonFile`   | `string`  | Static JSON content name used by `ConnectedImagesCarousel`.                                                                                     |
| `categoryTitle`            | `string`  | Section title above the category list.                                                                                                          |
| `fallbackCategoryTitle`    | `string`  | Category title used when an item has no category.                                                                                               |
| `featuredLimit`            | `number`  | Number of records shown in the `Besonders interessant` section.                                                                                 |
| `featuredTitle`            | `string`  | Section title for the featured records.                                                                                                         |
| `homeLimit`                | `number`  | Number of Participation Project records fetched by the home screen for grouping.                                                                |
| `indexLimit`               | `number`  | Number of records requested by the opened `IndexScreen`.                                                                                        |
| `indexOrder`               | `string`  | Payload field key used for client-side sorting in `IndexScreen` and featured rows (forwarded as `participationOrder`); defaults to `itemIndex`. |
| `introHtmlName`            | `string`  | Static HTML content name used for the optional intro block.                                                                                     |
| `isCarouselImageFullWidth` | `boolean` | Enables full-width carousel images.                                                                                                             |
| `showAllButton`            | `boolean` | Enables or disables the all-records navigation row.                                                                                             |
| `showCarousel`             | `boolean` | Enables or disables the static image carousel.                                                                                                  |
| `showFeatured`             | `boolean` | Enables or disables the featured records section.                                                                                               |
| `showIntro`                | `boolean` | Enables or disables the intro HTML block.                                                                                                       |
| `categoryOrder`            | `array`   | Optional category ordering and optional display title overrides.                                                                                |
| `hiddenCategoryIds`        | `array`   | Category ids that should not be shown on the home screen.                                                                                       |
| `showEmptyCategories`      | `boolean` | If `true`, categories from `categoryOrder` are shown even when count is `0`.                                                                    |

`categoryOrder` accepts either plain ids:

```json
["veranstaltung", "umfrage", "dialog"]
```

or objects with display title overrides:

```json
[
  {
    "id": "veranstaltung",
    "title": "Veranstaltung"
  }
]
```

## Static Content: Home Carousel JSON

If `showCarousel` is `true`, create a JSON static content entry whose name matches
`carouselPublicJsonFile`.

Default name:

```text
participationProjectHomeCarousel
```

The JSON uses the existing `ImagesCarousel` item format:

```json
[
  {
    "id": "participation-project-carousel-1",
    "picture": {
      "uri": "https://example.org/images/participation-project.jpg",
      "captionText": "Participation project teaser",
      "routeName": "Index",
      "params": {
        "title": "Beteiligung",
        "query": "genericItems",
        "queryVariables": {
          "genericType": "ParticipationProject",
          "limit": 15,
          "participationOrder": "itemIndex"
        },
        "rootRouteName": "ParticipationProjects"
      }
    }
  }
]
```

If no carousel JSON exists or the array is empty, the carousel renders nothing.

## Static Content: Home Intro HTML

If `showIntro` is `true`, create an HTML static content entry whose name matches
`introHtmlName`.

Default name:

```text
participationProjectHomeText
```

Example HTML:

```html
<h2>Participation projects</h2>
<p>Find current participation projects and open a category to see all projects.</p>
```

The intro block is also registered for read-aloud support.

## Navigation: Drawer

For drawer navigation, add an entry to the `navigation` static content JSON.

Example:

```json
{
  "ParticipationProjects": {
    "screen": "ParticipationProjectHome",
    "title": "Beteiligung",
    "label": "Beteiligung",
    "params": {},
    "query": "",
    "queryVariables": {}
  }
}
```

Important values:

- `screen` must be `ParticipationProjectHome`.
- The object key can be `ParticipationProjects`; it becomes `rootRouteName`.
- `title` is used by the drawer item and screen params.

The drawer implementation forwards all values as route params and automatically
adds `rootRouteName`.

## Navigation: Tab Bar

For tab navigation, add a tab to the `tabNavigation` static content JSON.

Example:

```json
{
  "activeTintColor": "#005A8D",
  "inactiveTintColor": "#666666",
  "activeBackgroundColor": "#FFFFFF",
  "inactiveBackgroundColor": "#FFFFFF",
  "tabConfigs": [
    "Home",
    "Service",
    {
      "accessibilityLabel": "Beteiligung",
      "iconName": "Info",
      "label": "Beteiligung",
      "screen": "ParticipationProjectHome",
      "params": {
        "title": "Beteiligung"
      }
    },
    "About"
  ]
}
```

Important values:

- `screen` must be `ParticipationProjectHome`.
- `label` is the visible tab label.
- `accessibilityLabel` is used for the generated tab accessibility label.
- `iconName` must be a valid key from `src/config/icons/Icon.tsx`.

## Runtime Behavior

### Home Screen

The home screen requests:

```json
{
  "genericType": "ParticipationProject",
  "limit": 100,
  "participationOrder": "itemIndex"
}
```

`participationOrder` is interpreted on the client and mapped to
`payload[participationOrder]` sorting in the list screen.

It then groups the returned items by `categories`. In the current Participation
Project integration, these categories are participation types (`Beteiligungsarten`),
not themes. `categoryName` is only the mutation input used by the server/importer.
The read model must expose categories through `categories { id name }`.

If `categories` is empty, the app falls back to the payload category fields listed
in the data requirements section before using the configured fallback category.
This fallback is useful for importer transitions or old records, but the preferred
data model is still the server-side `categories` array.

Each category row contains:

- category title
- item count
- an accessibility label containing the title, count and button hint

Selecting a category navigates to `IndexScreen`.

### Index Screen

For normal categories, `IndexScreen` receives:

```json
{
  "genericType": "ParticipationProject",
  "categoryId": "veranstaltung",
  "limit": 15,
  "participationOrder": "itemIndex"
}
```

The `categoryId` value comes from `categories[].id`, for example:

```json
{
  "categories": [
    {
      "id": "347",
      "name": "Veranstaltung"
    }
  ]
}
```

For the fallback category, where items do not have a real category, `IndexScreen`
receives an `ids` query:

```json
{
  "genericType": "ParticipationProject",
  "ids": ["participation-project-1", "participation-project-2"],
  "limit": 15,
  "participationOrder": "itemIndex"
}
```

### Detail Screen

Selecting an item in `IndexScreen` opens `DetailScreen`.

The detail screen displays:

- participation type from `payload.type` or the first category as the same uppercase
  overtitle pattern used by Event and POI details
- title with the shared big `SectionHeader` pattern
- image media content, when available
- publication date or created date
- updated date, when different from the displayed publication date
- a shared `InfoCard` overview section for addresses, contacts and web URLs
- theme from `payload.theme`
- status from `payload.status`
- instance, organizer, contact, email, phone, capacity, registration state and statistics
- tags from `payload.tags`
- appointment/date information through the shared `OpeningTimesCard`
- description content through `contentBlocks`; `teaser` and `description` are only fallback
  sources when no content blocks exist
- a `MapLibre` location section when `locations[]` or `addresses[]` contains `geoLocation`
- first web URL as an action button
- an explicit hint below the external portal button
- calendar export when a title and start date exist
- operating company information, when company data or an organizer fallback exists
- data provider notice
- data provider button for business account providers

If no content fields are available, the detail screen shows the module empty text.

The GenericItem detail query must provide these optional relation fields when they
exist on the server, because the detail screen reuses the same shared blocks as Event
and POI details:

- `addresses.geoLocation` and `locations.geoLocation` for the map section
- `contacts` and `webUrls` for the `InfoCard` overview
- `dates.timeStart`, `dates.timeEnd`, `dates.timeDescription` for appointments and calendar export
- `openingHours` as a fallback for the shared appointment card
- `companies` for the operating company section
- `dataProvider.notice` for the provider notice section
- `settings.displayOnlySummary` and `settings.onlySummaryLinkText` for content block rendering

The calendar export uses the existing app calendar helper. It creates an all-day
entry when no start or end time exists. If times are present, the app combines them
with the first date range. The time fallback order is `dates[0].timeStart`,
`dates[0].timeFrom`, `payload.startTime` for the start time and `dates[0].timeEnd`,
`dates[0].timeTo`, `payload.endTime`, start time for the end time.

## Bookmark Support

Participation Projects are bookmarkable through the existing GenericItem bookmark
mechanism.

The bookmark section key is:

```text
genericItems::ParticipationProject
```

The bookmark screen renders a dedicated Participation Projects section using the
same generic item list and detail behavior.

## Share Support

Participation Projects use the existing generic item share flow. The list parser
adds `shareContent` to the detail route params, and the default detail stack enables
the share header action through `withShare: true`.

## Accessibility

The implementation includes:

- category row accessibility labels with category title and count
- static intro HTML read-aloud registration
- Participation Project detail speech parsing for title, data provider, overview
  fields, tags, teaser, description and content blocks
- existing accessible list item and button components
- shared accessible detail components such as `InfoCard`, `OpeningTimesCard` and `MapLibre`
- explicit accessibility labels for tag text and the calendar export action

After changing this module, run:

```bash
yarn a11y:pr:diff --base Github/master --head HEAD
yarn a11y:pr:check
yarn a11y:coverage:ci
```

If the repository uses a different remote/base branch, replace `Github/master` with
the correct base ref.

## Test Checklist

1. Create at least two `ParticipationProject` generic items on the server.
2. Give at least one item a category id and participation type name, for example `Veranstaltung`.
3. Leave one item without categories to verify the fallback category.
4. Add `participationProjectHome` JSON static content.
5. Add `participationProjectHomeCarousel` JSON static content, or set `showCarousel` to `false`.
6. Add `participationProjectHomeText` HTML static content, or set `showIntro` to `false`.
7. Add a drawer `navigation` entry or a `tabNavigation` entry for `ParticipationProjectHome`.
8. Open the module home screen.
9. Verify the order: carousel, HTML content, category list, featured rows, all-records button.
10. Verify category names and item counts.
11. Open a category and verify that `IndexScreen` lists only that category.
12. Verify that `Alle Beteiligungen ansehen` opens `IndexScreen` without a category filter.
13. Verify that the list is sorted by `payload[indexOrder]` (default: numeric `itemIndex`, ascending).
14. Open a project detail and verify overview, tags, teaser, content block description,
    web URL and data provider notice.
15. Verify the map section appears when coordinates exist.
16. Verify calendar export appears only when a start date exists.
17. Verify share and bookmark actions are available from the detail header.
18. Bookmark a project and verify that it appears in the bookmark screen.
19. Run the accessibility workflow and verify that there are no findings and coverage does not drop.

## Known First-Version Limitations

- Filter UI is intentionally not enabled for this module.
- Map view and map filtering are intentionally not enabled for this module.
- Server-side resource filter configuration for `ParticipationProject` is not required.
- Featured project rows are sorted by `payload[indexOrder]` (default: `itemIndex`) and limited to `featuredLimit`.
- Category counts are based on the first `homeLimit` records returned by the server.
- `indexOrder` currently performs client-side sorting against `payload[indexOrder]` (forwarded as `participationOrder`), not GraphQL `genericItems(order: ...)` sorting.
- For predictable ordering, provide a numeric payload field such as `payload.itemIndex`; non-numeric values fall back to deterministic text sorting.

## Related Source Files

- `src/screens/ParticipationProject/ParticipationProjectHomeScreen.tsx`
- `src/components/screens/ParticipationProjectDetail.tsx`
- `src/types/GenericType.ts`
- `src/types/Navigation.ts`
- `src/config/navigation/defaultStackConfig.tsx`
- `src/helpers/genericTypeHelper.ts`
- `src/helpers/accessibility/detailSpeechParser.ts`
- `src/queries/genericItem.js`
- `src/screens/BookmarkScreen.js`
