/**
 * Ionicons Mapping
 * Maps unified icon names to Ionicons icon names
 */

export const ioniconsIconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'ellipsis-vertical',
  'arrow-down': 'arrow-down',
  'arrow-down-circle': 'arrow-down-circle',
  'arrow-left': 'arrow-back',
  'arrow-right': 'arrow-forward',
  'arrow-up': 'arrow-up',
  close: 'close',
  'close-circle': 'close-circle',
  'close-circle-outline': 'close-circle-outline',
  'drawer-menu': 'menu',
  'expand-map': 'expand',
  'condense-map': 'contract',
  plus: 'add',
  minus: 'remove',

  // Content & Media
  albums: 'albums',
  camera: 'camera',
  document: 'document-text',
  'add-image': 'image',

  // Communication
  at: 'at',
  mail: 'mail',
  phone: 'call',
  send: 'send',
  share: 'share-social',
  copy: 'copy',

  // Status & Feedback
  check: 'checkmark-circle',
  'circle-check-filled': 'checkmark-circle',
  'alert-hexagon-filled': 'warning',
  flag: 'flag',
  ok: 'checkmark',

  // Time & Calendar
  calendar: 'calendar',
  clock: 'time',

  // Location & Map
  gps: 'navigate',
  location: 'location',
  'location-active': 'location',
  map: 'map',
  'own-location': 'locate',
  pin: 'pin',
  'pin-filled': 'pin',
  'route-planner': 'map',

  // User & Profile
  profile: 'person',
  'profile-filled': 'person',
  member: 'people',

  // Favorites & Social
  'heart-empty': 'heart-outline',
  'heart-filled': 'heart',
  like: 'thumbs-up',

  // Home & Building
  home: 'home',
  'home-filled': 'home',
  company: 'business',

  // Settings & Tools
  settings: 'settings',
  'edit-setting': 'settings',
  filter: 'filter',
  search: 'search',
  lupe: 'search',

  // Forms & Input
  pencil: 'pencil',
  'pencil-plus': 'create',
  pen: 'create',
  circle: 'ellipse-outline',
  'radio-button-empty': 'radio-button-off',
  'radio-button-filled': 'radio-button-on',
  square: 'square-outline',
  'square-check-filled': 'checkbox',

  // Information
  info: 'information-circle',
  link: 'link',
  url: 'link',
  list: 'list',

  // Media Controls
  play: 'play',
  pause: 'pause',

  // Visibility
  visible: 'eye',
  unvisible: 'eye-off',

  // Misc
  trash: 'trash',
  service: 'build',
  volunteer: 'people',
  surveys: 'stats-chart',
  'keyboard-arrow-up-down': 'swap-vertical',

  // Weather & Temperature
  rain: 'rainy',
  'sun-up': 'partly-sunny',
  'sun-down': 'moon',
  'max-temperature': 'thermometer',
  'min-temperature': 'thermometer',

  // Special/Custom (fallback to closest match)
  'construction-site': 'construct',
  'empty-section': 'cube-outline',
  lunch: 'restaurant',
  voucher: 'receipt',
  logo: 'apps',

  // OParl specific
  'oparl-calendar': 'calendar',
  'oparl-organizations': 'business',
  'oparl-people': 'people',

  // Sue specific
  'sue-broom': 'build',
  'sue-check-small': 'checkmark',
  'sue-clock': 'time',
  'sue-clock-small': 'time',
  'sue-eye': 'eye',
  'sue-eye-small': 'eye',
  'sue-face': 'happy',
  'sue-face-small': 'happy',

  // Badges
  'verified-badge': 'shield-checkmark',
  'not-verified-badge': 'shield'
};

/**
 * Get Ionicons icon name from unified name
 * Returns the mapped name if exists, otherwise returns the original name
 */
export const getIoniconsIconName = (unifiedName: string): string => {
  return ioniconsIconMapping[unifiedName.toLowerCase()] || unifiedName;
};
