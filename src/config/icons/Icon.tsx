import * as ExpoVectorIcons from '@expo/vector-icons';
import _camelCase from 'lodash/camelCase';
import _upperFirst from 'lodash/upperFirst';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Tabler from 'tabler-icons-react-native';

import { IconLibrary, useIconLibraries } from '../../IconProvider';
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
} from '../../icons';
import { colors } from '../colors';
import { normalize } from '../normalize';

import { getCustomSvgIcon, getMappedIconName } from './mappings';

export type IconProps = {
  accessibilityLabel?: string;
  color?: string;
  hasNoHitSlop?: boolean;
  iconStyle?: StyleProp<ViewStyle>;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
  iconSet?: IconLibrary; // Optional: specify which library to use
};

export const IconSet = Tabler;

export const getHitSlops = (size: number) => {
  const hitSlop = (normalize(44) - size) / 2;

  return hitSlop > 0
    ? {
        top: hitSlop,
        bottom: hitSlop,
        left: hitSlop,
        right: hitSlop
      }
    : undefined;
};

const SvgIcon = ({
  accessibilityLabel,
  color = colors.primary,
  iconStyle,
  size = normalize(24),
  strokeColor = colors.transparent,
  strokeWidth = 0,
  style,
  xml
}: IconProps & { xml: (color: string, strokeColor: string, strokeWidth: number) => string }) => {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style} hitSlop={getHitSlops(size)}>
      <SvgXml
        xml={xml(color, strokeColor, strokeWidth)}
        width={size}
        height={size}
        style={iconStyle}
      />
    </View>
  );
};

type TablerIconName = keyof typeof Tabler;

/**
 * Get icon component from a specific library
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
const getIconComponentFromLibrary = (
  library: IconLibrary,
  iconName: string
): { Component: React.ComponentType<any>; name: string } | null => {
  switch (library) {
    case 'fontawesome': {
      return { Component: ExpoVectorIcons.FontAwesome, name: iconName };
    }
    case 'fontawesome5': {
      return { Component: ExpoVectorIcons.FontAwesome5, name: iconName };
    }
    case 'fontawesome6': {
      return { Component: ExpoVectorIcons.FontAwesome6, name: iconName };
    }
    case 'ionicons': {
      return { Component: ExpoVectorIcons.Ionicons, name: iconName };
    }
    case 'materialcommunityicons': {
      return { Component: ExpoVectorIcons.MaterialCommunityIcons, name: iconName };
    }
    case 'materialicons': {
      return { Component: ExpoVectorIcons.MaterialIcons, name: iconName };
    }
    case 'simplelineicons': {
      return { Component: ExpoVectorIcons.SimpleLineIcons, name: iconName };
    }
    case 'tabler': {
      const TablerName = ('Icon' + _upperFirst(_camelCase(iconName))) as TablerIconName;
      const Component = Tabler?.[TablerName];

      // Check if Component exists and is actually a component
      return Component && typeof Component === 'function' ? { Component, name: iconName } : null;
    }
    default:
      return null;
  }
};
/* eslint-enable @typescript-eslint/no-explicit-any */
/* eslint-enable complexity */

/**
 * Try to get icon from specified library
 */
const tryGetIconFromLibrary = (
  name: string,
  library: IconLibrary
): {
  Component: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string;
  library: IconLibrary;
} | null => {
  const mappedName = getMappedIconName(name, library);
  const result = getIconComponentFromLibrary(library, mappedName);
  if (!result) return null;

  return { ...result, library };
};

/**
 * Try to get icon from multiple libraries
 */
const tryGetIconFromLibraries = (
  name: string,
  libraries: IconLibrary[]
): {
  Component: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string;
  library: IconLibrary;
} | null => {
  for (const library of libraries) {
    const result = tryGetIconFromLibrary(name, library);
    if (result) return result;
  }
  return null;
};

