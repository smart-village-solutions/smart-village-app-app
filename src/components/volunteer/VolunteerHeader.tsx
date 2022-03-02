import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

const { ROOT_ROUTE_NAMES } = consts;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const VolunteerHeaderPersonal = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(ScreenName.VolunteerPersonal)}
      accessibilityLabel={consts.a11yLabel.shareIcon}
      accessibilityHint={consts.a11yLabel.shareHint}
    >
      <Icon.VolunteerPersonal color={colors.lightestText} style={style} />
    </TouchableOpacity>
  );
};

export const VolunteerHeaderProfile = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate({
          name: ScreenName.VolunteerIndex,
          params: {
            title: 'Mein Profil',
            query: QUERY_TYPES.VOLUNTEER.PROFILE,
            queryVariables: {},
            rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
          }
        })
      }
      accessibilityLabel={consts.a11yLabel.shareIcon}
      accessibilityHint={consts.a11yLabel.shareHint}
    >
      <Icon.Settings color={colors.lightestText} style={style} />
    </TouchableOpacity>
  );
};
