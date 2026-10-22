# Remote list views

Use `globalSettings.sections.listTypes` to choose the list view for lists that use the shared list
renderer. The keys are the query names used by the app. Unspecified keys keep the app's code default. Previously
saved device choices are no longer read at startup, so all users receive the same default or remote
choice. Invalid values are ignored.

```json
{
  "sections": {
    "listTypes": {
      "newsItems": "textList",
      "eventRecords": "imageTextList",
      "pointsOfInterest": "cardList",
      "tours": "cardList"
    }
  }
}
```

Supported values are `textList`, `imageTextList`, `cardList`, `cardTextList`, and `groupedList`.
`pointsOfInterestAndTours` can be used as a shared fallback; individual `pointsOfInterest` and
`tours` keys take precedence. The same query key controls that content type wherever it uses the
shared list renderer, including home, overview, bookmarks, and calendar lists. Other shared-list
query names can also be configured individually, such as `genericItems`, `staticContentList`,
`calendarAll`, `calendarAllMy`, `wallet`, `requests`, `myRequests`, `getConversations`, and
`tourStops`.

Some lists use content-specific row renderers (`groupedList` for search and waste, for example),
or a dedicated list component (category and voucher lists). These dedicated components keep their
own layout. Choose a presentation supported by each shared list's content. Images appear only when
the content has an image URL. Lists that force a horizontal or vertical layout keep that layout;
the remote setting changes the row presentation.

This belongs in the complete versioned `globalSettings` JSON record. Merge these fields with
existing `sections` values rather than replacing the whole object.
