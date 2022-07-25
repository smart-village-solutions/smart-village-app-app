import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Map, RegularText, Wrapper, WrapperRow, WrapperVertical } from '../components';
import { colors, Icon, normalize } from '../config';

export const MapViewScreen = ({ navigation, route }) => {
  const {
    isAugmentedReality,
    isMaximizeButtonVisible,
    locations,
    onMarkerPress,
    showsUserLocation
  } = route?.params;


  return (
      <Map
        {...{
          isMaximizeButtonVisible,
          locations,
          mapStyle: styles.mapStyle,
          showsUserLocation
        }}
      />
  );
};

const styles = StyleSheet.create({
  mapStyle: {
    width: '100%',
    height: '100%'
  }
});

MapViewScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object
};
