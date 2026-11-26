# Local event reminders

Configure `settings.personalizedPush` in a municipality's `globalSettings`.
`eventReminders.singleEnabled` enables individual local reminders. Including
`event_record` in `categories.queryVariables.tagList` enables category reminders.
`news_item` enables the existing remote news category preferences.

```json
{
  "settings": {
    "personalizedPush": {
      "categories": {
        "queryVariables": { "tagList": ["news_item", "event_record"] },
        "sectionTitle": "Push-Benachrichtigungen für Nachrichtenkategorien",
        "eventSectionTitle": "Erinnerungen für Veranstaltungskategorien"
      },
      "eventReminders": { "singleEnabled": true }
    }
  }
}
```

**Push-Benachrichtigungen** contains one event category list. Tagged event
categories start off. A category enabled from an event detail is added in
alphabetical order even if the category has no `event_record` tag. Switching
off cancels pending notifications and retains the rule for reactivation. The
list stays the same when a switch changes. Tapping a category name opens its
rule, sync status, and confirmed scheduling coverage in the reminder dialog.
The dialog also offers permanent deletion. Category names display decoded HTML
character references as plain text.
Set `categories.eventSectionTitle` to override the default event category
heading. `categories.sectionTitle` configures the news category heading.

**Veranstaltungserinnerungen** shows configured individual reminders using the
standard event list layout. Tapping a row opens the reminder settings. Pausing
a reminder retains its rule until the event begins. Permanent deletion removes
the rule and lets any applicable category reminder take over. Completed reminders
drop out of the list. The app observes incoming deliveries while open and reconciles
past scheduled reminders against the pending OS inventory when activated.

Local rules use device storage. Activation and scheduling require both the
in-app push switch and the operating system's notification permission. Turning
off either permission suspends pending reminders and keeps the saved rules.
Opening the reminder action on an event while permissions are off directs
the user to the relevant settings. Instances that enable event reminders
without configuring remote push still offer the in-app switch for local reminders.
In instances that offer both, the switch saves local consent while offline or
when remote device registration fails. The app retries remote registration or
removal when it reconnects or returns to the foreground. Remote subscriptions
become available once registration succeeds.
Removing `event_record` or disabling `singleEnabled` cancels the corresponding
pending requests once the app receives the changed configuration.

The default reminder is three calendar days before the occurrence in
`Europe/Berlin`. When the source has no fixed start, the default time is noon.
A same-day reminder is allowed for such an occurrence. When a local time occurs
twice, the planner chooses the first instant. During a clock change that skips an
hour, it moves the time forward by that hour and displays the resulting time in
the preview. Android may deliver the notification near the chosen time because
the current native configuration uses inexact alarms when exact alarms are unavailable.
The app keeps a due category request while it is still pending in the OS and
the occurrence and subscription remain eligible. This also prevents a later
overlapping category rule from generating a second notification.

On iOS the event scheduler uses a provisional budget of 60 pending requests
across the app. Waste scheduling can temporarily reclaim event slots. The app
restores event reminders in due-time order from the verified inventory after the
waste operation. Android uses a separate notification channel for events.

The app refreshes stored occurrence details and category subscriptions when it
has a connection on launch or foreground. Subscriptions use their own
paginated Main-Server query and match the selected category ID. They consider
reminders due over the next 90 calendar days. Their dialogs display the last
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

### sva-studio and Main-Server follow-up

1. **Preserve occurrence IDs through edits.** Include the date ID returned by
   Main-Server in the Studio date form, save payload, and integration adapter.
   The current Studio date serializer omits the ID and its Main-Server date
   input type cannot carry it. Coordinate ID-based matching with Main-Server,
   which has a fallback based on editable date and time fields. Validate that
   each supplied ID belongs to the edited event and instance. Keep the same ID
   when an occurrence moves, including occurrences from imported or recurring
   events, and generate a new ID for a new occurrence.
2. **Expose authoritative cancellations.** Distinguish cancellation or removal
   of one occurrence, deletion or unpublishing of the whole event, and removal
   from a category. Align the Studio actions and Main-Server read contract so
   the mobile app can confirm the affected IDs after coming back online.
   Define how long removed items remain queryable, how changes update the
   event version, and how a complete category query is distinguished from an
   incomplete response.
3. **Publish settings per municipality.** Use Studio's app configuration
   editor to publish `event_record` in `personalizedPush.categories.queryVariables.tagList`
   and independently set `personalizedPush.eventReminders.singleEnabled`.
   Support `personalizedPush.categories.eventSectionTitle` for a custom label.
   Verify the existing event category type is assigned where intended and
   preserve unrelated settings, including `news_item` subscriptions. Verify
   the default configuration and opt-in for Bad Belzig before rollout.
4. **Cover the contracts end to end.** Create a multi-date event in Studio,
   move one occurrence while keeping its ID, remove another, then unpublish the
   event. Exercise an imported or recurring event and verify that a client
   returning after an offline period receives the same IDs and explicit
   changes. Check the mobile app reschedules a moved relative reminder and
   cancels only the requests affected by a removal.

### Device verification for SVAK-245

On the iPhone 17 simulator, a single reminder was delivered after the app was
terminated. Tapping the notification opened the
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
subscription removed that request and cleared the app's entry. A single
reminder was delivered with Wi-Fi and mobile data disabled and with the app
process stopped before the alarm fired. After reconnecting, tapping the
notification launched the app and opened occurrence `92231`. The app retained
its completion marker.

The Pixel 4a also verified that the in-app push switch can be turned on and
off with both Wi-Fi and mobile data disabled. The event category switches
became available on opt-in and were disabled on opt-out. The remote news
category switches stayed disabled while offline.

The category switch layout was verified on both simulators with the
`Führung / Besichtigung` category. Activating it left the list layout intact,
and tapping its name revealed the sync status in the dialog. On iOS,
switching `Veranstaltung` off canceled its pending request for occurrence
`92231`. After reactivation, permanent deletion removed both the saved rule
and the pending request.

On iOS, restoring notification permission in System Settings allowed the
in-app switch to be enabled on the next attempt. Switching it off disabled
both category lists and canceled the planned event request. The reminder
action in the event detail stayed visible and opened the in-app permission
alert.

Release acceptance still requires checking source-confirmed moves and
cancellations, full waste queue coexistence, permission revocation, device
reboot, time-zone changes, and accessibility on the supported platforms.
