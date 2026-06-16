# Accessibility Guidelines

## Scope

This document defines the accessibility baseline for React Native features in this project.
It covers implementation rules, test expectations, and release checks.

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

## PR Review Checklist

Before merge, confirm:

1. New/changed controls include label + role and state where needed.
2. Modal or overlay changes keep focus and close actions accessible.
3. Form changes expose error and disabled semantics.
4. `npm run test:accessibility` passes.
5. Any known accessibility tradeoff is documented in the PR description.
