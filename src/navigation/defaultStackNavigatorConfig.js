import React from 'react';
import { TouchableOpacity } from 'react-native';

import { colors } from '../config';
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
        fontWeight: '400'
      },
      headerRight: (
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Icon icon={drawerMenu(colors.lightestText)} style={{ padding: 10 }} />
        </TouchableOpacity>
      ),
      headerRightContainerStyle: {},
      headerLeftContainerStyle: {}
    })
  };
};
