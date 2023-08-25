import React, { ComponentProps } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';

import Tabler from '../components/tabler-icons';
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
  heartEmpty,
  heartFilled,
  home,
  info,
  like,
  link,
  list,
  location,
  logo,
  lunch,
  mail,
  member,
  notVerifiedBadge,
  ok,
  oParlCalendar,
  oParlOrganizations,
  oParlPeople,
  pen,
  phone,
  profile,
  routePlanner,
  send,
  service,
  share,
  trash,
  unvisible,
  url,
  verifiedBadge,
  visible
} from '../icons';

import { colors } from './colors';
import { normalize } from './normalize';

export type IconProps = {
  color?: string;
  iconStyle?: StyleProp<ViewStyle>;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const IconSet = Tabler;

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
  color = colors.primary,
  iconStyle,
  size = normalize(24),
  style,
  xml
}: IconProps & { xml: (color: string) => string }) => {
  return (
    <View style={style} hitSlop={getHitSlops(size)}>
      <SvgXml xml={xml(color)} width={size} height={size} style={iconStyle} />
    </View>
  );
};

const NamedIcon = ({
  color = colors.primary,
  iconStyle,
  name,
  size = normalize(26),
  style
}: IconProps & { name: ComponentProps<typeof IconSet>['name'] }) => {
  return (
    <View style={style} hitSlop={getHitSlops(size)}>
      <IconSet name={name} size={size} color={color} style={iconStyle} />
    </View>
  );
};

export const Icon = {
  About: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  AddImage: (props: IconProps) => <SvgIcon xml={addImage} {...props} />,
  ArrowDown: (props: IconProps) => <SvgIcon xml={arrowDown} {...props} />,
  ArrowDownCircle: (props: IconProps) => <NamedIcon name="circle-arrow-down-filled" {...props} />,
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  Calendar: (props: IconProps) => <SvgIcon xml={calendar} {...props} />,
  CalendarToggle: (props: IconProps) => <SvgIcon xml={calendarToggle} {...props} />,
  Camera: (props: IconProps) => <NamedIcon name="camera" {...props} />,
  Check: (props: IconProps) => <NamedIcon name="circle-check-filled" {...props} />,
  Clock: (props: IconProps) => <SvgIcon xml={clock} {...props} />,
  Close: (props: IconProps) => <SvgIcon xml={close} {...props} />,
  CloseCircle: (props: IconProps) => <NamedIcon name="circle-x-filled" {...props} />,
  CloseCircleOutline: (props: IconProps) => <NamedIcon name="circle-x" {...props} />,
  Company: (props: IconProps) => <NamedIcon name="briefcase" {...props} />,
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  Document: (props: IconProps) => <NamedIcon name="file-description" {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <SvgIcon xml={editSetting} {...props} />,
  EmptySection: (props: IconProps) => <SvgIcon xml={emptySection} {...props} />,
  ExpandMap: (props: IconProps) => <NamedIcon name="arrows-maximize" {...props} />,
  Home: (props: IconProps) => <SvgIcon xml={home} {...props} />,
  NamedIcon,
  HeartEmpty: (props: IconProps) => <SvgIcon xml={heartEmpty} {...props} />,
  HeartFilled: (props: IconProps) => <SvgIcon xml={heartFilled} {...props} />,
  Info: (props: IconProps) => <SvgIcon xml={info} {...props} />,
  Link: (props: IconProps) => <SvgIcon xml={link} {...props} />,
  Like: (props: IconProps) => <SvgIcon xml={like} {...props} />,
  List: (props: IconProps) => <SvgIcon xml={list} {...props} />,
  Location: (props: IconProps) => <SvgIcon xml={location} {...props} />,
  Logo: (props: IconProps) => <SvgIcon xml={logo} {...props} />,
  Lunch: (props: IconProps) => <SvgIcon xml={lunch} {...props} />,
  Mail: (props: IconProps) => <SvgIcon xml={mail} {...props} />,
  Member: (props: IconProps) => <SvgIcon xml={member} {...props} />,
  NotVerifiedBadge: (props: IconProps) => <SvgIcon xml={notVerifiedBadge} {...props} />,
  Ok: (props: IconProps) => <SvgIcon xml={ok} {...props} />,
  OParlCalendar: (props: IconProps) => <SvgIcon xml={oParlCalendar} {...props} />,
  OParlOrganizations: (props: IconProps) => <SvgIcon xml={oParlOrganizations} {...props} />,
  OParlPeople: (props: IconProps) => <SvgIcon xml={oParlPeople} {...props} />,
  Pause: (props: IconProps) => <NamedIcon name="player-pause-filled" {...props} />,
  Pen: (props: IconProps) => <SvgIcon xml={pen} {...props} />,
  Phone: (props: IconProps) => <SvgIcon xml={phone} {...props} />,
  Play: (props: IconProps) => <NamedIcon name="player-play-filled" {...props} />,
  Plus: (props: IconProps) => <NamedIcon name="plus" {...props} />,
  Profile: (props: IconProps) => <SvgIcon xml={profile} {...props} />,
  RadioButtonEmpty: (props: IconProps) => <NamedIcon name="circle" {...props} />,
  RadioButtonFilled: (props: IconProps) =>
    <NamedIcon name="circle-filled" {...props} />,
  RoutePlanner: (props: IconProps) => <SvgIcon xml={routePlanner} {...props} />,
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => <NamedIcon name="settings" {...props} /> ,
  Share: (props: IconProps) => <SvgIcon xml={share} {...props} />,
  Send: (props: IconProps) => <SvgIcon xml={send} {...props} />,
  Surveys: (props: IconProps) => <NamedIcon name="chart-candle" {...props} />,
  Trash: (props: IconProps) => <SvgIcon xml={trash} {...props} />,
  Unvisible: (props: IconProps) => <SvgIcon xml={unvisible} {...props} />,
  Url: (props: IconProps) => <SvgIcon xml={url} {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />,
  Visible: (props: IconProps) => <SvgIcon xml={visible} {...props} />,
  Volunteer: (props: IconProps) => <NamedIcon name="users" {...props} />
};
