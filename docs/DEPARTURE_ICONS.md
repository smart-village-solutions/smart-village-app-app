# Configure departure icons

Set `settings.icons.routeTypes` in the instance's `globalSettings` JSON. Keep any other entries in `settings.icons` and set `svgFolderUrl` to the directory containing the SVG files.

```json
{
  "settings": {
    "icons": {
      "svgFolderUrl": "https://example.com/icons",
      "routeTypes": {
        "700": { "icon": "bus", "label": "Bus", "color": "#265BA4" },
        "100": { "icon": "train", "label": "Bahn", "color": "#52267D" },
        "106": { "icon": "train", "label": "Bahn", "color": "#52267D" },
        "109": { "icon": "train", "label": "Bahn", "color": "#52267D" },
        "900": { "icon": "tram", "label": "Straßenbahn", "color": "#D02E26" }
      }
    }
  }
}
```

Each key is the GTFS `routeType` returned by the server. `icon` is the filename without `.svg` or a complete SVG URL. `label` is the text before the line number. `color` is the background color of the symbol and line label. The fields can be set independently. Standard types `0`–`3` keep their existing defaults for omitted fields. An unconfigured type displays its line number.
