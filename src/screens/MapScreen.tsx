import { useRoute } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import { LoadingSpinner, MapLibre } from '../components';
import { useMapSettings } from '../hooks';
import { getQuery, QUERY_TYPES } from '../queries';
import { ReactQueryClient } from '../ReactQueryClient';
import { SettingsContext } from '../SettingsProvider';

export const MapScreen = () => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const route = useRoute();
  const { locations, onMarkerPress, showsUserLocation } = route?.params ?? {};

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
    [poi.category.iconName]: 1,
    iconName: poi.category.iconName,
    iconUrl: poi.category.iconUrl,
    id: poi.id,
    position: {
      latitude: poi.addresses?.[0]?.geoLocation?.latitude,
      longitude: poi.addresses?.[0]?.geoLocation?.longitude
    },
    serviceName: poi.name,
    title: poi.name
  }));

  if (isLoading || loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <MapLibre
      {...{
        locations: locations || pois,
        mapStyle: styles.map,
        onMarkerPress,
        showsUserLocation
      }}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%'
  }
});
