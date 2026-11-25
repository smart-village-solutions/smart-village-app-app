# Local event reminders

Configure `settings.personalizedPush.eventReminders` in a municipality's
`globalSettings`. Set `singleEnabled` for individual reminders and
`categoryEnabled` for category subscriptions. Each mode is off unless its own
flag is `true`. This example enables both while keeping existing news categories.

```json
{
  "settings": {
    "personalizedPush": {
      "categories": {
        "queryVariables": { "tagList": ["news_item"] },
        "sectionTitle": "Push-Benachrichtigungen für Nachrichtenkategorien"
      },
      "eventReminders": { "singleEnabled": true, "categoryEnabled": true }
    }
  }
}
```

Reminders are available on Main-Server event details. When either reminder
mode is enabled, app settings link to **Push-Benachrichtigungen**, where
**Veranstaltungserinnerungen** is available. If category reminders are enabled,
the push settings screen also shows the event category switches directly.
This location applies with or without a remote push category configuration.

The category switches include categories tagged `event_record` and categories
assigned to visible events, including those without that tag.
Switching a category on opens the existing reminder rule editor. Saving the rule
enables the switch. Switching it off asks for confirmation and cancels the
associated local reminders. Saved subscriptions remain manageable when the
category catalog is unavailable.

Remote category switches control messages sent by the server. The `tagList`
filters those categories. Local reminder rules use Main-Server event
categories, device storage, and operating system notification permissions.
They can be managed with remote push switched off.
When the app receives a disabled mode in `globalSettings`, it removes the
corresponding pending plans and reconciles the remaining mode. For example, an
eligible category rule can take over from a disabled single rule. Stored rules
become available again if their mode is re-enabled.

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

The app refreshes stored occurrence details and category subscriptions when it
has a connection on launch or foreground. Subscriptions use their own
paginated Main-Server query and match the selected category ID. They consider
reminders due over the next 90 calendar days. Subscriptions display the last
successful fetch and the coverage confirmed from the native notification
inventory. A failed fetch preserves the prior schedule.

Relative rules follow a confirmed move with the same occurrence ID. Invalid
absolute reminders need review. An explicitly invisible event or a verified
category membership change removes the affected planning. Partial responses,
records with replaced IDs, and failed requests preserve existing plans until
the source confirms the change. Recently ended occurrences are hidden and
retained locally for seven days so the next lookup can still find a confirmed move.

Single reminders take precedence over category subscriptions. When several
category rules apply, the earliest future time wins. Occurrence exclusions and
category rules are stored locally. Removing a single reminder restores the
applicable category rule. Removing a category rule leaves any independent
single reminder in place.

Before enabling the feature in a release, confirm the iOS budget and actual
delivery on iOS and Android. Include offline delivery, cold-start navigation,
permission changes, and waste replacement with a full queue. Validate the
source's stable occurrence IDs and explicit cancellation or removal information
for the instances that will enable the feature.

### Device verification for SVAK-245

On the iPhone 17 simulator, a single reminder was delivered after the app was
terminated with remote push disabled. Tapping the notification opened the
correct occurrence. Using the same test CMS event (record `9998`, occurrence
`92231`), a category subscription displayed a confirmed request in the app and
the OS inventory. Excluding and re-including the occurrence changed the detail
status. Deleting the subscription cleared its entry and removed the pending
request from the OS inventory. The deleted subscription stayed absent after an
app restart.

On the Pixel 4a Android emulator, denying notification permission showed the
explanation and opened the system settings from the provided action. After
enabling notifications there, saving the same category subscription created
one native notification request for occurrence `92231`. Deleting the
subscription removed that request and cleared the app's entry.

Release acceptance still requires checking source-confirmed moves and
cancellations, full waste queue coexistence, permission revocation, device
reboot, time-zone changes, and accessibility on the supported platforms, plus
Android delivery and navigation from a terminated app.
