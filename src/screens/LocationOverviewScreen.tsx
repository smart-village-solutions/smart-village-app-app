import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps } from 'react-navigation';

import { Icon, LocationOverview } from '../components';
import { colors, normalize } from '../config';
import { arrowLeft } from '../icons';

export const LocationOverviewScreen = ({ navigation }: { navigation: NavigationScreenProps }) => {
  return (
    <LocationOverview navigation={navigation} />
  );
};

// navigation will be overhauled soon with the upgrade to eact navigation 5
LocationOverviewScreen.navigationOptions = ({ navigation }: { navigation: any }) => {
  return {
    headerLeft: (
      <View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Zurück Taste"
          accessibilityHint="Navigieren zurück zur vorherigen Seite"
        >
          <Icon xml={arrowLeft(colors.lightestText)} style={styles.icon} />
        </TouchableOpacity>
      </View>
    )
  };
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});

