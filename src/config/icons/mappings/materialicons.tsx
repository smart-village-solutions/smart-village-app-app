/**
 * MaterialIcons Mapping
 * Maps unified icon names to MaterialIcons icon names
 */

export const materialiconsIconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'more-vert',
  'arrow-down': 'arrow-downward',
  'arrow-down-circle': 'arrow-circle-down',
  'arrow-left': 'arrow-back',
  'arrow-right': 'arrow-forward',
  'arrow-up': 'arrow-upward',
  close: 'close',
  'close-circle': 'cancel',
  'close-circle-outline': 'highlight-off',
  'drawer-menu': 'menu',
  'expand-map': 'fullscreen',
  'condense-map': 'fullscreen-exit',
  plus: 'add',
  minus: 'remove',

  // Content & Media
  albums: 'collections',
  camera: 'photo-camera',
  document: 'description',
  'add-image': 'add-photo-alternate',

  // Communication
  at: 'alternate-email',
  mail: 'email',
  phone: 'phone',
  send: 'send',
  share: 'share',
  copy: 'content-copy',

  // Status & Feedback
  check: 'check-circle',
  'circle-check-filled': 'check-circle',
  'alert-hexagon-filled': 'warning',
  flag: 'flag',
  ok: 'check',

  // Time & Calendar
  calendar: 'event',
  clock: 'access-time',

  // Location & Map
  gps: 'gps-fixed',
  location: 'location-on',
  'location-active': 'location-on',
  map: 'map',
  'own-location': 'my-location',
  pin: 'place',
  'pin-filled': 'place',
  'route-planner': 'directions',

  // User & Profile
  profile: 'person',
  'profile-filled': 'person',
  member: 'people',

  // Favorites & Social
  'heart-empty': 'favorite-border',
  'heart-filled': 'favorite',
  like: 'thumb-up',

  // Home & Building
  home: 'home',
  'home-filled': 'home',
  company: 'business',

  // Settings & Tools
  settings: 'settings',
  'edit-setting': 'settings',
  filter: 'filter-list',
  search: 'search',
  lupe: 'search',

  // Forms & Input
  pencil: 'edit',
  'pencil-plus': 'edit',
  pen: 'create',
  circle: 'radio-button-unchecked',
  'radio-button-empty': 'radio-button-unchecked',
  'radio-button-filled': 'radio-button-checked',
  square: 'check-box-outline-blank',
  'square-check-filled': 'check-box',

  // Information
  info: 'info',
  link: 'link',
  url: 'link',
  list: 'list',

  // Media Controls
  play: 'play-arrow',
  pause: 'pause',

  // Visibility
  visible: 'visibility',
  unvisible: 'visibility-off',

  // Misc
  trash: 'delete',
  service: 'build',
  volunteer: 'people',
  surveys: 'bar-chart',
  'keyboard-arrow-up-down': 'unfold-more',

  // Weather & Temperature
  rain: 'cloud',
  'sun-up': 'wb-sunny',
  'sun-down': 'brightness-3',
  'max-temperature': 'thermostat',
  'min-temperature': 'thermostat',

  // Special/Custom
  'construction-site': 'construction',
  'empty-section': 'inbox',
  lunch: 'restaurant',
  voucher: 'local-offer',
  logo: 'apps',

  // OParl specific
  'oparl-calendar': 'event',
  'oparl-organizations': 'business',
  'oparl-people': 'people',

  // Sue specific
  'sue-broom': 'cleaning-services',
  'sue-check-small': 'check',
  'sue-clock': 'schedule',
  'sue-clock-small': 'schedule',
  'sue-eye': 'visibility',
  'sue-eye-small': 'visibility',
  'sue-face': 'sentiment-satisfied',
  'sue-face-small': 'sentiment-satisfied',

  // Badges
  'verified-badge': 'verified',
  'not-verified-badge': 'new-releases'
};

/**
 * Get MaterialIcons icon name from unified name
 * Returns the mapped name if exists, otherwise returns the original name
 */
export const getMaterialIconsIconName = (unifiedName: string): string => {
  return materialiconsIconMapping[unifiedName.toLowerCase()] || unifiedName;
};
