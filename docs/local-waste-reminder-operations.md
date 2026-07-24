# Lokale Abfall-Erinnerungen: Android-Diagnose

## Verifizierte Android-Basis

Die Prüfung mit Expo SDK 54 und `expo-notifications` 0.32.17 ergab:

- Die Notifications-Library deklariert `POST_NOTIFICATIONS` und
  `RECEIVE_BOOT_COMPLETED` sowie Receiver für Boot und Paket-Aktualisierung.
- Weder die generierte App-Konfiguration noch die Library deklariert
  `SCHEDULE_EXACT_ALARM` oder `USE_EXACT_ALARM`.
- `ExpoSchedulingDelegate` nutzt bei fehlendem Exact-Alarm-Zugriff
  `setAndAllowWhileIdle`. Deshalb gibt es in der App keinen Link zu „Alarme &
  Erinnerungen“. Exakte Zustellung ist kein Versprechen dieser Funktion.

Nach einem Expo-Upgrade müssen Manifest und Scheduling-Delegate erneut geprüft
werden.

## Testmatrix

| Szenario | Native inventory direkt danach | Interpretation |
|---|---:|---|
| Benachrichtigungen verweigert | 0 | `permission-required`; Registrierung blockiert |
| Kanal deaktiviert | 0 oder API-Fehler | Kanal-/Berechtigungsproblem |
| Expo-Scheduling schlägt fehl | alte Anzahl bleibt erhalten | Registrierungsfehler |
| Scheduling erfolgreich, erwartete IDs fehlen | alte Anzahl bleibt erhalten | Verifikationsfehler |
| Erwartete IDs vorhanden, Erinnerung verspätet/fehlt | erwartete Anzahl | Zustellung/OEM/Energiesparen untersuchen |
| Owner-/Token-Wechsel | alte Owner-IDs entfernt | nur validierte Einstellungen des neuen Owners |
| Neustart | Bestand erneut prüfen | Wiederherstellung/Zustellung untersuchen |

Die Matrix ist auf einem Samsung-Gerät mit Android 12 oder neuer (normale und
eingeschränkte Akku-Nutzung) und einem Nicht-Samsung-Gerät auszuführen. Dafür
einen Release- oder Dev-Client-Build verwenden, nicht nur Expo Go. Permission
und Kanal jeweils aktiviert und deaktiviert testen; zusätzlich direkt nach dem
Speichern, nach Force-Stop/App-Start, nach Neustart und nach dem erwarteten
Zeitpunkt prüfen.

## Registrierung und Zustellung

Ein von Expo zurückgegebener und anschließend im native inventory gefundener
Eintrag belegt nur die Registrierung. Er garantiert keine pünktliche
Zustellung. Samsung-/OEM-Energiesparen ist erst dann eine plausible
Zustellungsdiagnose, wenn die Registrierung unmittelbar zuvor bestätigt wurde.
Ein sofortiger nativer Bestand von 0 ist kein Energiesparproblem.

## Datenschutz

Für interne System-, Diagnose- und Testprotokolle sind nur Hersteller, Modell,
Android-Version, App-Version, feste Fehlerklasse, feste Status-/Outcome-Werte,
unpersönliche Modus- und Verfügbarkeitswerte sowie aggregierte erwartete und
tatsächlich registrierte Anzahlen zulässig. Keine Adresse, Abfallart, Push- oder
Access-Token, Owner-Hashes, Server- oder Notification-IDs, Reminder-Keys,
Inhalte oder konkreten Termine aufzeichnen. Daten, die Nutzerinnen und Nutzer
über den bestehenden Feedback-/Diagnosebericht bewusst übermitteln, fallen
nicht unter diese Einschränkung und werden durch diese interne Logging-Regel
nicht verändert.
