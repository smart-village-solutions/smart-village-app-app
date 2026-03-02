/**
 * FontAwesome5 Icon Mappings
 * Maps unified icon names to FontAwesome5-specific names
 * Reference: https://fontawesome.com/v5/search
 */

export const fontawesome5IconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'bars',
  'arrow-down': 'arrow-down',
  'arrow-down-circle': 'arrow-circle-down',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  close: 'times',
  'close-circle': 'times-circle',
  'close-circle-outline': 'times-circle',
  'drawer-menu': 'bars',
  'expand-map': 'expand',
  'condense-map': 'compress',
  plus: 'plus',
  minus: 'minus',

  // Content & Media
  albums: 'images',
  camera: 'camera',
  document: 'file-alt',
  'add-image': 'plus',

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
  calendar: 'calendar-alt',
  clock: 'clock',

  // Location & Map
  gps: 'location-arrow',
  location: 'map-marker-alt',
  'location-active': 'map-marker',
  map: 'map',
  'own-location': 'street-view',
  pin: 'thumbtack',
  'pin-filled': 'thumbtack',
  'route-planner': 'route',

  // User & Profile
  profile: 'user',
  'profile-filled': 'user-circle',
  member: 'users',

  // Favorites & Social
  'heart-empty': 'heart',
  'heart-filled': 'heart',
  like: 'thumbs-up',

  // Home & Building
  home: 'home',
  'home-filled': 'home',
  company: 'briefcase',

  // Settings & Tools
  settings: 'cog',
  'edit-setting': 'cog',
  filter: 'filter',
  search: 'search',
  lupe: 'search',

  // Forms & Input
  pencil: 'pencil-alt',
  'pencil-plus': 'plus',
  pen: 'pen',
  circle: 'circle',
  'radio-button-empty': 'circle',
  'radio-button-filled': 'dot-circle',
  square: 'square',
  'square-check-filled': 'check-square',

  // Information
  info: 'info-circle',
  link: 'link',
  url: 'link',
  list: 'list',

  // Media Controls
  play: 'play-circle',
  pause: 'pause-circle',

  // Visibility
  visible: 'eye',
  unvisible: 'eye-slash',

  // Misc
  trash: 'trash-alt',
  service: 'tools',
  volunteer: 'users',
  surveys: 'chart-bar',
  'keyboard-arrow-up-down': 'arrows-alt-v',

  // Weather & Temperature
  rain: 'cloud-rain',
  'sun-up': 'sun',
  'sun-down': 'sun',
  'max-temperature': 'thermometer-full',
  'min-temperature': 'thermometer-empty',

  // Special/Custom
  'construction-site': 'exclamation-triangle',
  'empty-section': 'box',
  lunch: 'utensils',
  voucher: 'ticket-alt',
  logo: 'certificate',

  // OParl specific
  'oparl-calendar': 'calendar-alt',
  'oparl-organizations': 'building',
  'oparl-people': 'users',

  // Sue specific
  'sue-broom': 'broom',
  'sue-check-small': 'check',
  'sue-clock': 'clock',
  'sue-clock-small': 'clock',
  'sue-eye': 'eye',
  'sue-eye-small': 'eye',
  'sue-face': 'smile',
  'sue-face-small': 'smile',

  // Badges
  'verified-badge': 'certificate',
  'not-verified-badge': 'certificate'
};

/**
 * Get FontAwesome5 icon name from unified name
 * Returns the mapped name if it exists, otherwise returns the original name
 * This allows using any FontAwesome5 icon, even if not explicitly mapped
 */
export const getFontAwesome5IconName = (name: string): string => {
  const lowerName = name.toLowerCase();
  return fontawesome5IconMapping[lowerName] || name;
};
