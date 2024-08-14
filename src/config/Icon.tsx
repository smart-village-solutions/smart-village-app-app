import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  addImage,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  calendar,
  calendarToggle,
  clock,
  close,
  constructionSite,
  drawerMenu,
  editSetting,
  emptySection,
  filter,
  gps,
  heartEmpty,
  heartFilled,
  home,
  info,
  like,
  link,
  list,
  location,
  lunch,
  lupe,
  mail,
  member,
  notVerifiedBadge,
  ok,
  oParlCalendar,
  oParlOrganizations,
  oParlPeople,
  ownLocation,
  pen,
  phone,
  routePlanner,
  send,
  service,
  share,
  sueCheckSmall,
  sueClock,
  sueClockSmall,
  sueEye,
  sueEyeSmall,
  sueFace,
  sueFaceSmall,
  trash,
  unvisible,
  url,
  verifiedBadge,
  visible,
  voucher
} from '../icons';
import { sueBroom } from '../icons/SUE/broom';

import { colors } from './colors';
import { device } from './device';
import { normalize } from './normalize';

export type IconProps = {
  accessibilityLabel?: string;
  color?: string;
  iconStyle?: StyleProp<ViewStyle>;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export const IconSet = Ionicons;

const getHitSlops = (size: number) => {
  const hitSlop = (44 - size) / 2;

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
  strokeColor,
  strokeWidth,
  style,
  xml
}: IconProps & { xml: (color: string, strokeColor?: string, strokeWidth?: number) => string }) => {
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

const NamedIcon = ({
  accessibilityLabel,
  color = colors.primary,
  iconStyle,
  name,
  size = normalize(26),
  style
}: IconProps & { name?: ComponentProps<typeof IconSet>['name'] }) => {
  return (
    <View accessibilityLabel={accessibilityLabel} style={style} hitSlop={getHitSlops(size)}>
      <IconSet name={name} size={size} color={color} style={iconStyle} />
    </View>
  );
};

export const Icon = {
  About: (props: IconProps) => <NamedIcon name="menu" {...props} />,
  AddImage: (props: IconProps) => <SvgIcon xml={addImage} {...props} />,
  Albums: (props: IconProps) => <NamedIcon name="albums" {...props} />,
  ArrowDown: (props: IconProps) => <SvgIcon xml={arrowDown} {...props} />,
  ArrowDownCircle: (props: IconProps) => <NamedIcon name="arrow-down-circle" {...props} />,
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  Calendar: (props: IconProps) => <SvgIcon xml={calendar} {...props} />,
  CalendarToggle: (props: IconProps) => <SvgIcon xml={calendarToggle} {...props} />,
  Camera: (props: IconProps) => <NamedIcon name="camera" {...props} />,
  Check: (props: IconProps) => <NamedIcon name="checkmark-circle" {...props} />,
  Clock: (props: IconProps) => <SvgIcon xml={clock} {...props} />,
  Close: (props: IconProps) => <SvgIcon xml={close} {...props} />,
  CloseCircle: (props: IconProps) => <NamedIcon name="close-circle" {...props} />,
  CloseCircleOutline: (props: IconProps) => <NamedIcon name="close-circle-outline" {...props} />,
  Company: (props: IconProps) => <NamedIcon name="briefcase" {...props} />,
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  Document: (props: IconProps) => <NamedIcon name="document-text-outline" {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <SvgIcon xml={editSetting} {...props} />,
  EmptySection: (props: IconProps) => <SvgIcon xml={emptySection} {...props} />,
  ExpandMap: (props: IconProps) => <NamedIcon name="expand" {...props} />,
  Filter: (props: IconProps) => <SvgIcon xml={filter} {...props} />,
  GPS: (props: IconProps) => <SvgIcon xml={gps} {...props} />,
  Home: (props: IconProps) => <SvgIcon xml={home} {...props} />,
  HeartEmpty: (props: IconProps) => <SvgIcon xml={heartEmpty} {...props} />,
  HeartFilled: (props: IconProps) => <SvgIcon xml={heartFilled} {...props} />,
  Info: (props: IconProps) => <SvgIcon xml={info} {...props} />,
  Link: (props: IconProps) => <SvgIcon xml={link} {...props} />,
  Like: (props: IconProps) => <SvgIcon xml={like} {...props} />,
  List: (props: IconProps) => <SvgIcon xml={list} {...props} />,
  Location: (props: IconProps) => <SvgIcon xml={location} {...props} />,
  Lunch: (props: IconProps) => <SvgIcon xml={lunch} {...props} />,
  Lupe: (props: IconProps) => <SvgIcon xml={lupe} {...props} />,
  Mail: (props: IconProps) => <SvgIcon xml={mail} {...props} />,
  Member: (props: IconProps) => <SvgIcon xml={member} {...props} />,
  NamedIcon,
  NotVerifiedBadge: (props: IconProps) => <SvgIcon xml={notVerifiedBadge} {...props} />,
  Ok: (props: IconProps) => <SvgIcon xml={ok} {...props} />,
  OParlCalendar: (props: IconProps) => <SvgIcon xml={oParlCalendar} {...props} />,
  OParlOrganizations: (props: IconProps) => <SvgIcon xml={oParlOrganizations} {...props} />,
  OParlPeople: (props: IconProps) => <SvgIcon xml={oParlPeople} {...props} />,
  OwnLocation: (props: IconProps) => <SvgIcon xml={ownLocation} {...props} />,
  Pause: (props: IconProps) => <NamedIcon name="pause" {...props} />,
  Pen: (props: IconProps) => <SvgIcon xml={pen} {...props} />,
  Phone: (props: IconProps) => <SvgIcon xml={phone} {...props} />,
  Play: (props: IconProps) => <NamedIcon name="play" {...props} />,
  Plus: (props: IconProps) => <NamedIcon name="add" {...props} />,
  RadioButtonEmpty: (props: IconProps) => <NamedIcon name="radio-button-off" {...props} />,
  RadioButtonFilled: (props: IconProps) => <NamedIcon name="radio-button-on" {...props} />,
  RoutePlanner: (props: IconProps) => <SvgIcon xml={routePlanner} {...props} />,
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => <NamedIcon name="settings" {...props} />,
  Share: (props: IconProps) =>
    device.platform === 'ios' ? (
      <NamedIcon name="share" {...props} />
    ) : (
      <SvgIcon xml={share} {...props} />
    ),
  Send: (props: IconProps) => <SvgIcon xml={send} {...props} />,
  SueBroom: (props: IconProps) => <SvgIcon xml={sueBroom} {...props} />,
  SueCheckSmall: (props: IconProps) => <SvgIcon xml={sueCheckSmall} {...props} />,
  SueClock: (props: IconProps) => <SvgIcon xml={sueClock} {...props} />,
  SueClockSmall: (props: IconProps) => <SvgIcon xml={sueClockSmall} {...props} />,
  SueEye: (props: IconProps) => <SvgIcon xml={sueEye} {...props} />,
  SueEyeSmall: (props: IconProps) => <SvgIcon xml={sueEyeSmall} {...props} />,
  SueFace: (props: IconProps) => <SvgIcon xml={sueFace} {...props} />,
  SueFaceSmall: (props: IconProps) => <SvgIcon xml={sueFaceSmall} {...props} />,
  Surveys: (props: IconProps) => <NamedIcon name="stats-chart-outline" {...props} />,
  Trash: (props: IconProps) => <SvgIcon xml={trash} {...props} />,
  Unvisible: (props: IconProps) => <SvgIcon xml={unvisible} {...props} />,
  Url: (props: IconProps) => <SvgIcon xml={url} {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />,
  Visible: (props: IconProps) => <SvgIcon xml={visible} {...props} />,
  Volunteer: (props: IconProps) => <NamedIcon name="people-circle" {...props} />,
  Voucher: (props: IconProps) => <SvgIcon xml={voucher} {...props} />
};
