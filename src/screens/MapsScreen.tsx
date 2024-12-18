import React, { useState } from 'react';
import { View } from 'react-native';

import { Map, MapboxComponent } from '../components';
import { service } from '../icons';

export const MapsScreen = ({ route }: { route: { params: any } }) => {
  const { mapComponent } = route.params || {};
  const [selectedMarker, setSelectedMarker] = useState<string | undefined>(undefined);

  const locations = [
    {
      iconName: '',
      id: '695',
      position: { latitude: 52.141720850254, longitude: 12.582997157407 },
      serviceName: 'Service Name 1',
      title: 'Title 1'
    },
    {
      iconName: '',
      id: '697',
      position: { latitude: 52.141110797693, longitude: 12.587897232524 },
      serviceName: 'Service Name 2',
      title: 'Title 2'
    }
  ];

  if (mapComponent === 'Mapbox') {
    return (
      <MapboxComponent
        calloutTextEnabled
        locations={locations}
        mapStyle={{ flex: 1 }}
        onMarkerPress={setSelectedMarker}
        selectedMarker={selectedMarker}
      />
    );
  } else if (mapComponent === 'react-native-maps') {
    return (
      <Map
        calloutTextEnabled
        locations={locations}
        mapStyle={{ flex: 1 }}
        onMarkerPress={setSelectedMarker}
        selectedMarker={selectedMarker}
      />
    );
  }

  return <View />;
};
