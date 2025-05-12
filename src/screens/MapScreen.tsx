import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import { LoadingSpinner, MapLibre } from '../components';
import { consts } from '../config';
import { useMapSettings } from '../hooks';
import { getQuery, QUERY_TYPES } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

const { MAP } = consts;

export const MapScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const route = useRoute();
  const { locations, onMarkerPress, showsUserLocation } = route?.params ?? {};
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();

  const { data: mapSettings, loading } = useMapSettings();

  const { data, refetch, isLoading } = useQuery(
    [QUERY_TYPES.POINTS_OF_INTEREST, mapSettings?.queryVariables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(
        getQuery(QUERY_TYPES.POINTS_OF_INTEREST),
        mapSettings?.queryVariables
      );
    },
    {
      enabled: !loading && !!mapSettings?.queryVariables
    }
  );

  const pois = data?.[QUERY_TYPES.POINTS_OF_INTEREST]?.map((poi) => ({
    [poi.category.iconName || MAP.DEFAULT_PIN]: 1,
    iconName: poi.category.iconName || MAP.DEFAULT_PIN,
    id: poi.id,
    position: {
      latitude: poi.addresses?.[0]?.geoLocation?.latitude,
      longitude: poi.addresses?.[0]?.geoLocation?.longitude
    },
    serviceName: poi.name,
    title: poi.name
  }));

  const navigation = useNavigation();
  if (isLoading || loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <MapLibre
      {...{
        locations: locations || pois,
        mapStyle: styles.map,
        onMarkerPress: onMarkerPress || setSelectedPointOfInterest,
        onMaximizeButtonPress: () => {
          navigation.navigate(ScreenName.MapView, {
            locations: locations || pois
          });
        },
        selectedMarker: selectedPointOfInterest,
        showsUserLocation
      }}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    height: '100%',
    width: '100%'
  }
});
