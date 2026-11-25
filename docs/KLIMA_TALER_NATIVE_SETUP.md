# Klima-Taler native build setup

The local `expo-changers` module links the vendor SDKs into iOS and Android binaries. Its native capability does not activate tracking or create an account by itself. Customer-specific provider configuration and runtime activation are separate steps.

## Local iOS builds

On a clean checkout, install JavaScript dependencies and provision the pinned vendor frameworks before running CocoaPods or Xcode:

```sh
yarn install --frozen-lockfile
yarn changers:prepare:ios
yarn ios
```

For a manually generated iOS project, run `yarn changers:prepare:ios` before `pod install` as well. The preparation command downloads the public Changers repository at the commit pinned in `scripts/fetch-changers-ios-frameworks.sh` and copies both XCFrameworks into `modules/expo-changers/ios/Frameworks/`. It does not require provider credentials. The binaries remain ignored by Git.

Run the preparation command again after changing the SDK pin. EAS runs the same script through its iOS pre-install hook; that EAS hook does not run automatically in a local CocoaPods/Xcode workflow.

This setup also applies to unconfigured customer builds, because the shared native module is linked into the binary. Provider activity still requires the customer's own configuration and explicit activation.

## Build and OTA compatibility

SDK, config-plugin and native-module changes require a new iOS/Android build. Do not distribute them as a JavaScript-only OTA to an older binary. The plugin assigns a Changers-specific runtime to isolate incompatible binaries.

The pinned vendor frameworks do not support the arm64 iOS simulator. The module returns an explicit unsupported-simulator error instead of creating a simulated account. Use a physical device to test provider onboarding and sessions.

## Validation

Run `yarn test --runInBand __tests__/klimaTaler` for the JavaScript API and configuration tests. The iOS presentation harness can run independently of provider credentials on a booted Apple Silicon simulator:

```sh
sh __tests__/klimaTaler/ios/run-presentation-tests.sh
```

Android module tests are available through the generated Android project:

```sh
cd android
./gradlew :expo-changers:testDebugUnitTest
```
