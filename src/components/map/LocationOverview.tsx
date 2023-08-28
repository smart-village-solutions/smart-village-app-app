import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { LocationObject } from 'expo-location';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, device, normalize, texts } from '../../config';
import { graphqlFetchPolicy, isOpen } from '../../helpers';
import { location, locationIconAnchor } from '../../icons';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingContainer } from '../LoadingContainer';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { RegularText } from '../Text';
import { Wrapper } from '../Wrapper';
import { PointOfInterest } from '../screens/PointOfInterest';

import { Map } from './Map';

type Props = {
  filterByOpeningTimes?: boolean;
  position?: LocationObject;
  navigation: StackNavigationProp<never>;
  queryVariables: {
    category?: string;
    categoryId?: string | number;
    dataProvider?: string;
  };
  route: RouteProp<any, never>;
  showPOIsFullScreenMap?: boolean;
};

// FIXME: with our current setup the data that we receive from a query is not typed
// if we change that then we can fix this place
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToMapMarkers = (pointsOfInterest: any): MapMarker[] | undefined => {
  return (
    pointsOfInterest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((item: any) => {
        const latitude = item.addresses?.[0]?.geoLocation?.latitude;
        const longitude = item.addresses?.[0]?.geoLocation?.longitude;

        if (!latitude || !longitude) return undefined;

        return {
          icon: location(colors.primary),
          iconAnchor: locationIconAnchor,
          id: item.id,
          images: item.mediaContents,
          position: { latitude, longitude },
          title: item.name,
          details: item
        };
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item !== undefined)
  );
};

export const LocationOverview = ({
  filterByOpeningTimes,
  navigation,
  queryVariables,
  route,
  showPOIsFullScreenMap
}: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType = 'drawer' } = globalSettings;

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime: undefined });

  const { data: overviewData, loading } = useQuery(getQuery(QUERY_TYPES.POINTS_OF_INTEREST), {
    fetchPolicy,
    variables: queryVariables
  });

  let pointsOfInterest: any[] | undefined = overviewData?.[QUERY_TYPES.POINTS_OF_INTEREST];

  if (filterByOpeningTimes && pointsOfInterest) {
    pointsOfInterest = pointsOfInterest.filter((entry) => isOpen(entry.openingHours)?.open);
  }

  const { data: detailsData, loading: detailsLoading } = useQuery(
    getQuery(QUERY_TYPES.POINT_OF_INTEREST),
    {
      fetchPolicy,
      variables: { id: selectedPointOfInterest },
      skip: !selectedPointOfInterest
    }
  );

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const mapMarkers = mapToMapMarkers(pointsOfInterest);

  if (!mapMarkers?.length) {
    return (
      <Wrapper>
        <RegularText placeholder small center>
          {texts.map.noGeoLocations}
        </RegularText>
      </Wrapper>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView scrollEnabled={!showPOIsFullScreenMap}>
        <Map
          isMultipleMarkersMap
          locations={mapMarkers}
          mapStyle={showPOIsFullScreenMap && stylesWithProps({ navigationType }).mapHeight}
          onMarkerPress={setSelectedPointOfInterest}
          showPOIsFullScreenMap={showPOIsFullScreenMap}
        />
        <View>
          {!selectedPointOfInterest && !showPOIsFullScreenMap && (
            <Wrapper>
              <RegularText center>{texts.locationOverview.noSelection}</RegularText>
            </Wrapper>
          )}
          {detailsLoading ? (
            <LoadingContainer>
              <ActivityIndicator color={colors.accent} />
            </LoadingContainer>
          ) : (
            !!detailsData?.[QUERY_TYPES.POINT_OF_INTEREST] && (
              <PointOfInterest
                data={detailsData[QUERY_TYPES.POINT_OF_INTEREST]}
                navigation={navigation}
                hideMap
                route={route}
              />
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const stylesWithProps = ({ navigationType }: { navigationType: string }) => {
  return StyleSheet.create({
    mapHeight: {
      height:
        navigationType === 'drawer'
          ? device.height - normalize(120)
          : device.height - normalize(160)
    }
  });
};
