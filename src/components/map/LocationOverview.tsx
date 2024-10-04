import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, normalize } from '../../config';
import {
  geoLocationFilteredListItem,
  graphqlFetchPolicy,
  isOpen,
  parseListItemsFromQuery
} from '../../helpers';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingContainer } from '../LoadingContainer';
import { TextListItem } from '../TextListItem';
import { Wrapper } from '../Wrapper';

import { Map } from './Map';

type Props = {
  currentPosition?: LocationObject;
  filterByOpeningTimes?: boolean;
  navigation: StackNavigationProp<Record<string, any>>;
  position?: LocationObject;
  queryVariables: {
    category?: string;
    categoryId?: string | number;
    dataProvider?: string;
    radiusSearch?: {
      currentPosition?: boolean;
      distance: number;
      index: number;
    };
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
          iconName: item.category?.iconName,
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

/* eslint-disable complexity */
export const LocationOverview = ({
  currentPosition,
  filterByOpeningTimes,
  navigation,
  queryVariables
}: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { locationSettings } = useLocationSettings();
  const [isLocationAlertShow, setIsLocationAlertShow] = useState(false);

  const { data: overviewData, loading } = useQuery(getQuery(QUERY_TYPES.POINTS_OF_INTEREST), {
    fetchPolicy,
    variables: {
      ...queryVariables,
      // if we show the map, we need to fetch all the entries at once and not a limited amount
      limit: undefined
    }
  });

  let pointsOfInterest: any[] | undefined = overviewData?.[QUERY_TYPES.POINTS_OF_INTEREST];

  if (filterByOpeningTimes && pointsOfInterest) {
    pointsOfInterest = pointsOfInterest.filter((entry) => isOpen(entry.openingHours)?.open);
  }

  if (queryVariables?.radiusSearch?.distance) {
    pointsOfInterest = geoLocationFilteredListItem({
      isLocationAlertShow,
      currentPosition,
      listItem: pointsOfInterest,
      locationSettings,
      navigation,
      queryVariables,
      setIsLocationAlertShow
    });
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
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const mapMarkers = mapToMapMarkers(pointsOfInterest);

  const item = detailsData
    ? parseListItemsFromQuery(
        QUERY_TYPES.POINT_OF_INTEREST,
        {
          ...detailsData,
          [QUERY_TYPES.POINT_OF_INTEREST]: [detailsData?.[QUERY_TYPES.POINT_OF_INTEREST]]
        },
        undefined,
        {
          queryVariables
        }
      )?.[0]
    : undefined;

  return (
    <>
      <Map
        currentPosition={currentPosition}
        isMultipleMarkersMap
        locations={mapMarkers}
        mapStyle={styles.map}
        onMarkerPress={setSelectedPointOfInterest}
        selectedMarker={selectedPointOfInterest}
      />
      {selectedPointOfInterest && !detailsLoading && (
        <Wrapper
          small
          style={[styles.listItemContainer, stylesWithProps({ navigationType }).position]}
        >
          <TextListItem
            item={{
              ...item,
              bottomDivider: false,
              subtitle: undefined
            }}
            leftImage
            navigation={navigation}
          />
        </Wrapper>
      )}
    </>
  );
};
/* eslint-enable complexity */

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
