import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import { LocationObject } from 'expo-location';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, normalize, texts } from '../../config';
import { graphqlFetchPolicy, isOpen, parseListItemsFromQuery } from '../../helpers';
import * as Icons from '../../icons';
import { location, locationIconAnchor } from '../../icons';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingContainer } from '../LoadingContainer';
import { RegularText } from '../Text';
import { TextListItem } from '../TextListItem';
import { Wrapper } from '../Wrapper';

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

        let icon = location;

        if (item.category?.iconName) {
          // remove location and locationIconAnchor from Icons for proper type perspective to all
          // the other icons
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { location: _l, locationIconAnchor: _lia, ...OtherIcons } = Icons;
          const iconName = item.category.iconName as keyof typeof OtherIcons;

          // only use the icon if it is available from our icons
          if (Object.keys(OtherIcons).includes(iconName)) {
            icon = OtherIcons[iconName] as (color: any) => string;
          }
        }

        return {
          icon: icon(colors.primary),
          activeIcon: icon(colors.accent),
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

export const LocationOverview = ({ filterByOpeningTimes, navigation, queryVariables }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType = 'drawer' } = globalSettings;
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();
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
        <ActivityIndicator color={colors.refreshControl} />
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
        isMultipleMarkersMap
        locations={mapMarkers}
        mapStyle={styles.map}
        onMarkerPress={setSelectedPointOfInterest}
        selectedMarker={selectedPointOfInterest}
      />
      {selectedPointOfInterest && !detailsLoading && (
        <Wrapper
          small
          style={[
            styles.listItemContainer,
            stylesWithProps({ navigation: navigationType }).position
          ]}
        >
          <TextListItem
            item={{
              ...item,
              bottomDivider: false,
              picture: item?.picture?.url
                ? item.picture
                : {
                    url: 'https://fileserver.smart-village.app/hb-meinquartier/app-icon.png'
                  },
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
const stylesWithProps = ({ navigation }: { navigation: string }) => {
  return StyleSheet.create({
    position: {
      bottom: navigation === 'tab' ? '4%' : '8%'
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
