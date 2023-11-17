import React, { ComponentProps } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  IconAerialLift,
  IconArrowNarrowRight,
  IconBike,
  IconBrandApple,
  IconBrandFacebook,
  IconBrandGoogle,
  IconBus,
  IconBusStop,
  IconCar,
  IconClock,
  IconFlag2,
  IconHeart,
  IconHeartFilled,
  IconHome2,
  IconLink,
  IconMail,
  IconMaximize,
  IconMenu2,
  IconPhone,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconTrain,
  IconUser,
  TablerIconsProps
} from 'tabler-icons-react-native';

import Tabler from '../components/tabler-icons';
import {
  addImage,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  calendar,
  calendarToggle,
  close,
  constructionSite,
  drawerMenu,
  editSetting,
  emptySection,
  info,
  like,
  link,
  list,
  locationActive,
  logo,
  lunch,
  member,
  notVerifiedBadge,
  ok,
  oParlCalendar,
  oParlOrganizations,
  oParlPeople,
  ownLocation,
  pen,
  routePlanner,
  send,
  service,
  share,
  trash,
  unvisible,
  userFilled,
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
}: IconProps & { name?: ComponentProps<typeof IconSet>['name'] }) => {
  return (
    <View style={style} hitSlop={getHitSlops(size)}>
      <IconSet name={name} size={size} color={color} style={iconStyle} />
    </View>
  );
};

export const Icon = {
  About: (props: TablerIconsProps) => <IconMenu2 stroke={1} {...props} />,
  AddImage: (props: IconProps) => <SvgIcon xml={addImage} {...props} />,
  ArrowDown: (props: IconProps) => <SvgIcon xml={arrowDown} {...props} />,
  ArrowDownCircle: (props: IconProps) => <NamedIcon name="circle-arrow-down-filled" {...props} />,
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowRight2: (props: TablerIconsProps) => <IconArrowNarrowRight stroke={1} {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  Bike: (props: TablerIconsProps) => <IconBike stroke={1} {...props} />,
  BrandApple: (props: TablerIconsProps) => <IconBrandApple stroke={1} {...props} />,
  BrandFacebook: (props: TablerIconsProps) => <IconBrandFacebook stroke={1} {...props} />,
  BrandGoogle: (props: TablerIconsProps) => <IconBrandGoogle stroke={1} {...props} />,
  Bus: (props: TablerIconsProps) => <IconBus stroke={1.2} {...props} />,
  Calendar: (props: IconProps) => <SvgIcon xml={calendar} {...props} />,
  CalendarToggle: (props: IconProps) => <SvgIcon xml={calendarToggle} {...props} />,
  Camera: (props: IconProps) => <NamedIcon name="camera" {...props} />,
  Car: (props: TablerIconsProps) => <IconCar stroke={1} {...props} />,
  Check: (props: IconProps) => <NamedIcon name="circle-check-filled" {...props} />,
  Clock: (props: TablerIconsProps) => <IconClock stroke={1} {...props} />,
  Close: (props: IconProps) => <SvgIcon xml={close} {...props} />,
  CloseCircle: (props: IconProps) => <NamedIcon name="circle-x-filled" {...props} />,
  CloseCircleOutline: (props: IconProps) => <NamedIcon name="circle-x" {...props} />,
  Company: (props: IconProps) => <NamedIcon name="briefcase" {...props} />,
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  Document: (props: IconProps) => <NamedIcon name="file-description" {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <SvgIcon xml={editSetting} {...props} />,
  EmptySection: (props: IconProps) => <SvgIcon xml={emptySection} {...props} />,
  ExpandMap: (props: TablerIconsProps) => <IconMaximize stroke={1} {...props} />,
  Flag: (props: TablerIconsProps) => <IconFlag2 stroke={1} {...props} />,
  Home: (props: TablerIconsProps) => <IconHome2 stroke={1} {...props} />,
  HeartEmpty: (props: TablerIconsProps) => <IconHeart stroke={1} {...props} />,
  HeartFilled: (props: TablerIconsProps) => <IconHeartFilled stroke={1} {...props} />,
  Info: (props: IconProps) => <SvgIcon xml={info} {...props} />,
  Link: (props: IconProps) => <SvgIcon xml={link} {...props} />,
  Like: (props: IconProps) => <SvgIcon xml={like} {...props} />,
  List: (props: IconProps) => <SvgIcon xml={list} {...props} />,
  Location: (props: IconProps) => <NamedIcon name="map-pin-filled" {...props} />,
  LocationActive: (props: IconProps) => <SvgIcon xml={locationActive} {...props} />,
  Logo: (props: IconProps) => <SvgIcon xml={logo} {...props} />,
  Lunch: (props: IconProps) => <SvgIcon xml={lunch} {...props} />,
  Mail: (props: TablerIconsProps) => <IconMail stroke={1} {...props} />,
  Member: (props: IconProps) => <SvgIcon xml={member} {...props} />,
  Metro: (props: TablerIconsProps) => <IconTrain stroke={1.2} {...props} />,
  NamedIcon,
  NotVerifiedBadge: (props: IconProps) => <SvgIcon xml={notVerifiedBadge} {...props} />,
  Ok: (props: IconProps) => <SvgIcon xml={ok} {...props} />,
  OParlCalendar: (props: IconProps) => <SvgIcon xml={oParlCalendar} {...props} />,
  OParlOrganizations: (props: IconProps) => <SvgIcon xml={oParlOrganizations} {...props} />,
  OParlPeople: (props: IconProps) => <SvgIcon xml={oParlPeople} {...props} />,
  OwnLocation: (props: IconProps) => <SvgIcon xml={ownLocation} {...props} />,
  Pause: (props: TablerIconsProps) => <IconPlayerPauseFilled stroke={1} {...props} />,
  Pen: (props: IconProps) => <SvgIcon xml={pen} {...props} />,
  Phone: (props: TablerIconsProps) => <IconPhone stroke={1} {...props} />,
  Play: (props: TablerIconsProps) => <IconPlayerPlayFilled stroke={1} {...props} />,
  Plus: (props: IconProps) => <NamedIcon name="plus" {...props} />,
  Profile: (props: TablerIconsProps) => <IconUser stroke={1} {...props} />,
  ProfileFilled: (props: IconProps) => <SvgIcon xml={userFilled} {...props} />,
  Publics: (props: TablerIconsProps) => <IconBusStop stroke={1} {...props} />,
  RadioButtonEmpty: (props: IconProps) => <NamedIcon name="circle" {...props} />,
  RadioButtonFilled: (props: IconProps) => <NamedIcon name="circle-filled" {...props} />,
  Railway: (props: TablerIconsProps) => <IconTrain stroke={1.2} {...props} />,
  RoutePlanner: (props: IconProps) => <SvgIcon xml={routePlanner} {...props} />,
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => <NamedIcon name="settings" {...props} />,
  Share: (props: IconProps) => <SvgIcon xml={share} {...props} />,
  Send: (props: IconProps) => <SvgIcon xml={send} {...props} />,
  Surveys: (props: IconProps) => <NamedIcon name="chart-candle" {...props} />,
  Tram: (props: TablerIconsProps) => <IconAerialLift stroke={1.2} {...props} />,
  Trash: (props: IconProps) => <SvgIcon xml={trash} {...props} />,
  Unvisible: (props: IconProps) => <SvgIcon xml={unvisible} {...props} />,
  Url: (props: TablerIconsProps) => <IconLink stroke={1} {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />,
  Visible: (props: IconProps) => <SvgIcon xml={visible} {...props} />,
  Volunteer: (props: IconProps) => <NamedIcon name="users-group" {...props} />
};
