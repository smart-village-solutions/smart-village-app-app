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
  clock,
  close,
  constructionSite,
  drawerMenu,
  emptySection,
  heartEmpty,
  heartFilled,
  home,
  info,
  like,
  link,
  location,
  lunch,
  mail,
  notVerifiedBadge,
  ok,
  oParlCalendar,
  oParlOrganizations,
  oParlPeople,
  phone,
  routePlanner,
  service,
  share,
  trash,
  unvisible,
  url,
  verifiedBadge,
  visible
} from '../icons';

import { colors } from './colors';
import { device } from './device';
import { normalize } from './normalize';

export type IconProps = {
  color?: string;
  iconStyle?: StyleProp<ViewStyle>;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

const IconSet = Ionicons;

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
  About: (props: IconProps) => (
    <NamedIcon name={device.platform === 'ios' ? 'ios-menu' : 'md-menu'} {...props} />
  ),
  AddImage: (props: IconProps) => <SvgIcon xml={addImage} {...props} />,
  ArrowDown: (props: IconProps) => <SvgIcon xml={arrowDown} {...props} />,
  ArrowDownCircle: (props: IconProps) => <NamedIcon name="arrow-down-circle" {...props} />,
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  Calendar: (props: IconProps) => <SvgIcon xml={calendar} {...props} />,
  Check: (props: IconProps) => <NamedIcon name="checkmark-circle" {...props} />,
  Clock: (props: IconProps) => <SvgIcon xml={clock} {...props} />,
  Close: (props: IconProps) => <SvgIcon xml={close} {...props} />,
  CloseCircle: (props: IconProps) => <NamedIcon name="close-circle" {...props} />,
  Company: (props: IconProps) => (
    <NamedIcon name={device.platform === 'ios' ? 'ios-briefcase' : 'md-briefcase'} {...props} />
  ),
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <NamedIcon name="md-create" {...props} />,
  EmptySection: (props: IconProps) => <SvgIcon xml={emptySection} {...props} />,
  Home: (props: IconProps) => <SvgIcon xml={home} {...props} />,
  NamedIcon,
  HeartEmpty: (props: IconProps) => <SvgIcon xml={heartEmpty} {...props} />,
  HeartFilled: (props: IconProps) => <SvgIcon xml={heartFilled} {...props} />,
  Info: (props: IconProps) => <SvgIcon xml={info} {...props} />,
  Link: (props: IconProps) => <SvgIcon xml={link} {...props} />,
  Like: (props: IconProps) => <SvgIcon xml={like} {...props} />,
  Location: (props: IconProps) => <SvgIcon xml={location} {...props} />,
  Lunch: (props: IconProps) => <SvgIcon xml={lunch} {...props} />,
  Mail: (props: IconProps) => <SvgIcon xml={mail} {...props} />,
  NotVerifiedBadge: (props: IconProps) => <SvgIcon xml={notVerifiedBadge} {...props} />,
  Ok: (props: IconProps) => <SvgIcon xml={ok} {...props} />,
  OParlCalendar: (props: IconProps) => <SvgIcon xml={oParlCalendar} {...props} />,
  OParlOrganizations: (props: IconProps) => <SvgIcon xml={oParlOrganizations} {...props} />,
  OParlPeople: (props: IconProps) => <SvgIcon xml={oParlPeople} {...props} />,
  Phone: (props: IconProps) => <SvgIcon xml={phone} {...props} />,
  RadioButtonEmpty: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-radio-button-off' : 'md-radio-button-off'}
      {...props}
    />
  ),
  RadioButtonFilled: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-radio-button-on' : 'md-radio-button-on'}
      {...props}
    />
  ),
  RoutePlanner: (props: IconProps) => <SvgIcon xml={routePlanner} {...props} />,
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => (
    <NamedIcon name={device.platform === 'ios' ? 'ios-settings' : 'md-settings'} {...props} />
  ),
  Send: (props: IconProps) => <NamedIcon name="send" {...props} />,
  Share: (props: IconProps) =>
    device.platform === 'ios' ? (
      <NamedIcon name="ios-share" {...props} />
    ) : (
      <SvgIcon xml={share} {...props} />
    ),
  Trash: (props: IconProps) => <SvgIcon xml={trash} {...props} />,
  Surveys: (props: IconProps) => <NamedIcon name="stats-chart-outline" {...props} />,
  Unvisible: (props: IconProps) => <SvgIcon xml={unvisible} {...props} />,
  Url: (props: IconProps) => <SvgIcon xml={url} {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />,
  Visible: (props: IconProps) => <SvgIcon xml={visible} {...props} />,
  Volunteer: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-people-circle' : 'md-people-circle'}
      {...props}
    />
  ),
  VolunteerCalendar: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-calendar-outline' : 'md-calendar-outline'}
      {...props}
    />
  ),
  VolunteerConversationNew: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-mail-outline' : 'md-mail-outline'}
      {...props}
    />
  ),
  VolunteerList: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-list-outline' : 'md-list-outline'}
      {...props}
    />
  ),
  VolunteerLogout: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-lock-open-outline' : 'md-lock-open-outline'}
      {...props}
    />
  ),
  VolunteerPersonal: (props: IconProps) => (
    <NamedIcon
      name={device.platform === 'ios' ? 'ios-person-outline' : 'md-person-outline'}
      {...props}
    />
  )
};
