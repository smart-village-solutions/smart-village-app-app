import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { consts, Icon, normalize, texts } from '../config';
import { useVolunteerNavigation } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

const { a11yLabel, ROOT_ROUTE_NAMES } = consts;

type Props = {
  navigation: StackNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const CalendarHeader = ({ navigation, style }: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const volunteerNavigation = useVolunteerNavigation();

  return (
    <TouchableOpacity
      onPress={() =>
        volunteerNavigation(() =>
          navigation.navigate({
            name: ScreenName.VolunteerForm,
            params: {
              title: texts.volunteer.calendarNew,
              query: QUERY_TYPES.VOLUNTEER.CALENDAR,
              rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
            }
          })
        )
      }
      accessibilityLabel={a11yLabel.calendarIcon}
      accessibilityHint={a11yLabel.calendarHint}
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

const createStyles = () => ({
  icon: {
    paddingHorizontal: normalize(6)
  }
});
