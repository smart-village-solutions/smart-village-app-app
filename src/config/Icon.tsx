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
  constructionSite,
  drawerMenu,
  favSettings,
  heartEmpty,
  heartFilled,
  home,
  info,
  link,
  location,
  lunch,
  mail,
  notVerifiedBadge,
  oParlCalendar,
  oParlOrganizations,
  oParlPeople,
  phone,
  service,
  share,
  url,
  verifiedBadge
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
  ArrowLeft: (props: IconProps) => <SvgIcon xml={arrowLeft} {...props} />,
  ArrowRight: (props: IconProps) => <SvgIcon xml={arrowRight} {...props} />,
  ArrowUp: (props: IconProps) => <SvgIcon xml={arrowUp} {...props} />,
  Calendar: (props: IconProps) => <SvgIcon xml={calendar} {...props} />,
  Company: (props: IconProps) => (
    <NamedIcon name={device.platform === 'ios' ? 'ios-briefcase' : 'md-briefcase'} {...props} />
  ),
  ConstructionSite: (props: IconProps) => <SvgIcon xml={constructionSite} {...props} />,
  DrawerMenu: (props: IconProps) => <SvgIcon xml={drawerMenu} {...props} />,
  EditSetting: (props: IconProps) => <NamedIcon name="md-create" {...props} />,
  FavSettings: (props: IconProps) => <SvgIcon xml={favSettings} {...props} />,
  Home: (props: IconProps) => <SvgIcon xml={home} {...props} />,
  NamedIcon,
  HeartEmpty: (props: IconProps) => <SvgIcon xml={heartEmpty} {...props} />,
  HeartFilled: (props: IconProps) => <SvgIcon xml={heartFilled} {...props} />,
  Info: (props: IconProps) => <SvgIcon xml={info} {...props} />,
  Link: (props: IconProps) => <SvgIcon xml={link} {...props} />,
  Location: (props: IconProps) => <SvgIcon xml={location} {...props} />,
  Lunch: (props: IconProps) => <SvgIcon xml={lunch} {...props} />,
  Mail: (props: IconProps) => <SvgIcon xml={mail} {...props} />,
  NotVerifiedBadge: (props: IconProps) => <SvgIcon xml={notVerifiedBadge} {...props} />,
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
  Service: (props: IconProps) => <SvgIcon xml={service} {...props} />,
  Settings: (props: IconProps) => (
    <NamedIcon name={device.platform === 'ios' ? 'ios-settings' : 'md-settings'} {...props} />
  ),
  Share: (props: IconProps) =>
    device.platform === 'ios' ? (
      <NamedIcon name="ios-share" {...props} />
    ) : (
      <SvgIcon xml={share} {...props} />
    ),
  Surveys: (props: IconProps) => <NamedIcon name="stats-chart-outline" {...props} />,
  Url: (props: IconProps) => <SvgIcon xml={url} {...props} />,
  VerifiedBadge: (props: IconProps) => <SvgIcon xml={verifiedBadge} {...props} />
};
