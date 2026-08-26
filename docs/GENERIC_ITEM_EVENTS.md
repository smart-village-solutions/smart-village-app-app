# Generic Item events

Generic Items can be included as additional entries in the event list, calendar, home event
section, and event widget. Configure one or more sources in the tenant settings:

```json
{
  "settings": {
    "eventCalendar": {
      "genericItemEventSources": [
        {
          "genericType": "ParticipationProject",
          "filterTypes": ["Veranstaltung"],
          "filterStatuses": ["active", "announced"]
        }
      ]
    }
  }
}
```

`genericType` selects the Generic Item dataset. `filterTypes` and `filterStatuses` are optional;
missing or empty arrays disable the corresponding filter. Matches ignore surrounding whitespace
and letter case. A type is read from `payload.type` and every `categories[].name`. A status can be
a primitive `payload.status` or a structured value using, in order, `label`, `text`, `title`,
`name`, `status`, or `value`. Known localized status aliases are canonicalized.

Each valid element in `dates[]` creates one occurrence on `dateStart` (or `dateFrom`). Date ranges
are not expanded. Without an explicit calendar range, past occurrences are excluded. Missing or
malformed payload, filter, and date fields fail safely and do not create occurrences.

The resulting occurrences are merged with main-server and other external events in the full event
list, calendar dots and selected-day sublist, home section, and widget count. Selecting a native
EventRecord category or location filter suppresses all external sources because those filters do
not describe their datasets.

Generic Items currently have no server-side `dateRange`. The client therefore fetches and caches
the returned dataset once per `genericType`, then filters it locally. If the server applies an
undocumented default limit or a dataset grows substantially, backend date filtering or explicit
pagination is required so events are not silently omitted.
