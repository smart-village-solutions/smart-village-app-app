# Tab Navigation Icons

Custom entries in the `tabNavigation` public JSON file can use a named icon, a remote SVG, or a
remote image. Existing `iconName` and `iconSet` configurations remain supported.

## Icon sources

| Default source | Focused source   | Description                                                                        |
| -------------- | ---------------- | ---------------------------------------------------------------------------------- |
| `iconName`     | `activeIconName` | Built-in or Tabler icon name                                                       |
| `svg`          | `activeSvg`      | Complete HTTP(S) URL or an SVG name resolved through `settings.icons.svgFolderUrl` |
| `icon`         | `activeIcon`     | Complete URL for a PNG, JPEG, WebP, or other static image                          |

When a focused source is not configured, the default source is used. If multiple sources are
provided for the same state, the priority is `iconName`, `svg`, then `icon`, matching service tiles.

The icon visual is decorative for accessibility because the tab button exposes the configured
`accessibilityLabel`, position, role, and selected state. Do not repeat the label in the image or
SVG itself.

## Theme behavior

Named and SVG icons use the tint color resolved for the active theme and focus state. Tab SVGs are
treated as monochrome so solid fill and stroke colors can follow the light or dark theme. Values
such as `none`, `transparent`, CSS variables, and gradient references are preserved.

`tabBarIconFillOnFocus` continues to work globally or per custom tab: inactive SVG and named icons
render as outlines, while focused icons use the active tint as their fill. Highlighted tabs continue
to use the current theme's `primary` background and `surface` icon color.

Raster images retain their original colors and are not tinted. Use `themeImages.light` and
`themeImages.dark` inside a custom tab to provide mode-specific raster assets. Each mode accepts an
optional `icon` and `activeIcon`. A mode-specific value overrides its root counterpart. When a mode
defines `icon` but omits `activeIcon`, that mode's `icon` is also used while focused instead of
falling back to an active image from another mode. See
[Themed tabNavigation static content](./accessibility-settings.md#themed-tabnavigation-static-content)
for per-theme tab bar color configuration.

## Remote image example

```json
{
  "accessibilityLabel": "Home",
  "activeIcon": "https://example.org/icons/home-active.png",
  "icon": "https://example.org/icons/home.png",
  "iconSize": 28,
  "label": "Home",
  "params": {},
  "screen": "Home",
  "themeImages": {
    "dark": {
      "activeIcon": "https://example.org/icons/home-active-dark.png",
      "icon": "https://example.org/icons/home-dark.png"
    }
  }
}
```

## Remote SVG example

```json
{
  "accessibilityLabel": "Services",
  "activeSvg": "services-active",
  "iconSize": 28,
  "label": "Services",
  "params": {},
  "screen": "Service",
  "svg": "services"
}
```

The SVG example resolves to `<svgFolderUrl>/services.svg` and
`<svgFolderUrl>/services-active.svg`. A complete HTTP(S) URL can be used instead.

## Full themed configuration example

```json
{
  "activeTintColor": "#005A8D",
  "inactiveTintColor": "#666666",
  "activeBackgroundColor": "#FFFFFF",
  "inactiveBackgroundColor": "#FFFFFF",
  "tabBarIconFillOnFocus": true,
  "themeColors": {
    "dark": {
      "activeTintColor": "#8AD996",
      "inactiveTintColor": "#F5F5F5",
      "activeBackgroundColor": "#1E1E1E",
      "inactiveBackgroundColor": "#1E1E1E"
    }
  },
  "tabConfigs": [
    "Home",
    {
      "accessibilityLabel": "Profile",
      "activeIcon": "https://example.org/icons/profile-active.png",
      "icon": "https://example.org/icons/profile.png",
      "iconSize": 28,
      "label": "Profile",
      "screen": "Profile",
      "themeImages": {
        "dark": {
          "activeIcon": "https://example.org/icons/profile-active-dark.png",
          "icon": "https://example.org/icons/profile-dark.png"
        }
      }
    }
  ]
}
```
