import React, { useCallback, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebviewLeafletMessage } from 'react-native-webview-leaflet';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

import { colors, normalize } from '../../config';
import { getQuery, QUERY_TYPES } from '../../queries';
import { LoadingContainer } from '../LoadingContainer';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { PointOfInterest } from '../screens';
import { WebViewMap } from './WebViewMap';

type Props = {
  navigation: NavigationScreenProps
}

const mapToMapMarkers = (data: any) => {
  return data?.[QUERY_TYPES.POINTS_OF_INTEREST]?.map(
    (item: any) => {
      const { latitude, longitude } = item.location.geoLocation;

      return {
        id: item.id,
        position: {
          lat: latitude,
          lng: longitude
        }
      };
    }
  );
};

export const LocationOverview = ({ navigation }: Props) => {
  // FIXME add own query for selected POI to get the other data fields as well
  const [selectedLocation, setSelectedLocation] = useState<any>();

  const overviewQuery = getQuery(QUERY_TYPES.POINTS_OF_INTEREST);
  const { data, loading } = useQuery(overviewQuery, { variables: { limit: 10, orderPoi: 'RAND', orderTour: 'RAND' } });

  const onMessageReceived = useCallback((message: WebviewLeafletMessage) => {
    if (message.event === 'onMapMarkerClicked') {
      setSelectedLocation(
        data?.[QUERY_TYPES.POINTS_OF_INTEREST]?.find((item: any) => item.id === message.payload?.mapMarkerID)
      );
    }
  }, [setSelectedLocation, data]);

  if (loading || !data?.[QUERY_TYPES.POINTS_OF_INTEREST]) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WebViewMap
          locations={mapToMapMarkers(data)}
          onMessageReceived={onMessageReceived}
          style={styles.map}
        />
        <View style={styles.details}>
          {!!selectedLocation && <PointOfInterest data={selectedLocation} navigation={navigation} hideMap />}
        </View>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: normalize(200)
  },
  details: {
    flex: 1,
    width: '100%'
  }
});
