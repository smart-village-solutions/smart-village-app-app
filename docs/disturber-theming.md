# Disturber theme configuration

Disturber static JSON uses the same `dark` overrides as other theme-aware remote content.
Root values are used in light mode and remain the fallback in dark mode. Add a `dark`
object to an entry to override its background, or to a nested picture to change its image:

```json
[
  {
    "id": 1,
    "backgroundColor": "#E5BFF7",
    "dark": {
      "backgroundColor": "#302238"
    },
    "title": "Village news",
    "dates": [{ "dateStart": "2026-01-01", "dateEnd": "2026-12-31" }],
    "pictures": [
      {
        "picture": {
          "uri": "https://example.com/teaser-light.png",
          "dark": { "uri": "https://example.com/teaser-dark.png" },
          "routeName": "Web",
          "params": { "webUrl": "https://example.com" }
        }
      }
    ]
  }
]
```

Replace the example URLs with your own assets. Choose a dark background that provides
contrast with the app's dark-theme text. Text, buttons and the close control continue to
use the app's theme palette. Existing JSON without `dark` keeps its configured values;
colors and images are not automatically converted.

Overrides merge nested objects; arrays supplied inside `dark` replace the entire base
array. Omitted properties keep their base values. Theme changes apply immediately without
refetching content. Scheduling and dismissal use the original entry's dates and ID, so
changing themes does not redisplay a dismissed entry.
