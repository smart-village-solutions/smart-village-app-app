import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LocationObject, LocationObjectCoords } from 'expo-location';
import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkContext } from '../../NetworkProvider';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { Icon, colors, consts, device, normalize } from '../../config';
import {
  geoLocationFilteredListItem,
  graphqlFetchPolicy,
  isOpen,
  parseListItemsFromQuery
} from '../../helpers';
import { useLocationSettings } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { TextListItem } from '../TextListItem';
import { getLocationMarker } from '../settings';

import { ChipFilter } from './ChipFilter';
import { MapLibre } from './MapLibre';

const { MAP } = consts;

type Props = {
  currentPosition?: LocationObject;
  filterByOpeningTimes?: boolean;
  navigation: StackNavigationProp<Record<string, any>>;
  position?: LocationObject;
  queryVariables: {
    category?: string;
    categoryId?: string | number;
    categoryIds?: string[] | number[];
    dataProvider?: string;
    initialFilter?: 'map' | 'list';
    radiusSearch?: {
      currentPosition?: boolean;
      distance: number;
      index: number;
    };
  };
  route: RouteProp<Record<string, any>, string>;
};

// FIXME: with our current setup the data that we receive from a query is not typed
// if we change that then we can fix this place
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToMapMarkers = (
  pointsOfInterest: any,
  alternativePosition: any
): MapMarker[] | undefined => {
  const markers = pointsOfInterest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.map((item: any) => {
      const latitude = item.addresses?.[0]?.geoLocation?.latitude;
      const longitude = item.addresses?.[0]?.geoLocation?.longitude;

      if (!latitude || !longitude) return undefined;

      return {
        [item.category.iconName || MAP.DEFAULT_PIN]: 1,
        iconName: item.category.iconName || MAP.DEFAULT_PIN,
        id: item.id,
        position: {
          latitude,
          longitude
        }
      };
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((item: any) => item !== undefined);

  if (alternativePosition) {
    markers.push(getLocationMarker(alternativePosition));
  }

  return markers;
};

/* eslint-disable complexity */
export const LocationOverview = ({
  currentPosition,
  filterByOpeningTimes,
  navigation,
  queryVariables,
  route
}: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const { locationSettings } = useLocationSettings();
  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [isLocationAlertShow, setIsLocationAlertShow] = useState(false);
  const isPreviewWithoutNavigation = route.params?.isPreviewWithoutNavigation ?? false;

  const {
    data: overviewData,
    loading,
    refetch
  } = useQuery(getQuery(QUERY_TYPES.POINTS_OF_INTEREST), {
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
    return <LoadingSpinner loading />;
  }

  const mapMarkers = mapToMapMarkers(pointsOfInterest, alternativePosition);

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
    const SelectedIcon = item?.iconName
      ? Icon[_upperFirst(item.iconName) as keyof typeof Icon]
      : undefined;

    item.leftIcon = (
      <View style={[styles.iconContainer, styles.imageSize]}>
        {!!SelectedIcon && <SelectedIcon color={colors.darkerPrimary} />}
      </View>
    );
  }

  let mapCenterPosition = {} as LocationObjectCoords;

  if (alternativePosition) {
    mapCenterPosition = getLocationMarker(alternativePosition).position;
  } else if (defaultAlternativePosition) {
    mapCenterPosition = getLocationMarker(defaultAlternativePosition).position;
  }

  return (
    <>
      {(queryVariables?.categoryIds?.length || 0) > 1 && (
        <ChipFilter queryVariables={queryVariables} refetch={refetch} />
      )}

      {!!mapMarkers?.length && (
        <MapLibre
          currentPosition={currentPosition}
          interactivity={{
            pitchEnabled: true,
            rotateEnabled: false,
            scrollEnabled: true,
            zoomEnabled: true
          }}
          isMultipleMarkersMap
          locations={mapMarkers}
          mapCenterPosition={mapCenterPosition}
          mapStyle={styles.map}
          onMarkerPress={setSelectedPointOfInterest}
          selectedMarker={selectedPointOfInterest}
        />
      )}

      {!!selectedPointOfInterest && !detailsLoading && (
        <View
          style={[
            styles.listItemContainer,
            stylesWithProps({
              navigationType,
              orientation,
              safeAreaInsets,
              deviceHeight: device.height
            }).position
          ]}
        >
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
            navigation={isPreviewWithoutNavigation ? undefined : navigation}
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
    backgroundColor: colors.lighterPrimary,
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
    marginVertical: normalize(16)
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
const stylesWithProps = ({
  navigationType,
  orientation,
  safeAreaInsets,
  deviceHeight
}: {
  navigationType: string;
  orientation: string;
  safeAreaInsets: { left: number; right: number };
  deviceHeight: number;
}) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '8%' : '4%',
      left: orientation === 'landscape' ? safeAreaInsets.left + deviceHeight * 0.04 : '4%',
      right: orientation === 'landscape' ? safeAreaInsets.right + deviceHeight * 0.04 : '4%'
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
