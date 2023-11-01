import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useQuery } from 'react-query';

import { SettingsContext } from '../../SettingsProvider';
import { colors, normalize, texts } from '../../config';
import { sueParser } from '../../helpers';
import { useSueData } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingContainer } from '../LoadingContainer';
import { RegularText } from '../Text';
import { TextListItem } from '../TextListItem';
import { Wrapper } from '../Wrapper';
import { Map } from '../map';

type Props = {
  navigation: StackNavigationProp<Record<string, any>>;
  queryVariables: any;
  route: RouteProp<any, never>;
};

type ItemProps = {
  position: { latitude: number; longitude: number };
  serviceRequestId: string;
  title: string;
};

const mapToMapMarkers = (items: ItemProps[]): MapMarker[] | undefined =>
  items
    ?.filter((item) => item.position?.latitude && item.position?.longitude)
    ?.map((item: ItemProps) => ({
      iconAnchor: undefined,
      iconName: undefined,
      id: item.serviceRequestId,
      position: {
        latitude: item.position.latitude,
        longitude: item.position.longitude
      },
      title: item.title
    }));

export const SueMapView = ({ navigation, queryVariables }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const [selectedService, setSelectedService] = useState<string>();

  const { data, isLoading } = useSueData({ query: QUERY_TYPES.SUE.REQUESTS, queryVariables });

  const { data: detailsData } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, selectedService],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID)(selectedService),
    { enabled: !!selectedService }
  );

  const mapMarkers = useMemo(() => {
    return mapToMapMarkers(data);
  }, [data]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  if (!mapMarkers?.length) {
    return (
      <Wrapper>
        <RegularText placeholder small center>
          {texts.map.noGeoLocations}
        </RegularText>
      </Wrapper>
    );
  }

  const item = detailsData
    ? sueParser(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, [detailsData])?.[0]
    : undefined;

  return (
    <>
      <Map
        isMultipleMarkersMap
        locations={mapMarkers}
        mapStyle={styles.map}
        onMarkerPress={setSelectedService}
        selectedMarker={selectedService}
      />
      {!!selectedService && !!item && (
        <Wrapper
          small
          style={[styles.listItemContainer, stylesWithProps({ navigationType }).position]}
        >
          <TextListItem item={item} leftImage navigation={navigation} />
        </Wrapper>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  listItemContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    left: '4%',
    position: 'absolute',
    right: '4%',
    width: '92%',
    // shadow:
    elevation: 2,
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 5,
      width: 0
    },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  map: {
    height: '100%',
    width: '100%'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ navigationType }: { navigationType: string }) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '8%' : '4%'
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
