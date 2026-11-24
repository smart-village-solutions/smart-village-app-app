# MP3 player

The app shows a compact listen action for direct HTTP(S) audio media on POI, news, event, tour and tour-stop details. On tour stops the audio action appears below the photo and uses the stop title and artwork for system playback. MP3 and read aloud share one floating player: when both are available, its expanded view offers `Vorlesen` and MP3 source tabs. The same player remains available during navigation. Starting MP3 playback cancels pending read aloud and pauses active narration. Starting read aloud pauses MP3 playback and releases its system controls until MP3 playback resumes.

When playback starts from a detail page, the expanded player keeps a shortcut back to that POI, tour, news or event. The shortcut is hidden while that same detail page is already open. The compact player stays centered when another floating shortcut is present; the other shortcut is temporarily hidden while the audio panel is expanded.

With a compatible native build, MP3 playback registers the source detail title and, when available, the audio caption with the system media controls. The native session offers play/pause, timeline seeking and 10-second skip controls. `showSkipControls` also controls the system skip buttons; Expo's native skip interval is currently fixed at 10 seconds, while `skipSeconds` configures the in-app buttons.

The system media title uses the content's actual title for tours, POIs, news and events. Its artwork uses the first available image from the detail (including news content blocks); when the detail has no image, the bundled app icon is shown. An optional audio caption appears as the secondary title.

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

To test background playback and system controls, install a fresh iOS/Android build made after the `expo-audio` background playback plugin was added. On iOS, verify the installed binary has `UIBackgroundModes` containing `audio`; on Android, verify the media playback foreground service is present. Start an MP3, lock the physical device, and check play/pause, seeking, and playback after navigating away from the detail. Recheck after an incoming call or another app interrupts audio. A JavaScript OTA update alone cannot add missing native background capabilities, even when the app version string remains the same. The audio-enabled builds use a separate EAS Update runtime (`5.0.0-audio.1`, or `<app version>-audio.1` for generated apps). Build and distribute the matching native binary before publishing updates to this runtime. Existing customer configurations need the same runtime isolation and background-playback settings when adopting the feature.