const NamedIcon = ({
  accessibilityLabel,
  color = colors.primary,
  hasNoHitSlop = false,
  iconStyle,
  iconSet,
  name,
  strokeWidth = 1,
  size = normalize(24),
  style
}: IconProps & {
  name: string;
  strokeWidth?: number;
}) => {
  const { iconLibraries } = useIconLibraries();

  // First, check if there's a custom SVG for this icon (custom SVGs always have priority)
  const customSvg = getCustomSvgIcon(name);

  if (customSvg) {
    return (
      <SvgIcon
        accessibilityLabel={accessibilityLabel}
        color={color}
        iconStyle={iconStyle}
        size={size}
        strokeColor={colors.transparent}
        strokeWidth={0}
        style={style}
        xml={customSvg}
      />
    );
  }

  // Try to get icon from specified iconSet or fallback to configured libraries
  const iconResult = iconSet
    ? tryGetIconFromLibrary(name, iconSet)
    : tryGetIconFromLibraries(name, iconLibraries);

  const IconComponent = iconResult?.Component || Tabler.IconQuestionMark;
  const finalIconName = iconResult?.name || 'question-mark';
  const usedLibrary = iconResult?.library || 'tabler';

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style}
      hitSlop={hasNoHitSlop ? undefined : getHitSlops(size)}
    >
      {usedLibrary === 'tabler' ? (
        <IconComponent
          name={finalIconName}
          size={size}
          color={color}
          style={iconStyle as any} // eslint-disable-line @typescript-eslint/no-explicit-any
          stroke={strokeWidth}
        />
      ) : (
        <IconComponent
          name={finalIconName}
          size={size}
          color={color}
          style={iconStyle as any} // eslint-disable-line @typescript-eslint/no-explicit-any
        />
      )}
    </View>
  );
};

