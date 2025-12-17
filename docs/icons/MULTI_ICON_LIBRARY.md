# Multi-Icon-Library System

This system enables the use of multiple icon libraries simultaneously in the Smart Village App.

## Features

✅ **Multi-Library Support**: Support for multiple icon libraries (Tabler, Ionicons, FontAwesome, MaterialIcons, etc.)  
✅ **Unified Naming**: Single naming convention across all libraries  
✅ **Smart Fallback**: Automatic fallback to other libraries when icon is not found  
✅ **Custom SVG Support**: Custom SVG icons are always supported with highest priority  
✅ **Server-Side Configuration**: Library control via GlobalSettings  
✅ **Per-Icon Library Override**: Ability to specify custom library for individual icons

## Configuration

### Configuration via GlobalSettings

You can configure icon libraries through globalSettings from the main server:

```json
{
  "settings": {
    "icon": "tabler"
  }
}
```

Or multiple libraries with priority order:

```json
{
  "settings": {
    "icon": ["tabler", "ionicons", "fontawesome"]
  }
}
```

### Default Settings

If `icon` is not defined in globalSettings, the following default order is used:

```typescript
['tabler', 'ionicons'];
```

## Usage

### 1. Direct Icon Components

```typescript
import { Icon } from './config/icons/Icon';

// Direct usage - follows globalSettings priority order
<Icon.Albums size={24} color="blue" />
<Icon.Calendar size={32} />
```

### 2. Named Icon with Custom Library

```typescript
import { Icon } from './config/icons/Icon';

// Use icon from specific library
<Icon.NamedIcon
  name="calendar"
  iconSet="ionicons"  // Get this icon only from Ionicons
  size={24}
/>

<Icon.NamedIcon
  name="heart"
  iconSet="fontawesome"  // Get this icon from FontAwesome
  size={24}
/>
```

### 3. ServiceTiles Configuration

```json
{
  "title": "Vouchers",
  "accessibilityLabel": "Vouchers",
  "routeName": "VoucherHome",
  "iconName": "albums", // Unified icon name
  "iconSet": "ionicons", // Optional: specific library
  "params": {
    "headerImage": "..."
  }
}
```

If `iconSet` is not specified, the icon is searched according to globalSettings priority order.

## Icon Mapping System

### Mappings are Optional!

**Important:** You no longer need to add every icon to the mapping! Mappings are only used for cross-library compatibility.

- **With mapping**: Ensures naming consistency (e.g., `calendar` → `calendar-event` in Tabler, `calendar` in Ionicons)
- **Without mapping**: Icon name is used directly (e.g., `basket` → directly `basket` in Ionicons)

This allows you to:
✅ Use any icon from any library
✅ Use new icons without adding them to mappings
✅ Only add mappings for icons you want to standardize across libraries

### Example Usage

```typescript
// WITH mapping - cross-library compatible
<Icon.NamedIcon name="calendar" size={24} />
// Tabler: 'calendar-event', Ionicons: 'calendar'

// WITHOUT mapping - direct name usage
<Icon.NamedIcon name="basket" iconSet="ionicons" size={24} />
// Ionicons: shows 'basket' icon directly

// Library-specific icon (works even without mapping)
<Icon.NamedIcon name="brand-github" iconSet="tabler" size={24} />
```

Separate mapping files exist for each library:

```
src/config/icons/mappings/
├── index.tsx              # Central export
├── tabler.tsx             # Tabler icons mapping
├── ionicons.tsx           # Ionicons mapping
├── fontawesome5.tsx       # FontAwesome 5 mapping
├── fontawesome6.tsx       # FontAwesome 6 mapping
├── simplelineicons.tsx    # Simple Line Icons mapping
└── customSvg.tsx          # Custom SVG icons
```

### Adding Mappings (Optional)

Mappings are **only** needed for cross-library compatibility. If you're using an icon in only one library, you don't need to add a mapping!

#### When Should You Add Mappings?

✅ **Yes, add** - When you want to use the icon across multiple libraries with different names:

```typescript
// calendar → 'calendar-event' in Tabler, 'calendar' in Ionicons
calendar: 'calendar-event'; // tabler.tsx
calendar: 'calendar'; // ionicons.tsx
```

