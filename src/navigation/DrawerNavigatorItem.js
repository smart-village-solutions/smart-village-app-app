import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { Text, Touchable } from '../components';
import { colors, normalize } from '../config';

export const DrawerNavigatorItem = ({ activeRoute, itemInfo, navigation, topDivider }) => {
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

const styles = StyleSheet.create({
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
