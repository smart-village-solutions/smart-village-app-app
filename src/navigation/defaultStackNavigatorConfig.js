import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CardStackStyleInterpolator from 'react-navigation-stack/src/views/StackView/StackViewStyleInterpolator';

import { colors, consts, device, normalize } from '../config';
import { DiagonalGradient, Icon } from '../components';
import { drawerMenu } from '../icons';

export const defaultStackNavigatorConfig = (initialRouteName, headerRight = true) => {
  return {
    initialRouteName,
    URIPrefix: 'smart-village-app://',
    defaultNavigationOptions: ({ navigation }) => ({
      // header gradient:
      // https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
      headerBackground: <DiagonalGradient />,
      headerTitleStyle: {
        color: colors.lightestText,
        fontFamily: device.platform === 'ios' ? 'titillium-web-bold' : 'titillium-web-regular',
        fontSize: normalize(20),
        fontWeight: '400',
        lineHeight: normalize(29)
      },
      headerTitleContainerStyle: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
      },
      headerRight: headerRight && (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          accessibilityLabel={consts.a11yLabel.openMenuIcon}
          accessibilityHint={consts.a11yLabel.menuHint}
        >
          <Icon xml={drawerMenu(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      )
    }),
    transitionConfig: () => ({
      screenInterpolator: (sceneProps) => {
        return CardStackStyleInterpolator.forHorizontal(sceneProps);
      }
    })
  };
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(4)
  }
});
