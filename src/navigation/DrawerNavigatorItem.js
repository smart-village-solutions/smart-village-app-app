import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { Text, Touchable } from '../components';
import { normalize } from '../config';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

export const DrawerNavigatorItem = ({ activeRoute, itemInfo, navigation, topDivider }) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const focused =
    (activeRoute?.params?.rootRouteName ?? 'AppStack') === itemInfo.params.rootRouteName;
  const fontFamily = focused ? 'bold' : 'regular';
  const accessibilityLabel = itemInfo.params.title;

  const handleItemPress = () => {
    navigation.navigateDeprecated(itemInfo.screen, {
      ...itemInfo.params,
      subQuery: itemInfo.params.subQuery ?? undefined
    });
    navigation.closeDrawer();
  };

  return (
    <View key={itemInfo.params.title}>
      {topDivider && <Divider style={styles.divider} />}
      <Touchable
        accessible
        accessibilityLabel={accessibilityLabel}
        onPress={handleItemPress}
        delayPressIn={0}
      >
        <Text style={[styles.label, { color: colors.lightestText }, { fontFamily }]}>
          {itemInfo.label ?? itemInfo.params.title}
        </Text>
      </Touchable>
      <Divider style={styles.divider} />
    </View>
  );
};

const createStyles = (colors) => ({
  label: {
    fontFamily: 'regular',
    fontSize: normalize(16),
    lineHeight: normalize(22),
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(12)
  },

  divider: {
    backgroundColor: colors.surface,
    height: StyleSheet.hairlineWidth,
    opacity: 0.3
  }
});

DrawerNavigatorItem.propTypes = {
  activeRoute: PropTypes.object.isRequired,
  itemInfo: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  topDivider: PropTypes.bool
};
