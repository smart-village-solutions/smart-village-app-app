import React from 'react';
import { Button, Platform, View } from 'react-native';

import { colors } from '../config';

export const defaultStackNavigatorConfig = (initialRouteName) => {
  return {
    initialRouteName,
    URIPrefix: 'smart-village-app://',
    defaultNavigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: colors.primary
      },
      headerTintColor: colors.lightestText,
      headerTitleStyle: {
        fontWeight: 'bold'
      },
      headerRight: (
        <Button
          title="="
          onPress={() => navigation.openDrawer()}
          color={Platform.OS === 'ios' ? colors.lightestText : colors.primary}
        />
      )
    })
  };
};
