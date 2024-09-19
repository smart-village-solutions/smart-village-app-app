import React, { ComponentProps } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  IconAlertHexagonFilled,
  IconArrowNarrowRight,
  IconAt,
  IconCircle,
  IconCircleCheckFilled,
  IconClock,
  IconFlag2,
  IconHeart,
  IconHeartFilled,
  IconHome2,
  IconLink,
  IconMap,
  IconMaximize,
  IconMenu2,
  IconMessage2,
  IconPencil,
  IconPencilPlus,
  IconPhone,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconShare3,
  IconSquare,
  IconSquareCheckFilled,
  IconTrash,
  IconUser
} from 'tabler-icons-react-native';

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
  filter,
  gps,
  homeFilled,
  info,
  like,
  link,
  list,
  location,
  locationActive,
  logo,
  lunch,
  lupe,
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
  sueBroom,
  sueCheckSmall,
  sueClock,
  sueClockSmall,
  sueEye,
  sueEyeSmall,
  sueFace,
  sueFaceSmall,
  unvisible,
  userFilled,
  verifiedBadge,
  visible,
  voucher
} from '../../icons';
import Tabler from '../../icons/tabler-icons';
import { colors } from '../colors';
import { normalize } from '../normalize';

export const IconSet = Tabler;

export type IconProps = {
  accessibilityLabel?: string;
  color?: string;
  iconStyle?: StyleProp<ViewStyle>;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

const getHitSlops = (size: number) => {
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

const TablerIcon = ({
  color = colors.primary,
  IconComponent,
  size = normalize(24),
  strokeWidth = 1,
  style
}: IconProps & {
  IconComponent: React.ComponentType<{ color: string; size: number; stroke: number }>;
}) => {
  return (
    <View style={style}>
      <IconComponent color={color} size={size} stroke={strokeWidth} />
    </View>
  );
};

export const Icon = {
  About: (props: IconProps) => <TablerIcon IconComponent={IconMenu2} {...props} />,
  AddImage: (props: IconProps) => <SvgIcon xml={addImage} {...props} />,
  Albums: (props: IconProps) => <NamedIcon name="album" {...props} />,
  AlertHexagonFilled: (props: IconProps) => (
    <TablerIcon IconComponent={IconAlertHexagonFilled} {...props} />
  ),
  ArrowDown: (props: IconProps) => <SvgIcon xml={arrowDown} {...props} />,
  ArrowDownCircle: (props: IconProps) => <NamedIcon name="circle-arrow-down-filled" {...props} />,
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowRight2: (props: IconProps) => <TablerIcon IconComponent={IconArrowNarrowRight} {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  At: (props: IconProps) => <TablerIcon IconComponent={IconAt} {...props} />,
  Calendar: (props: IconProps) => <SvgIcon xml={calendar} {...props} />,
  CalendarToggle: (props: IconProps) => <SvgIcon xml={calendarToggle} {...props} />,
  Camera: (props: IconProps) => <NamedIcon name="camera" {...props} />,
  Check: (props: IconProps) => <NamedIcon name="circle-check-filled" {...props} />,
  Circle: (props: IconProps) => <TablerIcon IconComponent={IconCircle} {...props} />,
  CircleCheckFilled: (props: IconProps) => (
    <TablerIcon IconComponent={IconCircleCheckFilled} {...props} />
  ),
  Clock: (props: IconProps) => <TablerIcon IconComponent={IconClock} {...props} />,
  Close: (props: IconProps) => <SvgIcon xml={close} {...props} />,
  CloseCircle: (props: IconProps) => <NamedIcon name="circle-x-filled" {...props} />,
  CloseCircleOutline: (props: IconProps) => <NamedIcon name="circle-x" {...props} />,
  Company: (props: IconProps) => <NamedIcon name="briefcase" {...props} />,
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  Document: (props: IconProps) => <NamedIcon name="file-description" {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <SvgIcon xml={editSetting} {...props} />,
  EmptySection: (props: IconProps) => <SvgIcon xml={emptySection} {...props} />,
  ExpandMap: (props: IconProps) => <TablerIcon IconComponent={IconMaximize} {...props} />,
  Filter: (props: IconProps) => <SvgIcon xml={filter} {...props} />,
  Flag: (props: IconProps) => <TablerIcon IconComponent={IconFlag2} {...props} />,
  GPS: (props: IconProps) => <SvgIcon xml={gps} {...props} />,
  HeartEmpty: (props: IconProps) => <TablerIcon IconComponent={IconHeart} {...props} />,
  HeartFilled: (props: IconProps) => <TablerIcon IconComponent={IconHeartFilled} {...props} />,
  Home: (props: IconProps) => <TablerIcon IconComponent={IconHome2} {...props} />,
  HomeFilled: (props: IconProps) => <SvgIcon xml={homeFilled} {...props} />,
  Info: (props: IconProps) => <SvgIcon xml={info} {...props} />,
  Like: (props: IconProps) => <SvgIcon xml={like} {...props} />,
  Link: (props: IconProps) => <SvgIcon xml={link} {...props} />,
  List: (props: IconProps) => <SvgIcon xml={list} {...props} />,
  Location: (props: IconProps) => <SvgIcon xml={location} {...props} />,
  LocationActive: (props: IconProps) => <SvgIcon xml={locationActive} {...props} />,
  Logo: (props: IconProps) => <SvgIcon xml={logo} {...props} />,
  Lunch: (props: IconProps) => <SvgIcon xml={lunch} {...props} />,
  Lupe: (props: IconProps) => <SvgIcon xml={lupe} {...props} />,
  Mail: (props: IconProps) => <TablerIcon IconComponent={IconMessage2} {...props} />,
  Map: (props: IconProps) => <TablerIcon IconComponent={IconMap} {...props} />,
  Member: (props: IconProps) => <SvgIcon xml={member} {...props} />,
  NamedIcon,
  NotVerifiedBadge: (props: IconProps) => <SvgIcon xml={notVerifiedBadge} {...props} />,
  Ok: (props: IconProps) => <SvgIcon xml={ok} {...props} />,
  OParlCalendar: (props: IconProps) => <SvgIcon xml={oParlCalendar} {...props} />,
  OParlOrganizations: (props: IconProps) => <SvgIcon xml={oParlOrganizations} {...props} />,
  OParlPeople: (props: IconProps) => <SvgIcon xml={oParlPeople} {...props} />,
  OwnLocation: (props: IconProps) => <SvgIcon xml={ownLocation} {...props} />,
  Pause: (props: IconProps) => <TablerIcon IconComponent={IconPlayerPauseFilled} {...props} />,
  Pen: (props: IconProps) => <SvgIcon xml={pen} {...props} />,
  Pencil: (props: IconProps) => <TablerIcon IconComponent={IconPencil} {...props} />,
  PencilPlus: (props: IconProps) => <TablerIcon IconComponent={IconPencilPlus} {...props} />,
  Phone: (props: IconProps) => <TablerIcon IconComponent={IconPhone} {...props} />,
  Play: (props: IconProps) => <TablerIcon IconComponent={IconPlayerPlayFilled} {...props} />,
  Plus: (props: IconProps) => <NamedIcon name="plus" {...props} />,
  Profile: (props: IconProps) => <TablerIcon IconComponent={IconUser} {...props} />,
  ProfileFilled: (props: IconProps) => <SvgIcon xml={userFilled} {...props} />,
  RadioButtonEmpty: (props: IconProps) => <NamedIcon name="circle" {...props} />,
  RadioButtonFilled: (props: IconProps) => <NamedIcon name="circle-filled" {...props} />,
  RoutePlanner: (props: IconProps) => <SvgIcon xml={routePlanner} {...props} />,
  Send: (props: IconProps) => <SvgIcon xml={send} {...props} />,
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => <NamedIcon name="settings" {...props} />,
  Share: (props: IconProps) => <TablerIcon IconComponent={IconShare3} {...props} />,
  Square: (props: IconProps) => <TablerIcon IconComponent={IconSquare} {...props} />,
  SquareCheckFilled: (props: IconProps) => (
    <TablerIcon IconComponent={IconSquareCheckFilled} {...props} />
  ),
  SueBroom: (props: IconProps) => <SvgIcon xml={sueBroom} {...props} />,
  SueCheckSmall: (props: IconProps) => <SvgIcon xml={sueCheckSmall} {...props} />,
  SueClock: (props: IconProps) => <SvgIcon xml={sueClock} {...props} />,
  SueClockSmall: (props: IconProps) => <SvgIcon xml={sueClockSmall} {...props} />,
  SueEye: (props: IconProps) => <SvgIcon xml={sueEye} {...props} />,
  SueEyeSmall: (props: IconProps) => <SvgIcon xml={sueEyeSmall} {...props} />,
  SueFace: (props: IconProps) => <SvgIcon xml={sueFace} {...props} />,
  SueFaceSmall: (props: IconProps) => <SvgIcon xml={sueFaceSmall} {...props} />,
  Surveys: (props: IconProps) => <NamedIcon name="chart-candle" {...props} />,
  Trash: (props: IconProps) => <TablerIcon IconComponent={IconTrash} {...props} />,
  Unvisible: (props: IconProps) => <SvgIcon xml={unvisible} {...props} />,
  Url: (props: IconProps) => <TablerIcon IconComponent={IconLink} {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />,
  Visible: (props: IconProps) => <SvgIcon xml={visible} {...props} />,
  Volunteer: (props: IconProps) => <NamedIcon name="users-group" {...props} />,
  Voucher: (props: IconProps) => <SvgIcon xml={voucher} {...props} />
};
