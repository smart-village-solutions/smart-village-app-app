/**
 * Tabler Icons Mapping
 * Maps unified icon names to Tabler icon names
 */

export const tablerIconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'dots-vertical',
  'arrow-down': 'arrow-down',
  'arrow-down-circle': 'circle-arrow-down-filled',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-narrow-right',
  'arrow-up': 'arrow-up',
  close: 'x',
  'close-circle': 'circle-x-filled',
  'close-circle-outline': 'circle-x',
  'drawer-menu': 'menu-2',
  'expand-map': 'maximize',
  'condense-map': 'minimize',
  plus: 'plus',
  minus: 'minus',

  // Content & Media
  albums: 'album',
  camera: 'camera',
  document: 'file-description',
  'add-image': 'photo-plus',

  // Communication
  at: 'at',
  mail: 'message-2',
  phone: 'phone',
  send: 'send',
  share: 'share-3',
  copy: 'copy',

  // Status & Feedback
  check: 'circle-check-filled',
  'circle-check-filled': 'circle-check-filled',
  'alert-hexagon-filled': 'alert-hexagon-filled',
  flag: 'flag-2',
  ok: 'check',

  // Time & Calendar
  calendar: 'calendar-event',
  clock: 'clock',

  // Location & Map
  gps: 'current-location',
  location: 'map-pin',
  'location-active': 'map-pin-filled',
  map: 'map',
  'own-location': 'location',
  pin: 'pin',
  'pin-filled': 'pin-filled',
  'route-planner': 'route',

  // User & Profile
  profile: 'user',
  'profile-filled': 'user-filled',
  member: 'users',

  // Favorites & Social
  'heart-empty': 'heart',
  'heart-filled': 'heart-filled',
  like: 'thumb-up',

  // Home & Building
  home: 'home-2',
  'home-filled': 'home-filled',
  company: 'briefcase',

  // Settings & Tools
  settings: 'settings',
  'edit-setting': 'settings',
  filter: 'filter',
  search: 'search',
  lupe: 'search',

  // Forms & Input
  pencil: 'pencil',
  'pencil-plus': 'pencil-plus',
  pen: 'edit',
  circle: 'circle',
  'radio-button-empty': 'circle',
  'radio-button-filled': 'circle-filled',
  square: 'square',
  'square-check-filled': 'square-check-filled',

  // Information
  info: 'info-circle',
  link: 'link',
  url: 'link',
  list: 'list',

  // Media Controls
  play: 'player-play-filled',
  pause: 'player-pause',

  // Visibility
  visible: 'eye',
  unvisible: 'eye-off',

  // Misc
  trash: 'trash',
  service: 'tool',
  volunteer: 'users-group',
  surveys: 'chart-candle',
  'keyboard-arrow-up-down': 'arrows-vertical',

  // Weather & Temperature
  rain: 'cloud-rain',
  'sun-up': 'sunrise',
  'sun-down': 'sunset',
  'max-temperature': 'temperature-plus',
  'min-temperature': 'temperature-minus',

  // Special/Custom (these will use custom SVG)
  'construction-site': 'construction',
  'empty-section': 'box',
  lunch: 'tool-kitchen',
  voucher: 'receipt',
  logo: 'brand-tabler',

  // OParl specific
  'oparl-calendar': 'calendar-event',
  'oparl-organizations': 'building',
  'oparl-people': 'users',

  // Sue specific
  'sue-broom': 'broom',
  'sue-check-small': 'check',
  'sue-clock': 'clock',
  'sue-clock-small': 'clock',
  'sue-eye': 'eye',
  'sue-eye-small': 'eye',
  'sue-face': 'mood-smile',
  'sue-face-small': 'mood-smile',

  // Badges
  'verified-badge': 'rosette-discount-check',
  'not-verified-badge': 'rosette'
};

/**
 * Get Tabler icon name from unified name
 * Returns the mapped name if exists, otherwise returns the original name
 */
export const getTablerIconName = (unifiedName: string): string => {
  return tablerIconMapping[unifiedName.toLowerCase()] || unifiedName;
};
