import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { LocationObject } from 'expo-location';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { colors, texts } from '../../config';
import { graphqlFetchPolicy, isOpen } from '../../helpers';
import { location, locationIconAnchor, ownLocation, ownLocationIconAnchor } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingContainer } from '../LoadingContainer';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { PointOfInterest } from '../screens/PointOfInterest';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

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
          position: {
            latitude,
            longitude
          }
        };
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item !== undefined)
  );
};

export const LocationOverview = ({
  filterByOpeningTimes,
  navigation,
  position,
  queryVariables,
  route
}: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime: undefined });

  const overviewQuery = getQuery(QUERY_TYPES.POINTS_OF_INTEREST);
  const { data: overviewData, loading } = useQuery(overviewQuery, {
    fetchPolicy,
    variables: queryVariables
  });

  let pointsOfInterest: any[] | undefined = overviewData?.[QUERY_TYPES.POINTS_OF_INTEREST];

  if (filterByOpeningTimes && pointsOfInterest) {
    pointsOfInterest = pointsOfInterest.filter((entry) => isOpen(entry.openingHours)?.open);
  }

  const detailsQuery = getQuery(QUERY_TYPES.POINT_OF_INTEREST);
  const { data: detailsData, loading: detailsLoading } = useQuery(detailsQuery, {
    fetchPolicy,
    variables: { id: selectedPointOfInterest },
    skip: !selectedPointOfInterest
  });

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  const mapMarkers = mapToMapMarkers(pointsOfInterest);

  // position &&
  //   mapMarkers?.push({
  //     icon: ownLocation(colors.accent),
  //     iconAnchor: ownLocationIconAnchor,
  //     position: {
  //       ...position.coords
  //     }
  //   });

  if (!mapMarkers?.length) {
    return (
      <Wrapper>
        <RegularText>{texts.map.noGeoLocations}</RegularText>
      </Wrapper>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
          <Map locations={mapMarkers} onMarkerPress={setSelectedPointOfInterest} />
          <View>
            {!selectedPointOfInterest && (
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
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
