import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../../config';
import { QUERY_TYPES } from '../../queries';

const { ROOT_ROUTE_NAMES } = consts;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const VolunteerHeader = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate({
          name: 'VolunteerIndex',
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
      <Icon.VolunteerProfile color={colors.lightestText} style={style} />
    </TouchableOpacity>
  );
};
