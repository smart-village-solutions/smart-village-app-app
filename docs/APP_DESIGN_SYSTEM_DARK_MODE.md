# App design system dark-mode overrides

Remote `appDesignSystem` values at the root of each section are the shared/light-mode
configuration. Add a `dark` object to override only the values that differ in dark mode:

```json
{
  "appDesignSystem": {
    "serviceTiles": {
      "tileStyle": {
        "backgroundColor": "#7CF7EF",
        "borderRadius": 8
      },
      "dark": {
        "tileStyle": {
          "backgroundColor": "#164E4A"
        }
      }
    }
  }
}
```

Overrides are merged recursively. In this example, dark mode uses the dark background while
retaining the shared `borderRadius`. The `dark` metadata is removed before the resolved styles are
passed to React Native.

A complete copy-ready configuration fragment is available in
[`app-design-system-dark-mode.json`](./app-design-system-dark-mode.json).

The current card-list configuration names are `overtitleStyle` and `overtitle`; the legacy
`topTitleStyle` and `topTitle` names should not be used in new remote configurations.
Service-tile icon dimensions use the React Native icon-style key `size`, not `iconSize`.

## Static-content carousel button icons

Carousel button styles support the same recursive `dark` override. Place it directly beside the
light icon color:

```json
{
  "button": {
    "style": {
      "iconColor": "#FFFFFF",
      "iconPosition": "right",
      "dark": {
        "iconColor": "#141414"
      }
    },
    "routeName": "SueReport",
    "iconName": "Plus",
    "title": "Etwas melden",
    "params": {}
  }
}
```

`#FFFFFF` matches the light palette's `onPrimary` color and `#141414` matches its dark-mode
equivalent.
