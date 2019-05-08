import React from 'react';
import { Button, Platform, View } from 'react-native';

export const defaultStackNavigatorConfig = (initialRouteName) => {
  return {
    initialRouteName,
    URIPrefix: 'smart-village-app://',
    defaultNavigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: '#08743c'
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold'
      },
      headerRight: (
        <View style={{ flexDirection: 'row' }}>
          <Button
            title="="
            onPress={() => navigation.openDrawer()}
            color={Platform.OS === 'ios' ? '#fff' : '#08743c'}
          />
        </View>
      )
    })
  };
};
