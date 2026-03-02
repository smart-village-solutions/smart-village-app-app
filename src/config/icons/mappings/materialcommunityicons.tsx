/**
 * MaterialCommunityIcons Mapping
 * Maps unified icon names to MaterialCommunityIcons icon names
 * Note: This is the largest icon library with 7000+ icons
 */

export const materialcommunityiconsIconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'dots-vertical',
  'arrow-down': 'arrow-down',
  'arrow-down-circle': 'arrow-down-circle',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  close: 'close',
  'close-circle': 'close-circle',
  'close-circle-outline': 'close-circle-outline',
  'drawer-menu': 'menu',
  'expand-map': 'fullscreen',
  'condense-map': 'fullscreen-exit',
  plus: 'plus',
  minus: 'minus',

  // Content & Media
  albums: 'album',
  camera: 'camera',
  document: 'file-document',
  'add-image': 'image-plus',

  // Communication
  at: 'at',
  mail: 'email',
  phone: 'phone',
  send: 'send',
  share: 'share-variant',
  copy: 'content-copy',

  // Status & Feedback
  check: 'check-circle',
  'circle-check-filled': 'check-circle',
  'alert-hexagon-filled': 'alert',
  flag: 'flag',
  ok: 'check',

  // Time & Calendar
  calendar: 'calendar',
  clock: 'clock',

  // Location & Map
  gps: 'crosshairs-gps',
  location: 'map-marker',
  'location-active': 'map-marker',
  map: 'map',
  'own-location': 'crosshairs-gps',
  pin: 'pin',
  'pin-filled': 'pin',
  'route-planner': 'routes',

  // User & Profile
  profile: 'account',
  'profile-filled': 'account',
  member: 'account-group',

  // Favorites & Social
  'heart-empty': 'heart-outline',
  'heart-filled': 'heart',
  like: 'thumb-up',

  // Home & Building
  home: 'home',
  'home-filled': 'home',
  company: 'office-building',

  // Settings & Tools
  settings: 'cog',
  'edit-setting': 'cog',
  filter: 'filter',
  search: 'magnify',
  lupe: 'magnify',

  // Forms & Input
  pencil: 'pencil',
  'pencil-plus': 'pencil-plus',
  pen: 'pen',
  circle: 'circle-outline',
  'radio-button-empty': 'radiobox-blank',
  'radio-button-filled': 'radiobox-marked',
  square: 'checkbox-blank-outline',
  'square-check-filled': 'checkbox-marked',

  // Information
  info: 'information',
  link: 'link',
  url: 'link',
  list: 'format-list-bulleted',

  // Media Controls
  play: 'play',
  pause: 'pause',

  // Visibility
  visible: 'eye',
  unvisible: 'eye-off',

  // Misc
  trash: 'delete',
  service: 'tools',
  volunteer: 'account-group',
  surveys: 'chart-bar',
  'keyboard-arrow-up-down': 'unfold-more-horizontal',

  // Weather & Temperature
  rain: 'weather-rainy',
  'sun-up': 'weather-sunset-up',
  'sun-down': 'weather-sunset-down',
  'max-temperature': 'thermometer-high',
  'min-temperature': 'thermometer-low',

  // Special/Custom
  'construction-site': 'hammer-wrench',
  'empty-section': 'inbox',
  lunch: 'food',
  voucher: 'ticket',
  logo: 'view-grid',

  // OParl specific
  'oparl-calendar': 'calendar',
  'oparl-organizations': 'office-building',
  'oparl-people': 'account-group',

  // Sue specific
  'sue-broom': 'broom',
  'sue-check-small': 'check',
  'sue-clock': 'clock',
  'sue-clock-small': 'clock-outline',
  'sue-eye': 'eye',
  'sue-eye-small': 'eye-outline',
  'sue-face': 'emoticon',
  'sue-face-small': 'emoticon-outline',

  // Badges
  'verified-badge': 'check-decagram',
  'not-verified-badge': 'alert-decagram'
};

/**
 * Get MaterialCommunityIcons icon name from unified name
 * Returns the mapped name if exists, otherwise returns the original name
 */
export const getMaterialCommunityIconsIconName = (unifiedName: string): string => {
  return materialcommunityiconsIconMapping[unifiedName.toLowerCase()] || unifiedName;
};
