# Local event reminders

Set `settings.eventCalendar.reminders.enabled` to `true` in a municipality's
`globalSettings` to enable the single-event workflow. The default is off. The UI appears
on Main-Server event details and in the app's settings. Reminders use local device
storage and the operating system's notification permissions.

The default reminder is three calendar days before the occurrence in
`Europe/Berlin`. When the source has no fixed start, the default time is noon.
A same-day reminder is allowed for such an occurrence. When a local time occurs
twice, the planner chooses the first instant. During a clock change that skips an
hour, it moves the time forward by that hour and displays the resulting time in
the preview. Android may deliver the notification near the chosen time because
the current native configuration uses inexact alarms when exact alarms are unavailable.

On iOS the event scheduler uses a provisional budget of 60 pending requests
across the app. Waste scheduling can temporarily reclaim event slots. The app
restores event reminders in due-time order from the verified inventory after the
waste operation. Android uses a separate notification channel for events.

The app refreshes stored occurrence details when it has a connection on launch
or foreground. Relative rules follow a confirmed move with the same occurrence
ID. Invalid absolute reminders need review. A successful response that explicitly
marks the event invisible removes its reminders. Partial responses, records with
replaced IDs, and failed requests preserve existing schedules. Recently ended
occurrences are hidden and retained locally for seven days so the next lookup
can still find a confirmed move.

Before enabling the feature in a release, confirm the iOS budget and actual
delivery on iOS and Android. Include offline delivery, cold-start navigation,
permission changes, and waste replacement with a full queue. Category subscriptions
require an authoritative occurrence feed with pagination, stable IDs across moves,
and reliable cancellation or removal information.
