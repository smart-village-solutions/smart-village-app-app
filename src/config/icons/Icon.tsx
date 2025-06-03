import _camelCase from 'lodash/camelCase';
import _upperFirst from 'lodash/upperFirst';
import React, { ComponentProps } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Tabler from 'tabler-icons-react-native';

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

export type IconProps = {
  accessibilityLabel?: string;
  color?: string;
  hasNoHitSlop?: boolean;
  iconStyle?: StyleProp<ViewStyle>;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
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

const NamedIcon = ({
  accessibilityLabel,
  color = colors.primary,
  hasNoHitSlop = false,
  iconStyle,
  name,
  strokeWidth = 1,
  size = normalize(24),
  style
}: IconProps & {
  name: ComponentProps<typeof IconSet>['name'];
  strokeWidth?: number;
}) => {
  let IconComponent: any;

  if (IconSet === Tabler) {
    const TablerName = ('Icon' + _upperFirst(_camelCase(name))) as TablerIconName;
    IconComponent = Tabler?.[TablerName] || Tabler.IconQuestionMark;
  } else {
    IconComponent = IconSet;
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={style}
      hitSlop={hasNoHitSlop ? undefined : getHitSlops(size)}
    >
      <IconComponent name={name} size={size} color={color} style={iconStyle} stroke={strokeWidth} />
    </View>
  );
};

export const Icon = {
  About: (props: IconProps) => <NamedIcon name="menu-2" {...props} />,
  AddImage: (props: IconProps) => <SvgIcon xml={addImage} {...props} />,
  Albums: (props: IconProps) => <NamedIcon name="album" {...props} />,
  AlertHexagonFilled: (props: IconProps) => <NamedIcon name="alert-hexagon-filled" {...props} />,
  ArrowDown: (props: IconProps) => <SvgIcon xml={arrowDown} {...props} />,
  ArrowDownCircle: (props: IconProps) => <NamedIcon name="circle-arrow-down-filled" {...props} />,
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowRight2: (props: IconProps) => <NamedIcon name="arrow-narrow-right" {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  At: (props: IconProps) => <NamedIcon name="at" {...props} />,
  Calendar: (props: IconProps) => <NamedIcon name="calendar" {...props} />,
  CalendarToggle: (props: IconProps) => <SvgIcon xml={calendarToggle} {...props} />,
  Camera: (props: IconProps) => <NamedIcon name="camera" {...props} />,
  Check: (props: IconProps) => <NamedIcon name="circle-check-filled" {...props} />,
  Circle: (props: IconProps) => <NamedIcon name="circle" {...props} />,
  CircleCheckFilled: (props: IconProps) => <NamedIcon name="circle-check-filled" {...props} />,
  Clock: (props: IconProps) => <NamedIcon name="clock" {...props} />,
  Close: (props: IconProps) => <SvgIcon xml={close} {...props} />,
  CloseCircle: (props: IconProps) => <NamedIcon name="circle-x-filled" {...props} />,
  CloseCircleOutline: (props: IconProps) => <NamedIcon name="circle-x" {...props} />,
  Company: (props: IconProps) => <NamedIcon name="briefcase" {...props} />,
  CondenseMap: (props: IconProps) => <NamedIcon name="minimize" {...props} />,
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  Copy: (props: IconProps) => <NamedIcon name="copy" {...props} />,
  Document: (props: IconProps) => <NamedIcon name="file-description" {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <SvgIcon xml={editSetting} {...props} />,
  EmptySection: (props: IconProps) => <SvgIcon xml={emptySection} {...props} />,
  ExpandMap: (props: IconProps) => <NamedIcon name="maximize" {...props} />,
  Flag: (props: IconProps) => <NamedIcon name="flag-2" {...props} />,
  Filter: (props: IconProps) => <SvgIcon xml={filter} {...props} />,
  GPS: (props: IconProps) => <SvgIcon xml={gps} {...props} />,
  HeartEmpty: (props: IconProps) => <NamedIcon name="heart" {...props} />,
  HeartFilled: (props: IconProps) => <NamedIcon name="heart-filled" {...props} />,
  Home: (props: IconProps) => <NamedIcon name="home-2" {...props} />,
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
  Mail: (props: IconProps) => <NamedIcon name="message-2" {...props} />,
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
  Pause: (props: IconProps) => <NamedIcon name="player-pause" {...props} />,
  Pen: (props: IconProps) => <SvgIcon xml={pen} {...props} />,
  Pencil: (props: IconProps) => <NamedIcon name="pencil" {...props} />,
  PencilPlus: (props: IconProps) => <NamedIcon name="pencil-plus" {...props} />,
  Phone: (props: IconProps) => <NamedIcon name="phone" {...props} />,
  Pin: (props: IconProps) => <NamedIcon name="pin" {...props} />,
  PinFilled: (props: IconProps) => <NamedIcon name="pin-filled" {...props} />,
  Play: (props: IconProps) => <NamedIcon name="player-play-filled" {...props} />,
  Plus: (props: IconProps) => <NamedIcon name="plus" {...props} />,
  Profile: (props: IconProps) => <NamedIcon name="user" {...props} />,
  ProfileFilled: (props: IconProps) => <SvgIcon xml={userFilled} {...props} />,
  RadioButtonEmpty: (props: IconProps) => <NamedIcon name="circle" {...props} />,
  RadioButtonFilled: (props: IconProps) => <NamedIcon name="circle-filled" {...props} />,
  Rain: (props: IconProps) => <SvgIcon xml={rain} {...props} />,
  RoutePlanner: (props: IconProps) => <SvgIcon xml={routePlanner} {...props} />,
  Send: (props: IconProps) => <SvgIcon xml={send} {...props} />,
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => <NamedIcon name="settings" {...props} />,
  Share: (props: IconProps) => <NamedIcon name="share-3" {...props} />,
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
  Surveys: (props: IconProps) => <NamedIcon name="chart-candle" {...props} />,
  Trash: (props: IconProps) => <NamedIcon name="trash" {...props} />,
  Unvisible: (props: IconProps) => <SvgIcon xml={unvisible} {...props} />,
  Url: (props: IconProps) => <NamedIcon name="link" {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />,
  Visible: (props: IconProps) => <SvgIcon xml={visible} {...props} />,
  Volunteer: (props: IconProps) => <NamedIcon name="users-group" {...props} />,
  Voucher: (props: IconProps) => <SvgIcon xml={voucher} {...props} />
};
