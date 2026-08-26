import { StackNavigationProp } from 'expo-router/js-stack';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { consts, Icon, normalize, texts } from '../config';
import { useVolunteerNavigation } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

const { a11yLabel, ROOT_ROUTE_NAMES } = consts;

type Props = {
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  style: StyleProp<ViewStyle>;
};

export const GroupHeader = ({ navigation, style }: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const volunteerNavigation = useVolunteerNavigation();

  return (
    <HeaderIconButton
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
    >
      <Icon.Plus
        color={colors.darkText}
        style={[style, styles.icon]}
        size={HEADER_RIGHT_ICON_SIZE}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};

const createStyles = () => ({
  icon: {
    paddingHorizontal: normalize(6)
  }
});
