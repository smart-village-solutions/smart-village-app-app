/**
 * SimpleLineIcons Mappings
 * Maps unified icon names to SimpleLineIcons-specific names
 * Reference: http://simplelineicons.com/
 */

export const simplelineiconsIconMapping: Record<string, string> = {
  // Navigation & Actions
  about: 'options-vertical',
  'arrow-down': 'arrow-down',
  'arrow-down-circle': 'arrow-down-circle',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'arrow-up': 'arrow-up',
  close: 'close',
  'close-circle': 'close',
  'close-circle-outline': 'close',
  'drawer-menu': 'menu',
  'expand-map': 'size-fullscreen',
  'condense-map': 'size-actual',
  plus: 'plus',
  minus: 'minus',

  // Content & Media
  albums: 'picture',
  camera: 'camera',
  document: 'doc',
  'add-image': 'picture',

  // Communication
  at: 'at',
  mail: 'envelope',
  phone: 'phone',
  send: 'paper-plane',
  share: 'share',
  copy: 'docs',

  // Status & Feedback
  check: 'check',
  'circle-check-filled': 'check',
  'alert-hexagon-filled': 'exclamation',
  flag: 'flag',
  ok: 'check',

  // Time & Calendar
  calendar: 'calendar',
  clock: 'clock',

  // Location & Map
  gps: 'location-pin',
  location: 'location-pin',
  'location-active': 'location-pin',
  map: 'map',
  'own-location': 'direction',
  pin: 'pin',
  'pin-filled': 'pin',
  'route-planner': 'direction',

  // User & Profile
  profile: 'user',
  'profile-filled': 'user',
  member: 'people',

  // Favorites & Social
  'heart-empty': 'heart',
  'heart-filled': 'heart',
  like: 'like',

  // Home & Building
  home: 'home',
  'home-filled': 'home',
  company: 'briefcase',

  // Settings & Tools
  settings: 'settings',
  'edit-setting': 'settings',
  filter: 'equalizer',
  search: 'magnifier',
  lupe: 'magnifier',

  // Forms & Input
  pencil: 'pencil',
  'pencil-plus': 'plus',
  pen: 'pencil',
  circle: 'minus',
  'radio-button-empty': 'check',
  'radio-button-filled': 'check',
  square: 'frame',
  'square-check-filled': 'check',

  // Information
  info: 'info',
  link: 'link',
  url: 'link',
  list: 'list',

  // Media Controls
  play: 'control-play',
  pause: 'control-pause',

  // Visibility
  visible: 'eye',
  unvisible: 'eye',

  // Misc
  trash: 'trash',
  service: 'wrench',
  volunteer: 'people',
  surveys: 'graph',
  'keyboard-arrow-up-down': 'arrow-up',

  // Weather & Temperature
  rain: 'umbrella',
  'sun-up': 'emotsmile',
  'sun-down': 'emotsmile',
  'max-temperature': 'fire',
  'min-temperature': 'drop',

  // Special/Custom
  'construction-site': 'exclamation',
  'empty-section': 'drawer',
  lunch: 'cup',
  voucher: 'tag',
  logo: 'badge',

  // OParl specific
  'oparl-calendar': 'calendar',
  'oparl-organizations': 'organization',
  'oparl-people': 'people',

  // Sue specific
  'sue-broom': 'magic-wand',
  'sue-check-small': 'check',
  'sue-clock': 'clock',
  'sue-clock-small': 'clock',
  'sue-eye': 'eye',
  'sue-eye-small': 'eye',
  'sue-face': 'emotsmile',
  'sue-face-small': 'emotsmile',

  // Badges
  'verified-badge': 'badge',
  'not-verified-badge': 'badge'
};

/**
 * Get SimpleLineIcons icon name from unified name
 * Returns the mapped name if it exists, otherwise returns the original name
 * This allows using any SimpleLineIcons icon, even if not explicitly mapped
 */
export const getSimpleLineIconsIconName = (name: string): string => {
  const lowerName = name.toLowerCase();
  return simplelineiconsIconMapping[lowerName] || name;
};
