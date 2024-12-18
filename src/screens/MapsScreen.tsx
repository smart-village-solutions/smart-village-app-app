import React from 'react';
import { View } from 'react-native';

import { MapboxComponent } from '../components';

export const MapsScreen = ({ route }: { route: { params: any } }) => {
  const { mapComponent } = route.params || {};

  const locations = [
    {
      iconName: '',
      id: '695',
      position: { latitude: 52.141720850254, longitude: 12.582997157407 }
    },
    { iconName: '', id: '697', position: { latitude: 52.141110797693, longitude: 12.587897232524 } }
  ];

  if (mapComponent === 'Mapbox') {
    return <MapboxComponent locations={locations} />;
  }

  return <View />;
};