❌ **No, don't add** - When you're using the icon in only one specific library:

```typescript
// Use directly, don't add to mapping!
<Icon.NamedIcon name="basket" iconSet="ionicons" />
```

#### How to Add Mappings?

1. Define a **unified name** (e.g., `calendar`)
2. Map this name to each library's specific name in their mapping files:

**tabler.tsx:**
calendar-event in Tabler
// ...
};

````

**ionicons.tsx:**

```typescript
export const ioniconsIconMapping: Record<string, string> = {
  calendar: 'calendar' // calendar in Ionicons
  // ...
};
````

3. Expose it in Icon.tsx for usage

````

3. Icon.tsx'te kullanıma sunun:

```typescript
export const Icon = {
  Calendar: (props: IconProps) => <NamedIcon name="calendar" {...props} />
  // ...
};Priority Order

1. **Custom SVG** - If a custom SVG exists, it always has the highest priority
2. **Specified iconSet** - If the `iconSet` prop is provided, that library is tried first
3. **GlobalSettings order** - Follow the order in `globalSettings.settings.icon` array
4. **Question Mark Fallback** - If icon is not found anywhere, show Tabler Question Mark icon

## Example Scenarios

### Scenario 1: Tabler Only

```json
// globalSettings
{ "settings": { "icon": "tabler" } }
````

All icons come from Tabler (except custom SVGs).

### Scenario 2: Tabler Primary, Ionicons Fallback

```json
// globalSettings
{ "settings": { "icon": ["tabler", "ionicons"] } }
```

Search in Tabler first, fallback to Ionicons if not found.

### Scenario 3: Custom Library in ServiceTiles

```json
{
  "iconName": "heart",
  "iconSet": "fontawesome" // Use only FontAwesome for this tile
}
```

### Scenario 4: Custom SVG

```typescript
// Custom SVG always overrides library icons
<Icon.Logo /> // Always shows custom SVG logo
```

## Adding a New Library

1. Add to the `IconLibrary` type in `IconProvider.tsx`

## Yeni Kütüphane Ekleme

1. `IconProvider.tsx`'teki `IconLibrary` type'ına enewlibrary'; // ← NEW

````

2. Add a new file to the `mappings/` directory:

```typescript
// mappings/newlibrary.tsx
export const newlibraryIconMapping: Record<string, string> = {
  calendar: 'cal'
  // ...
};
````

3. Add to `mappings/index.tsx`

````

3. `mappings/index.tsx`'e ekleyin:

```typescript
exnewlibrary: newlibraryIconMapping // ← NEW
};

export const getMappedIconName = (unifiedName: string, library: IconLibrary) => {
  switch (library) {
    case 'newlibrary':
      return getNewLibraryIconName(unifiedName); // ← NEW
    // ...
  }
};
````

4. Add to `getIconComponentFromLibrary` in `Icon.tsx`:

```typescript
case 'newlibrary': {
  return { Component: NewLibraryIcon, name: iconName };
}
```

## Supported Libraries

The system currently supports these icon libraries:

- **Tabler Icons** (default)
- **Ionicons**
- **AntDesign**
- **Entypo**
- \*\*Feaing

Run the existing tests:

```bash
yarn test src/config/icons/__tests__/
```

## Best Practices

1. **Use unified names** when possible for cross-library compatibility
2. **Specify iconSet** only when you need a specific library's icon variant
3. **Add mappings** only for icons used across multiple libraries
4. **Custom SVGs** should be used for brand-specific or unique icons
5. **Keep mappings focused** on app-specific icons rather than adding every possible icon

## Migration Guide

### From Single Library (Tabler only)

If you're migrating from a Tabler-only setup:

1. No code changes needed - Tabler remains the default
2. Add additional libraries to globalSettings if desired
3. Existing icon names will continue to work
4. Gradually adopt unified naming for new features

### From Custom Icon Systems

If you have a custom icon system:

1. Map your icon names in `customSvg.tsx`
2. Update `Icon.tsx` to export your custom icons
3. Custom SVGs will always take priority
4. Library icons serve as automatic fallbacks
