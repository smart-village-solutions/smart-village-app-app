#!/bin/sh
# Native UIKit checks without the provider SDK, credentials, or a signing account.
# Run against a booted Apple Silicon simulator: sh .../run-presentation-tests.sh <UDID>
set -eu
test_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_dir=$(CDPATH= cd -- "$test_dir/../../.." && pwd)
simulator_id=${1:-booted}
output_dir=$(mktemp -d /tmp/sva-klima-presentation.XXXXXX)
app_dir="$output_dir/CloseHarness.app"
bundle_id=com.sva.klimataler.closeharness
mkdir -p "$app_dir"
trap 'xcrun simctl uninstall "$simulator_id" "$bundle_id" >/dev/null 2>&1 || true' EXIT

python3 - "$app_dir/Info.plist" <<'PY'
import plistlib
import sys
with open(sys.argv[1], 'wb') as target:
    plistlib.dump({
        'CFBundleIdentifier': 'com.sva.klimataler.closeharness',
        'CFBundleExecutable': 'CloseHarness', 'CFBundleName': 'Close Harness',
        'CFBundlePackageType': 'APPL', 'CFBundleVersion': '1',
        'CFBundleShortVersionString': '1.0', 'MinimumOSVersion': '16.4',
        'UIDeviceFamily': [1, 2], 'UILaunchScreen': {},
        'UIApplicationSceneManifest': {
            'UIApplicationSupportsMultipleScenes': False,
            'UISceneConfigurations': {'UIWindowSceneSessionRoleApplication': [
                {'UISceneConfigurationName': 'Test'}
            ]}
        }
    }, target)
PY
xcrun --sdk iphonesimulator swiftc -target arm64-apple-ios16.4-simulator \
  -sdk "$(xcrun --sdk iphonesimulator --show-sdk-path)" \
  "$repo_dir/modules/expo-changers/ios/ChangersProviderViewController.swift" \
  "$test_dir/PresentationHarness.swift" -o "$app_dir/CloseHarness"
codesign --force --sign - "$app_dir"
xcrun simctl terminate "$simulator_id" "$bundle_id" >/dev/null 2>&1 || true
xcrun simctl install "$simulator_id" "$app_dir"
container_dir=$(xcrun simctl get_app_container "$simulator_id" "$bundle_id" data)
rm -f "$container_dir/Documents/result.txt"
xcrun simctl launch "$simulator_id" "$bundle_id"
attempt=0
while [ ! -f "$container_dir/Documents/result.txt" ] && [ "$attempt" -lt 30 ]; do
  sleep 1
  attempt=$((attempt + 1))
done
cp "$container_dir/Documents/result.txt" "$output_dir/result.txt"
cp "$container_dir/Documents/close-button.png" "$output_dir/close-button.png"
cat "$output_dir/result.txt"
printf '\nArtifacts: %s\n' "$output_dir"
rg -q '^PASSED:' "$output_dir/result.txt"
