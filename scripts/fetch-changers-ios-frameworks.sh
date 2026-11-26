#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CACHE=$(mktemp -d)
trap 'rm -rf "$CACHE"' EXIT
# Anbieter-Binaries aus einem festgelegten Commit für beide Plattformarchitekturen.
git clone --quiet https://github.com/Changers/changers-ios-sdk.git "$CACHE/vendor"
git -C "$CACHE/vendor" checkout --quiet 4bcbd85dcf3d303fd262b2165d5f57fa6c620ad0
mkdir -p "$ROOT/modules/expo-changers/ios/Frameworks"
cp -R "$CACHE/vendor/SDKSample/ChangersSDK.xcframework" "$CACHE/vendor/SDKSample/MotionTagSDK.xcframework" "$ROOT/modules/expo-changers/ios/Frameworks/"
