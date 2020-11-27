import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from '../components';

import { LocationOverview } from '../components/LocationOverview';
import { colors, normalize } from '../config';
import { arrowLeft } from '../icons';

const locations = [
  {
    lat: 53.61241201890862,
    lng: 9.900906974592688,
    name: 'Julian\'s home'
  },
  {
    lat: 53.61230409968637,
    lng: 9.899137616157534,
    name: 'Someone else\'s home'
  }
];

export const LocationOverviewScreen = () => {
  return (
    <LocationOverview locations={locations} />
  );
};

// navigation will be overhauled soon with the upgrade to eact navigation 5
LocationOverviewScreen.navigationOptions = ({ navigation }: {navigation: any}) => {
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

