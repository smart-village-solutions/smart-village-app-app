import React from 'react';
import { Platform, View, TouchableOpacity } from 'react-native';

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
        fontFamily: 'titillium-web-regular',
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

// for some wird reason i can't position menu and share icons in detail screen!!!!
// plan for tomorrow :
// -understand how props for stacknavigation work.
// why can't I style all about header just in this file ?
// what is this static navigation option in detail screen? it doen't aloud me to
// style headerRightContainerStyle in it
