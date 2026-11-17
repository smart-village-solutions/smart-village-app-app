import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';

// Read the installed binary, not build numbers embedded in an OTA's app.json.
export const installedApp = { version: nativeApplicationVersion, build: nativeBuildVersion };
