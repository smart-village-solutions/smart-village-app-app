import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../config';
import { useVolunteerNavigation } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

const { a11yLabel, ROOT_ROUTE_NAMES } = consts;

type Props = {
  navigation: StackNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const GroupHeader = ({ navigation, style }: Props) => {
  const volunteerNavigation = useVolunteerNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        volunteerNavigation(() =>
          navigation.navigate({
            name: ScreenName.VolunteerForm,
            params: {
              title: texts.volunteer.groupNew,
              query: QUERY_TYPES.VOLUNTEER.GROUP,
              rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
            }
          })
        )
      }
      accessibilityLabel={a11yLabel.groupIcon}
      accessibilityHint={a11yLabel.groupHint}
      accessibilityRole="button"
    >
      <Icon.Plus
        color={colors.darkText}
        style={[style, styles.icon]}
        size={normalize(28)}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(6)
  }
});
