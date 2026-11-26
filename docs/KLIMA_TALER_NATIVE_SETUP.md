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

The pinned Changers 4.3.0 / MotionTag 6.3.4 XCFrameworks include arm64 simulator slices. The old 4.2.0 simulator workaround is removed. Use a physical device to validate tracking and provider sessions under real permission and lifecycle conditions.

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

## Registration recovery

SDK activation and successful account creation are separate states. The iOS adapter persists a registration journal before dispatching signup. A known offline failure before dispatch remains retryable, including after restarting the app. An ambiguous response after dispatch, an existing identity, or an older activated installation must not cause automatic creation of a second account; the entry explains when provider support is required.

Registration recovery was introduced with the `changers-3` runtime. The current SDK, offer links, fullscreen presentation and badge links require a new native build using `<app version>-changers-8-<environment>`. The configured `stage` or `production` environment must match the mobile credentials. JavaScript detects older binaries and preserves conservative registration and capability fallbacks.

The journal persistence checks run without provider credentials or an iOS SDK binary:

```sh
swiftc modules/expo-changers/ios/ChangersRegistration.swift __tests__/klimaTaler/ios/RegistrationHarness.swift -o /tmp/kt-registration-harness
/tmp/kt-registration-harness
```
