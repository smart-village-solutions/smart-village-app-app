# MP3 player

The app shows a compact listen action for direct HTTP(S) audio media on POI, news, event and tour details. MP3 and read aloud share one floating player: when both are available, its expanded view offers `Vorlesen` and MP3 source tabs. The same player remains available during navigation. Starting MP3 playback pauses read aloud; starting read aloud pauses MP3 playback.

When playback starts from a detail page, the expanded player keeps a shortcut back to that POI, tour, news or event. The shortcut is hidden while that same detail page is already open. The compact player stays centered when another floating shortcut is present; the other shortcut is temporarily hidden while the audio panel is expanded.

The player uses the tenant's existing light/dark theme palette. Optional UI settings come from the versioned Main-Server `globalSettings` StaticContent record, under `settings.audioPlayer`:

```json
{
  "settings": {
    "audioPlayer": {
      "enabled": true,
      "label": "Audioguide",
      "showSkipControls": true,
      "showSpeedControl": true,
      "skipSeconds": 10
    }
  }
}
```

Merge the `audioPlayer` object into the existing `globalSettings` record; keep the tenant's other settings intact.

All fields are optional. Missing settings keep the player enabled and use the built-in UI defaults. `enabled: false` hides direct MP3 actions and stops active MP3 playback. `label` changes the detail action and source tab. `skipSeconds` is rounded and limited to 5–60 seconds; the seek bar remains available when skip buttons are hidden.

Changing these settings does not require a native rebuild once a compatible app version is installed. The first build containing `expo-audio` does require a new native binary for iOS and Android; an OTA update cannot add the native module to an older binary.
