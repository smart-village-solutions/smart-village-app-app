# Cache Configuration

## Overview

The app cache lifetime can be configured through `globalSettings.settings.cache`. The configuration is loaded from the main server via the existing `globalSettings` public JSON flow and is also persisted locally with the rest of the global settings.

If no cache configuration is provided, the app defaults to keeping cache until the end of the current day.

## Configuration Format

Add a `cache` object inside `globalSettings.settings`:

```json
{
  "settings": {
    "cache": {
      "general": "endDay",
      "sue": 14,
      "home": "endOfDay",
      "apollo": 6
    }
  }
}
```

Each cache value can be either:

- A number: interpreted as hours. For example, `14` means 14 hours.
- A string: interpreted as a Moment-style `endOf(...)` value. For example, `"endDay"`, `"endOfDay"`, and `"endOf('day')"` all mean the end of the current day.

Use `0` to expire a cache scope immediately.

## Supported Scopes

| Scope     | Affects                                                                 | Fallback |
| --------- | ----------------------------------------------------------------------- | -------- |
| `general` | Default React Query cache for app data and fallback for missing scopes. | End of current day |
| `apollo`  | Persisted Apollo GraphQL cache restored from AsyncStorage.              | `general` |
| `home`    | Home screen data sections rendered through `HomeSection`.               | `general` |
| `sue`     | SUE request list data loaded through `SueListScreen`.                   | `general` |

## Supported String Values

The parser accepts compact aliases and Moment-style strings for `endOf(...)` units.

Common examples:

| Value            | Meaning |
| ---------------- | ------- |
| `"endDay"`       | End of the current day |
| `"endOfDay"`     | End of the current day |
| `"endOf('day')"` | End of the current day |
| `"endWeek"`      | End of the current week |
| `"endOfWeek"`    | End of the current week |
| `"endMonth"`     | End of the current month |
| `"endYear"`      | End of the current year |

Supported units are `hour`, `day`, `week`, `isoWeek`, `month`, `quarter`, and `year`.

## Fallback Rules

The app resolves cache configuration in this order:

1. Use the requested scope value, for example `settings.cache.sue`.
2. If the requested scope is missing or invalid, use `settings.cache.general`.
3. If `general` is missing or invalid, use the built-in default: end of the current day.

Example:

```json
{
  "settings": {
    "cache": {
      "general": "endDay",
      "sue": 14
    }
  }
}
```

In this example:

- SUE list cache expires after 14 hours.
- Home cache uses `general`, so it expires at the end of the current day.
- Apollo cache uses `general`, so it expires at the end of the current day.
- Any other React Query cache uses `general`, so it expires at the end of the current day.

## Examples

### One Rule for the Whole App

```json
{
  "settings": {
    "cache": {
      "general": 24
    }
  }
}
```

All cache scopes use 24 hours unless a scope-specific value is added.

### Refresh Everything at the End of the Day

```json
{
  "settings": {
    "cache": {
      "general": "endDay"
    }
  }
}
```

This is equivalent to the built-in default, but makes the behavior explicit in server configuration.

### Custom SUE Cache

```json
{
  "settings": {
    "cache": {
      "general": "endDay",
      "sue": 14
    }
  }
}
```

SUE request list data expires after 14 hours. Other cache scopes expire at the end of the day.

### Separate Apollo and Home Cache

```json
{
  "settings": {
    "cache": {
      "general": "endDay",
      "apollo": 6,
      "home": "endOfHour"
    }
  }
}
```

Apollo persisted GraphQL cache expires after 6 hours. Home screen data sections expire at the end of the current hour. Missing scopes still use `general`.

## Implementation Notes

- Scope definitions live in `src/helpers/cacheHelper.js` as `CACHE_SCOPES`.
- Apollo cache expiration metadata is stored next to the persisted cache under `apollo-cache-persist:expires-at`.
- React Query uses the resolved `general` value as the default `cacheTime`.
- Scope-specific React Query cache values are applied where the cache is created, for example `sue` in `SueListScreen` and `home` in `HomeSection`.
- Invalid values are ignored and fall back to `general` or the built-in end-of-day default.

## Validation Checklist

- Confirm that `globalSettings` contains `settings.cache`.
- Use numbers for hour-based cache durations.
- Use supported `endOf` strings for calendar-bound expiration.
- Add a scope-specific value only when that app area needs different behavior from `general`.
- Test with no cache settings to verify the built-in end-of-day fallback.
