/**
 * FontAwesome6 Icon Mappings
 * Maps unified icon names to FontAwesome6-specific names
 * Reference: https://fontawesome.com/search
 * Note: Many icon names have been updated from v5 (e.g. times→xmark, home→house)
 */

export const fontawesome6IconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'ellipsis-vertical',
  'arrow-down': 'arrow-down',
  'arrow-down-circle': 'circle-arrow-down',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  close: 'xmark',
  'close-circle': 'circle-xmark',
  'close-circle-outline': 'circle-xmark',
  'drawer-menu': 'bars',
  'expand-map': 'expand',
  'condense-map': 'compress',
  plus: 'plus',
  minus: 'minus',

  // Content & Media
  albums: 'images',
  camera: 'camera',
  document: 'file-lines',
  'add-image': 'plus',

  // Communication
  at: 'at',
  mail: 'envelope',
  phone: 'phone',
  send: 'paper-plane',
  share: 'share-nodes',
  copy: 'copy',

  // Status & Feedback
  check: 'circle-check',
  'circle-check-filled': 'circle-check',
  'alert-hexagon-filled': 'triangle-exclamation',
  flag: 'flag',
  ok: 'check',

  // Time & Calendar
  calendar: 'calendar-days',
  clock: 'clock',

  // Location & Map
  gps: 'location-arrow',
  location: 'location-dot',
  'location-active': 'location-dot',
  map: 'map',
  'own-location': 'person',
  pin: 'thumbtack',
  'pin-filled': 'thumbtack',
  'route-planner': 'route',

  // User & Profile
  profile: 'user',
  'profile-filled': 'circle-user',
  member: 'users',

  // Favorites & Social
  'heart-empty': 'heart',
  'heart-filled': 'heart',
  like: 'thumbs-up',

  // Home & Building
  home: 'house',
  'home-filled': 'house',
  company: 'briefcase',

  // Settings & Tools
  settings: 'gear',
  'edit-setting': 'gear',
  filter: 'filter',
  search: 'magnifying-glass',
  lupe: 'magnifying-glass',

  // Forms & Input
  pencil: 'pencil',
  'pencil-plus': 'plus',
  pen: 'pen',
  circle: 'circle',
  'radio-button-empty': 'circle',
  'radio-button-filled': 'circle-dot',
  square: 'square',
  'square-check-filled': 'square-check',

  // Information
  info: 'circle-info',
  link: 'link',
  url: 'link',
  list: 'list',

  // Media Controls
  play: 'circle-play',
  pause: 'circle-pause',

  // Visibility
  visible: 'eye',
  unvisible: 'eye-slash',

  // Misc
  trash: 'trash-can',
  service: 'screwdriver-wrench',
  volunteer: 'users',
  surveys: 'chart-column',
  'keyboard-arrow-up-down': 'arrows-up-down',

  // Weather & Temperature
  rain: 'cloud-rain',
  'sun-up': 'sun',
  'sun-down': 'sun',
  'max-temperature': 'temperature-full',
  'min-temperature': 'temperature-empty',

  // Special/Custom
  'construction-site': 'triangle-exclamation',
  'empty-section': 'box',
  lunch: 'utensils',
  voucher: 'ticket',
  logo: 'certificate',

  // OParl specific
  'oparl-calendar': 'calendar-days',
  'oparl-organizations': 'building',
  'oparl-people': 'users',

  // Sue specific
  'sue-broom': 'broom',
  'sue-check-small': 'check',
  'sue-clock': 'clock',
  'sue-clock-small': 'clock',
  'sue-eye': 'eye',
  'sue-eye-small': 'eye',
  'sue-face': 'face-smile',
  'sue-face-small': 'face-smile',

  // Badges
  'verified-badge': 'certificate',
  'not-verified-badge': 'certificate'
};

/**
 * Get FontAwesome6 icon name from unified name
 * Returns the mapped name if it exists, otherwise returns the original name
 * This allows using any FontAwesome6 icon, even if not explicitly mapped
 */
export const getFontAwesome6IconName = (name: string): string => {
  const lowerName = name.toLowerCase();
  return fontawesome6IconMapping[lowerName] || name;
};
