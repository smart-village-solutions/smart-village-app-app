/**
 * Custom SVG Icons Mapping
 * Maps unified icon names to custom SVG functions
 */

import {
  addImage,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  calendarToggle,
  close,
  constructionSite,
  drawerMenu,
  editSetting,
  emptySection,
  filter,
  gps,
  homeFilled,
  info,
  keyboardArrowUpDown,
  like,
  link,
  list,
  location,
  locationActive,
  logo,
  lunch,
  lupe,
  maxTemperature,
  member,
  minTemperature,
  notVerifiedBadge,
  ok,
  oParlCalendar,
  oParlOrganizations,
  oParlPeople,
  ownLocation,
  pen,
  rain,
  routePlanner,
  send,
  service,
  sueBroom,
  sueCheckSmall,
  sueClock,
  sueClockSmall,
  sueEye,
  sueEyeSmall,
  sueFace,
  sueFaceSmall,
  sunDown,
  sunUp,
  unvisible,
  userFilled,
  verifiedBadge,
  visible,
  voucher
} from '../../../icons';

type SvgFunction = (color: string, strokeColor: string, strokeWidth: number) => string;

export const customSvgIconMapping: Record<string, SvgFunction> = {
  'add-image': addImage,
  'arrow-down': arrowDown,
  'arrow-left': arrowLeft,
  'arrow-right': arrowRight,
  'arrow-up': arrowUp,
  'calendar-toggle': calendarToggle,
  close,
  'construction-site': constructionSite,
  'drawer-menu': drawerMenu,
  'edit-setting': editSetting,
  'empty-section': emptySection,
  filter,
  gps,
  'home-filled': homeFilled,
  info,
  'keyboard-arrow-up-down': keyboardArrowUpDown,
  like,
  link,
  list,
  location,
  'location-active': locationActive,
  logo,
  lunch,
  lupe,
  'max-temperature': maxTemperature,
  member,
  'min-temperature': minTemperature,
  'not-verified-badge': notVerifiedBadge,
  ok,
  'oparl-calendar': oParlCalendar,
  'oparl-organizations': oParlOrganizations,
  'oparl-people': oParlPeople,
  'own-location': ownLocation,
  pen,
  rain,
  'route-planner': routePlanner,
  send,
  service,
  'sue-broom': sueBroom,
  'sue-check-small': sueCheckSmall,
  'sue-clock': sueClock,
  'sue-clock-small': sueClockSmall,
  'sue-eye': sueEye,
  'sue-eye-small': sueEyeSmall,
  'sue-face': sueFace,
  'sue-face-small': sueFaceSmall,
  'sun-down': sunDown,
  'sun-up': sunUp,
  unvisible,
  'user-filled': userFilled,
  'profile-filled': userFilled, // alias
  'verified-badge': verifiedBadge,
  visible,
  voucher
};

/**
 * Check if a custom SVG icon exists
 */
export const customSvgIconExists = (unifiedName: string): boolean => {
  return unifiedName.toLowerCase() in customSvgIconMapping;
};

/**
 * Get custom SVG icon function
 */
export const getCustomSvgIcon = (unifiedName: string): SvgFunction | undefined => {
  return customSvgIconMapping[unifiedName.toLowerCase()];
};
