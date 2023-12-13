import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { colors, normalize, texts } from '../../config';
import { graphqlFetchPolicy, isOpen, parseListItemsFromQuery } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingContainer } from '../LoadingContainer';
import { RegularText } from '../Text';
import { TextListItem } from '../TextListItem';
import { Wrapper } from '../Wrapper';

import { Map, MapIcon } from './Map';

type Props = {
  filterByOpeningTimes?: boolean;
  navigation: StackNavigationProp<Record<string, any>>;
  queryVariables: {
    category?: string;
    categoryId?: string | number;
    dataProvider?: string;
    initialFilter?: 'map' | 'list';
  };
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
          iconName: item.category.iconName,
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
export const LocationOverview = ({ filterByOpeningTimes, navigation, queryVariables }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings, locationSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const { defaultAlternativePosition } = locationSettings || {};

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

  if (item && !item.picture?.url) {
    item.leftIcon = (
      <View style={[styles.iconContainer, styles.imageSize]}>
        {!!item.iconName && (
          <MapIcon iconColor={colors.primary} iconName={item.iconName} iconSize={normalize(24)} />
        )}
      </View>
    );
  }

  return (
    <>
      <Map
        isMultipleMarkersMap
        locations={mapMarkers}
        mapCenterPosition={
          queryVariables?.initialFilter === 'map' && defaultAlternativePosition?.coords
            ? {
                latitude: defaultAlternativePosition.coords.lat,
                longitude: defaultAlternativePosition.coords.lng
              }
            : undefined
        }
        mapStyle={styles.map}
        onMarkerPress={setSelectedPointOfInterest}
        selectedMarker={selectedPointOfInterest}
      />
      {selectedPointOfInterest && !detailsLoading && (
        <View style={[styles.listItemContainer, stylesWithProps({ navigationType }).position]}>
          <TextListItem
            containerStyle={styles.textListItemContainer}
            imageContainerStyle={styles.imageRadius}
            imageStyle={styles.imageSize}
            item={{
              ...item,
              bottomDivider: false,
              picture: item?.picture?.url ? item.picture : undefined
            }}
            leftImage={!!item?.picture?.url}
            listItemStyle={styles.listItem}
            listsWithoutArrows
            navigation={navigation}
          />
        </View>
      )}
    </>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.gray10,
    borderBottomLeftRadius: normalize(8),
    borderTopLeftRadius: normalize(8),
    justifyContent: 'center'
  },
  imageSize: {
    height: normalize(96),
    width: normalize(96)
  },
  imageRadius: {
    borderBottomLeftRadius: normalize(12),
    borderTopLeftRadius: normalize(12)
  },
  listItemContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(8),
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
  listItem: {
    marginTop: normalize(16)
  },
  map: {
    height: '100%',
    width: '100%'
  },
  textListItemContainer: {
    alignItems: 'flex-start',
    paddingVertical: 0,
    padding: 0
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
