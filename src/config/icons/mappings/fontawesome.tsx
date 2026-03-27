/**
 * FontAwesome Icons Mapping
 * Maps unified icon names to FontAwesome icon names
 */

export const fontawesomeIconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'ellipsis-v',
  'arrow-down': 'arrow-down',
  'arrow-down-circle': 'arrow-circle-down',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  close: 'times',
  'close-circle': 'times-circle',
  'close-circle-outline': 'times-circle-o',
  'drawer-menu': 'bars',
  'expand-map': 'expand',
  'condense-map': 'compress',
  plus: 'plus',
  minus: 'minus',

  // Content & Media
  albums: 'picture-o',
  camera: 'camera',
  document: 'file-text',
  'add-image': 'picture-o',

  // Communication
  at: 'at',
  mail: 'envelope',
  phone: 'phone',
  send: 'paper-plane',
  share: 'share-alt',
  copy: 'copy',

  // Status & Feedback
  check: 'check-circle',
  'circle-check-filled': 'check-circle',
  'alert-hexagon-filled': 'exclamation-triangle',
  flag: 'flag',
  ok: 'check',

  // Time & Calendar
  calendar: 'calendar',
  clock: 'clock-o',

  // Location & Map
  gps: 'location-arrow',
  location: 'map-marker',
  'location-active': 'map-marker',
  map: 'map',
  'own-location': 'location-arrow',
  pin: 'thumb-tack',
  'pin-filled': 'thumb-tack',
  'route-planner': 'map',

  // User & Profile
  profile: 'user',
  'profile-filled': 'user',
  member: 'users',

  // Favorites & Social
  'heart-empty': 'heart-o',
  'heart-filled': 'heart',
  like: 'thumbs-up',

  // Home & Building
  home: 'home',
  'home-filled': 'home',
  company: 'building',

  // Settings & Tools
  settings: 'cog',
  'edit-setting': 'cog',
  filter: 'filter',
  search: 'search',
  lupe: 'search',

  // Forms & Input
  pencil: 'pencil',
  'pencil-plus': 'pencil-square',
  pen: 'edit',
  circle: 'circle-o',
  'radio-button-empty': 'circle-o',
  'radio-button-filled': 'dot-circle-o',
  square: 'square-o',
  'square-check-filled': 'check-square',

  // Information
  info: 'info-circle',
  link: 'link',
  url: 'link',
  list: 'list',

  // Media Controls
  play: 'play',
  pause: 'pause',

  // Visibility
  visible: 'eye',
  unvisible: 'eye-slash',

  // Misc
  trash: 'trash',
  service: 'wrench',
  volunteer: 'users',
  surveys: 'bar-chart',
  'keyboard-arrow-up-down': 'arrows-v',

  // Weather & Temperature
  rain: 'cloud',
  'sun-up': 'sun-o',
  'sun-down': 'moon-o',
  'max-temperature': 'thermometer-full',
  'min-temperature': 'thermometer-empty',

  // Special/Custom
  'construction-site': 'wrench',
  'empty-section': 'inbox',
  lunch: 'cutlery',
  voucher: 'ticket',
  logo: 'th',

  // OParl specific
  'oparl-calendar': 'calendar',
  'oparl-organizations': 'building',
  'oparl-people': 'users',

  // Sue specific
  'sue-broom': 'wrench',
  'sue-check-small': 'check',
  'sue-clock': 'clock-o',
  'sue-clock-small': 'clock-o',
  'sue-eye': 'eye',
  'sue-eye-small': 'eye',
  'sue-face': 'smile-o',
  'sue-face-small': 'smile-o',

  // Badges
  'verified-badge': 'certificate',
  'not-verified-badge': 'shield'
};

/**
 * Get FontAwesome icon name from unified name
 * Returns the mapped name if exists, otherwise returns the original name
 */
export const getFontAwesomeIconName = (unifiedName: string): string => {
  return fontawesomeIconMapping[unifiedName.toLowerCase()] || unifiedName;
};
