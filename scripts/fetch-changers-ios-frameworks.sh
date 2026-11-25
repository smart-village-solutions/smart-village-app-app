#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CACHE=$(mktemp -d)
trap 'rm -rf "$CACHE"' EXIT
# Anbieter-Binaries aus einem festgelegten Commit; das fehlerhafte Upstream-Podspec nicht verwenden.
git clone --quiet https://github.com/Changers/changers-ios-sdk.git "$CACHE/vendor"
git -C "$CACHE/vendor" checkout --quiet 33c65f9b8db1618dfff3530c73a061935a66a9ff
mkdir -p "$ROOT/modules/expo-changers/ios/Frameworks"
cp -R "$CACHE/vendor/SDKSample/ChangersSDK.xcframework" "$CACHE/vendor/SDKSample/MotionTagSDK.xcframework" "$ROOT/modules/expo-changers/ios/Frameworks/"
