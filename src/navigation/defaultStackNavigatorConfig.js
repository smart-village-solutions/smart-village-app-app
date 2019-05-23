import React from 'react';
import { Image, Platform } from 'react-native';
import { LinearGradient } from 'expo';
import { colors } from '../config';

export const defaultStackNavigatorConfig = (initialRouteName) => {
  return {
    initialRouteName,
    URIPrefix: 'smart-village-app://',
    defaultNavigationOptions: ({ navigation }) => ({
      headerBackground: (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      ),
      headerTitleStyle: {
        fontWeight: '200',
        color: colors.lightestText
      },
      headerRight: (
        <Image
          source={require('../drower-menu.png')}
          color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
          onPress={() => navigation.openDrawer()}
        />
      ),
      headerRightContainerStyle: {
        marginRight: '5%'
      },
      headerLeftContainerStyle: {
        marginLeft: '3%'
      }
    })
  };
};

// header gradient from here  https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
// for some wird reason i can't position menu and share icons in detail screen!!!!
// plan for tomorrow :
// -understand how props for stacknavigation work.
// why can't I style all about header just in this file ?
// what is this static navigation option in detail screen? it doen't aloud me to
// style headerRightContainerStyle in it
