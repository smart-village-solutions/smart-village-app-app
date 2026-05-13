## Summary

- 

## Validation

1. `npm test -- --runInBand` (if relevant)
2. `npm run test:accessibility`

## Accessibility Checklist

- [ ] Every new/updated interactive element has `accessibilityLabel`
- [ ] Every new/updated interactive element has `accessibilityRole`
- [ ] `accessibilityState` is set when needed (`disabled`, `selected`, `checked`, `expanded`)
- [ ] Icon-only actions expose a meaningful action label
- [ ] Modal/overlay changes include labeled close action and modal semantics
- [ ] Form changes expose invalid/disabled states for screen readers
- [ ] Color-only status changes include text/state equivalents
- [ ] Large-text behavior was checked for clipping in affected screens

## Notes

- 
