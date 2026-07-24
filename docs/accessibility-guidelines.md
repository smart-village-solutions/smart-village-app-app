# Accessibility Guidelines

## Scope

This document defines the accessibility baseline for React Native features in this project.
It covers implementation rules, test expectations, and release checks.

## Runtime Configuration Contract

App-level accessibility behavior is configured from:

- `globalSettings.settings.accessibility.enabledFeatures`
- `globalSettings.settings.accessibility.defaults`

User preferences are persisted separately in local storage:

- `accessibilityUserSettings`

This separation is required so server-side `globalSettings` refreshes do not overwrite user choices.

## PR Gating Model

Accessibility CI is PR-scoped for merge blocking:

1. Detect changed files/components in PR diff.
2. Run component-scoped checks for changed files.
3. Publish JSON/Markdown reports as artifacts and PR comment.
4. Fail PR only on scoped component findings.

Full-scan tests still run for visibility but do not block PRs by themselves.

## Implementation Rules

1. Every interactive control must have:
   - `accessibilityLabel`
   - `accessibilityRole`
   - `accessibilityState` when applicable (`disabled`, `selected`, `checked`, `expanded`)
2. Use shared primitives first:
   - `Button`
   - `Touchable`
   - `Checkbox`
   - `Radiobutton`
   - `Switch`
   - `Input`
   - `Modal`
3. Do not introduce new raw `TouchableOpacity` or `Pressable` controls without accessibility props.
4. Icon-only actions must expose a meaningful action label, not only the icon meaning.
5. Modal and overlay surfaces must set modal semantics and provide a labeled close action.
6. Loading states must be announced with `progressbar` or alert semantics.
7. Form controls must expose invalid and disabled states through `accessibilityState`.
8. Media and scanner surfaces must provide labels and usable fallback actions.

## Color, Motion, and Typography

1. Avoid relying only on color to communicate status.
2. Ensure sufficient contrast for text and critical UI states.
3. Respect reduced-motion behavior where animations are non-essential.
4. Validate large text behavior for clipping and overflow in fixed-height controls.

### Reduced Motion Expectations

When app-level `reduceMotionEnabled` is active (or OS reduced motion is active):

1. Stack navigation transitions should be disabled.
2. Non-essential carousel autoplay should be disabled.
3. Motion-heavy modal transitions should use `animationType="none"` where practical.
4. UX flow must remain functionally identical; only animation intensity should change.

## Test Requirements

1. Add or update component tests when accessibility props are changed.
2. Keep accessibility-focused tests in `__tests__/components/AccessibilityPrimitives.test.js` and extend as needed.
3. Run `npm run test:accessibility` locally before opening a PR.
4. CI must run accessibility tests on pull requests.

## Manual Verification Matrix

Run smoke checks on:

1. iOS + VoiceOver
2. Android + TalkBack
3. iOS Larger Text
4. Android font-size scaling
5. Reduced Motion enabled
6. High contrast / reduced transparency scenarios
7. Settings screen and header accessibility modal state sync
8. Onboarding terms gating (`continue/skip`) behavior

## PR Review Checklist

Before merge, confirm:

1. New/changed controls include label + role and state where needed.
2. Modal or overlay changes keep focus and close actions accessible.
3. Form changes expose error and disabled semantics.
4. `npm run test:accessibility` passes.
5. Any known accessibility tradeoff is documented in the PR description.
6. If motion behavior changed, reduced-motion mode has been manually verified.