export const Icon = {
  About: (props: IconProps) => <NamedIcon name="about" {...props} />,
  AddImage: (props: IconProps) => <SvgIcon xml={addImage} {...props} />,
  Albums: (props: IconProps) => <NamedIcon name="albums" {...props} />,
  AlertHexagonFilled: (props: IconProps) => <NamedIcon name="alert-hexagon-filled" {...props} />,
  ArrowDown: (props: IconProps) => <SvgIcon xml={arrowDown} {...props} />,
  ArrowDownCircle: (props: IconProps) => <NamedIcon name="arrow-down-circle" {...props} />,
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowRight2: (props: IconProps) => <NamedIcon name="arrow-right" {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  At: (props: IconProps) => <NamedIcon name="at" {...props} />,
  Calendar: (props: IconProps) => <NamedIcon name="calendar" {...props} />,
  CalendarToggle: (props: IconProps) => <SvgIcon xml={calendarToggle} {...props} />,
  Camera: (props: IconProps) => <NamedIcon name="camera" {...props} />,
  Check: (props: IconProps) => <NamedIcon name="check" {...props} />,
  Circle: (props: IconProps) => <NamedIcon name="circle" {...props} />,
  CircleCheckFilled: (props: IconProps) => <NamedIcon name="circle-check-filled" {...props} />,
  Clock: (props: IconProps) => <NamedIcon name="clock" {...props} />,
  Close: (props: IconProps) => <SvgIcon xml={close} {...props} />,
  CloseCircle: (props: IconProps) => <NamedIcon name="close-circle" {...props} />,
  CloseCircleOutline: (props: IconProps) => <NamedIcon name="close-circle-outline" {...props} />,
  Company: (props: IconProps) => <NamedIcon name="company" {...props} />,
  CondenseMap: (props: IconProps) => <NamedIcon name="condense-map" {...props} />,
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  Copy: (props: IconProps) => <NamedIcon name="copy" {...props} />,
  Document: (props: IconProps) => <NamedIcon name="document" {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <SvgIcon xml={editSetting} {...props} />,
  EmptySection: (props: IconProps) => <SvgIcon xml={emptySection} {...props} />,
  ExpandMap: (props: IconProps) => <NamedIcon name="expand-map" {...props} />,
  Flag: (props: IconProps) => <NamedIcon name="flag" {...props} />,
  Filter: (props: IconProps) => <SvgIcon xml={filter} {...props} />,
  GPS: (props: IconProps) => <SvgIcon xml={gps} {...props} />,
  HeartEmpty: (props: IconProps) => <NamedIcon name="heart-empty" {...props} />,
  HeartFilled: (props: IconProps) => <NamedIcon name="heart-filled" {...props} />,
  Home: (props: IconProps) => <NamedIcon name="home" {...props} />,
  HomeFilled: (props: IconProps) => <SvgIcon xml={homeFilled} {...props} />,
  Info: (props: IconProps) => <SvgIcon xml={info} {...props} />,
  KeyboardArrowUpDown: (props: IconProps) => <SvgIcon xml={keyboardArrowUpDown} {...props} />,
  Like: (props: IconProps) => <SvgIcon xml={like} {...props} />,
  Link: (props: IconProps) => <SvgIcon xml={link} {...props} />,
  List: (props: IconProps) => <SvgIcon xml={list} {...props} />,
  Location: (props: IconProps) => <SvgIcon xml={location} {...props} />,
  LocationActive: (props: IconProps) => <SvgIcon xml={locationActive} {...props} />,
  Logo: (props: IconProps) => <SvgIcon xml={logo} {...props} />,
  Lunch: (props: IconProps) => <SvgIcon xml={lunch} {...props} />,
  Lupe: (props: IconProps) => <SvgIcon xml={lupe} {...props} />,
  Mail: (props: IconProps) => <NamedIcon name="mail" {...props} />,
  Map: (props: IconProps) => <NamedIcon name="map" {...props} />,
  MaxTemperature: (props: IconProps) => <SvgIcon xml={maxTemperature} {...props} />,
  Member: (props: IconProps) => <SvgIcon xml={member} {...props} />,
  MinTemperature: (props: IconProps) => <SvgIcon xml={minTemperature} {...props} />,
  NamedIcon,
  NotVerifiedBadge: (props: IconProps) => <SvgIcon xml={notVerifiedBadge} {...props} />,
  Ok: (props: IconProps) => <SvgIcon xml={ok} {...props} />,
  OParlCalendar: (props: IconProps) => <SvgIcon xml={oParlCalendar} {...props} />,
  OParlOrganizations: (props: IconProps) => <SvgIcon xml={oParlOrganizations} {...props} />,
  OParlPeople: (props: IconProps) => <SvgIcon xml={oParlPeople} {...props} />,
  OwnLocation: (props: IconProps) => <SvgIcon xml={ownLocation} {...props} />,
  Pause: (props: IconProps) => <NamedIcon name="pause" {...props} />,
  Pen: (props: IconProps) => <SvgIcon xml={pen} {...props} />,
  Pencil: (props: IconProps) => <NamedIcon name="pencil" {...props} />,
  PencilPlus: (props: IconProps) => <NamedIcon name="pencil-plus" {...props} />,
  Phone: (props: IconProps) => <NamedIcon name="phone" {...props} />,
  Pin: (props: IconProps) => <NamedIcon name="pin" {...props} />,
  PinFilled: (props: IconProps) => <NamedIcon name="pin-filled" {...props} />,
  Play: (props: IconProps) => <NamedIcon name="play" {...props} />,
  Plus: (props: IconProps) => <NamedIcon name="plus" {...props} />,
  Profile: (props: IconProps) => <NamedIcon name="profile" {...props} />,
  ProfileFilled: (props: IconProps) => <SvgIcon xml={userFilled} {...props} />,
  RadioButtonEmpty: (props: IconProps) => <NamedIcon name="radio-button-empty" {...props} />,
  RadioButtonFilled: (props: IconProps) => <NamedIcon name="radio-button-filled" {...props} />,
  Rain: (props: IconProps) => <SvgIcon xml={rain} {...props} />,
  RoutePlanner: (props: IconProps) => <SvgIcon xml={routePlanner} {...props} />,
  Search: (props: IconProps) => <NamedIcon name="search" {...props} />,
  Send: (props: IconProps) => <SvgIcon xml={send} {...props} />,
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => <NamedIcon name="settings" {...props} />,
  Share: (props: IconProps) => <NamedIcon name="share" {...props} />,
  Square: (props: IconProps) => <NamedIcon name="square" {...props} />,
  SquareCheckFilled: (props: IconProps) => <NamedIcon name="square-check-filled" {...props} />,
  SueBroom: (props: IconProps) => <SvgIcon xml={sueBroom} {...props} />,
  SueCheckSmall: (props: IconProps) => <SvgIcon xml={sueCheckSmall} {...props} />,
  SueClock: (props: IconProps) => <SvgIcon xml={sueClock} {...props} />,
  SueClockSmall: (props: IconProps) => <SvgIcon xml={sueClockSmall} {...props} />,
  SueEye: (props: IconProps) => <SvgIcon xml={sueEye} {...props} />,
  SueEyeSmall: (props: IconProps) => <SvgIcon xml={sueEyeSmall} {...props} />,
  SueFace: (props: IconProps) => <SvgIcon xml={sueFace} {...props} />,
  SueFaceSmall: (props: IconProps) => <SvgIcon xml={sueFaceSmall} {...props} />,
  SunDown: (props: IconProps) => <SvgIcon xml={sunDown} {...props} />,
  SunUp: (props: IconProps) => <SvgIcon xml={sunUp} {...props} />,
  Surveys: (props: IconProps) => <NamedIcon name="surveys" {...props} />,
  Trash: (props: IconProps) => <NamedIcon name="trash" {...props} />,
  Unvisible: (props: IconProps) => <SvgIcon xml={unvisible} {...props} />,
  Url: (props: IconProps) => <NamedIcon name="url" {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />,
  Visible: (props: IconProps) => <SvgIcon xml={visible} {...props} />,
  Volunteer: (props: IconProps) => <NamedIcon name="volunteer" {...props} />,
  Voucher: (props: IconProps) => <SvgIcon xml={voucher} {...props} />
};
