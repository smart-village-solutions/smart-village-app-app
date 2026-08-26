import { StackNavigationProp } from 'expo-router/js-stack';
import React, { useContext } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { consts, Icon, normalize } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

const { a11yLabel } = consts;

type Props = {
  navigation: StackNavigationProp<Record<string, object | undefined>>;
  style: StyleProp<ViewStyle>;
};

export const SearchHeader = ({ navigation, style }: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { search } = settings;

  if (!search) return null;

  return (
    <HeaderIconButton
      onPress={() =>
        navigation.navigate({
          name: ScreenName.Search
        })
      }
      accessibilityLabel={a11yLabel.searchIcon}
      accessibilityHint={a11yLabel.searchHint}
    >
      <Icon.Search
        color={colors.darkText}
        size={HEADER_RIGHT_ICON_SIZE}
        style={[style, styles.icon]}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};

const createStyles = () => ({
  icon: {
    paddingHorizontal: normalize(3)
  }
});
