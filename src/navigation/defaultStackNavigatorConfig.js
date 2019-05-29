import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CardStackStyleInterpolator from 'react-navigation-stack/src/views/StackView/StackViewStyleInterpolator';

import { colors, normalize } from '../config';
import { DiagonalGradient, Icon } from '../components';
import { drawerMenu } from '../icons';

export const defaultStackNavigatorConfig = (initialRouteName) => {
  return {
    initialRouteName,
    URIPrefix: 'smart-village-app://',
    defaultNavigationOptions: ({ navigation }) => ({
      //header gradient https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
      headerBackground: <DiagonalGradient />,
      headerTitleStyle: {
        color: colors.lightestText,
        fontFamily: 'titillium-web-regular',
        fontWeight: '400'
      },
      headerRight: (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon icon={drawerMenu(colors.lightestText)} style={styles.icon} />
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
    paddingHorizontal: normalize(14)
  }
});
