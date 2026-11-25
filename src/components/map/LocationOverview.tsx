import { RouteProp } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import { LocationObject } from 'expo-location';
import _upperFirst from 'lodash/upperFirst';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NetworkContext } from '../../NetworkProvider';
import { OrientationContext } from '../../OrientationProvider';
import { SettingsContext } from '../../SettingsProvider';
import { Icon, consts, device, normalize } from '../../config';
import {
  geoLocationFilteredListItem,
  graphqlFetchPolicy,
  isOpen,
  parseListItemsFromQuery
} from '../../helpers';
import { resolveReferencePosition } from '../../helpers/locationReference';
import { useLocationSettings } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  KNOWN_ICON_STATUS_NAMES,
  VehicleStatusFeature,
  fetchAvailableVehicles,
  vehiclePropertyKey
} from '../screens/AvailableVehicles';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';
import {
  isKlimaTalerMarker,
  offersToMapMarkers,
  selectedOfferLocation
} from '../../klimaTaler/mapOffers';
import { useMapOffers } from '../../klimaTaler/useMapOffers';
import { texts } from '../../config/texts';

import { ChipFilter } from './ChipFilter';
import { KlimaTalerPreview } from './KlimaTalerPreview';
import { MapLibre } from './MapLibre';
import { MapPreview } from './MapPreview';

const { MAP } = consts;

type VehicleStatusByUrl = Record<
  string,
  {
    activeIconName?: string;
    iconName?: string;
    status?: string | number;
  }
>;

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

const mapToMapMarkers = (
  pointsOfInterest: any,
  vehicleStatuses: VehicleStatusByUrl
): MapMarker[] | undefined => {
  const markers = pointsOfInterest
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ?.map((item: any) => {
      const latitude = item.addresses?.[0]?.geoLocation?.latitude;
      const longitude = item.addresses?.[0]?.geoLocation?.longitude;

      if (latitude == null || longitude == null) return undefined;

      let iconName = item.category?.iconName || MAP.DEFAULT_PIN;
      let activeIconName = `${item.category?.iconName || MAP.DEFAULT_PIN}Active`;

      if (item.payload?.freeStatusUrl) {
        const vehicleStatus = vehicleStatuses[item.payload.freeStatusUrl];
        const status = vehicleStatus?.status;

        if (vehicleStatus?.iconName) {
          iconName = vehicleStatus.iconName;
          activeIconName = vehicleStatus.activeIconName ?? `${vehicleStatus.iconName}Active`;
        }

        if (
          !vehicleStatus?.iconName &&
          typeof status === 'string' &&
          KNOWN_ICON_STATUS_NAMES.has(status)
        ) {
          iconName = status;
          activeIconName = `${status}Active`;
        }
      }

      if (item.payload?.iconName) {
        iconName = item.payload.iconName;
        // Do not fall back to `${iconName}Active` when the icon comes from payload,
        // as the Active asset is not guaranteed to exist. Leave activeIconName undefined
        // so MapLibre falls back to iconName instead of trying a missing asset.
        activeIconName = item.payload.activeIconName;
      }

      return {
        [iconName]: 1,
        iconName,
        activeIconName,
        id: item.id,
        position: {
          latitude,
          longitude
        }
      };
    })
    .filter((item: any) => item !== undefined);

  return markers;
};

const loadVehicleStatuses = (urls: string[]) => {
  return Promise.allSettled(
    urls.map(async (url) => {
      const data = await fetchAvailableVehicles(url);
      const feature = data?.[0] as VehicleStatusFeature | undefined;
      const status = feature?.properties?.[vehiclePropertyKey];
      const iconName = feature?.iconName;
      const activeIconName = feature?.activeIconName || feature?.iconNameActive;

      return [url, { activeIconName, iconName, status }] as const;
    })
  ).then((results) => {
    const statuses: VehicleStatusByUrl = {};

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const [url, vehicleStatus] = result.value;

        if (
          vehicleStatus.status != null ||
          !!vehicleStatus.iconName ||
          !!vehicleStatus.activeIconName
        ) {
          statuses[url] = vehicleStatus;
        }
      }
      // Rejected results are ignored so that one failing request
      // does not prevent processing of the others.
    });

    return statuses;
  });
};

const offersSourceName = (offers: ReturnType<typeof useMapOffers>) => {
  if (offers.loading) return texts.klimaTaler.map.loading;
  if (offers.error) return texts.klimaTaler.map.unavailable;
  if (offers.visible && !offers.configured) return texts.klimaTaler.map.unconfigured;
  if (offers.visible) return `Klima-Taler (${offers.locations.length})`;
  return 'Klima-Taler';
};

const mapPreviewItem = (
  detailsData: Record<string, unknown> | undefined,
  klimaTalerOnly: boolean,
  selectedPointOfInterest: string | undefined,
  queryVariables: Props['queryVariables'],
  iconColor: string,
  styles: ReturnType<typeof createStyles>
) => {
  const item =
    detailsData && !klimaTalerOnly && !isKlimaTalerMarker(selectedPointOfInterest)
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

    return {
      ...item,
      leftIcon: (
        <View style={[styles.iconContainer, styles.imageStyle]}>
          {!!SelectedIcon && <SelectedIcon color={iconColor} />}
        </View>
      )
    };
  }

  return item;
};

const SelectedMapPreview = ({
  selectedId,
  externalLocation,
  item,
  loading,
  navigation,
  withoutNavigation,
  stale,
  style
}: {
  selectedId?: string;
  externalLocation: ReturnType<typeof selectedOfferLocation>;
  item: ReturnType<typeof mapPreviewItem>;
  loading: boolean;
  navigation: Props['navigation'];
  withoutNavigation: boolean;
  stale: boolean;
  style: React.ComponentProps<typeof View>['style'];
}) => {
  if (!selectedId || (!externalLocation && (loading || !item))) return null;
  return (
    <View style={style}>
      {externalLocation ? (
        <KlimaTalerPreview
          key={externalLocation.id}
          location={externalLocation}
          navigation={navigation}
          stale={stale}
        />
      ) : (
        <MapPreview item={item} navigation={withoutNavigation ? undefined : navigation} />
      )}
    </View>
  );
};

/* eslint-disable complexity */
export const LocationOverview = ({
  currentPosition,
  filterByOpeningTimes,
  navigation,
  queryVariables,
  route
}: Props) => {
  const { colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const { locationSettings } = useLocationSettings();
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [isLocationAlertShow, setIsLocationAlertShow] = useState(false);
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatusByUrl>({});
  const isPreviewWithoutNavigation = route.params?.isPreviewWithoutNavigation ?? false;
  const klimaTalerOnly = route.params?.includeKlimaTaler === true;
  const showAllPoiCategories = route.params?.showAllPoiCategories === true;
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    () => queryVariables.categoryIds?.map(String) ?? []
  );
  const selectMapCategories = useCallback((ids: string[]) => {
    setSelectedCategoryIds(ids);
    setSelectedPointOfInterest(undefined);
  }, []);
  const offers = useMapOffers(
    klimaTalerOnly && !filterByOpeningTimes && !queryVariables?.radiusSearch?.distance
  );
  const externalLocation = selectedOfferLocation(offers.locations, selectedPointOfInterest);

  const mapCenterPosition = resolveReferencePosition(locationSettings || {})?.coords;

  const {
    data: overviewData,
    loading,
    refetch
  } = useQuery(getQuery(QUERY_TYPES.POINTS_OF_INTEREST), {
    fetchPolicy,
    skip: klimaTalerOnly,
    variables: {
      ...queryVariables,
      ...(showAllPoiCategories && { categoryIds: selectedCategoryIds }),
      // if we show the map, we need to fetch all the entries at once and not a limited amount
      limit: undefined
    }
  });

  let pointsOfInterest: any[] | undefined = klimaTalerOnly
    ? undefined
    : overviewData?.[QUERY_TYPES.POINTS_OF_INTEREST];

  useEffect(() => {
    if (!isConnected || !pointsOfInterest?.length) return;

    // Collect unique freeStatusUrls from all POIs
    const uniqueUrls: string[] = [
      ...new Set(
        pointsOfInterest
          .filter((item: any) => item.payload?.freeStatusUrl)
          .map((item: any) => item.payload.freeStatusUrl as string)
      )
    ];

    if (!uniqueUrls.length) return;

    void loadVehicleStatuses(uniqueUrls).then(setVehicleStatuses);
  }, [isConnected, pointsOfInterest]);

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
      skip:
        klimaTalerOnly || !selectedPointOfInterest || isKlimaTalerMarker(selectedPointOfInterest)
    }
  );

  // Keep the widget map mounted while a new category selection is loading.
  // Apollo retains the previous result, including a successfully loaded empty list.
  if (!klimaTalerOnly && loading && (!showAllPoiCategories || !overviewData)) {
    return <LoadingSpinner loading />;
  }

  const showMapFilter =
    showAllPoiCategories ||
    (!klimaTalerOnly && (queryVariables?.categoryIds?.length || 0) > 1) ||
    offers.enabled;
  const mapMarkers = [
    ...(mapToMapMarkers(pointsOfInterest, vehicleStatuses) ?? []),
    ...offersToMapMarkers(offers.locations, MAP.DEFAULT_PIN)
  ];
  const sourceName = offersSourceName(offers);

  const item = mapPreviewItem(
    detailsData,
    klimaTalerOnly,
    selectedPointOfInterest,
    queryVariables,
    colors.darkerPrimary,
    styles
  );

  return (
    <View style={styles.mapContainer}>
      {showMapFilter && (
        <ChipFilter
          key={JSON.stringify(queryVariables.categoryIds ?? [])}
          queryVariables={klimaTalerOnly ? {} : queryVariables}
          refetch={refetch}
          showAllPoiCategories={showAllPoiCategories}
          selectedCategoryIds={showAllPoiCategories ? selectedCategoryIds : undefined}
          onCategorySelectionChange={showAllPoiCategories ? selectMapCategories : undefined}
          additionalFilters={
            offers.enabled
              ? [
                  {
                    id: 'klima-taler',
                    name: sourceName,
                    icon: (
                      <Icon.NamedIcon name="leaf" color={colors.primary} size={normalize(16)} />
                    ),
                    selected: offers.visible,
                    onPress: offers.toggle
                  }
                ]
              : []
          }
        />
      )}

      {(klimaTalerOnly || !!mapMarkers?.length || showMapFilter) && (
        <MapLibre
          currentPosition={currentPosition}
          isMultipleMarkersMap
          locations={mapMarkers}
          mapCenterPosition={mapCenterPosition}
          mapStyle={styles.map}
          onMarkerPress={setSelectedPointOfInterest}
          selectedMarker={selectedPointOfInterest}
          showMapFilter={showMapFilter}
        />
      )}

      <SelectedMapPreview
        selectedId={selectedPointOfInterest}
        externalLocation={externalLocation}
        item={item}
        loading={detailsLoading}
        navigation={navigation}
        withoutNavigation={isPreviewWithoutNavigation}
        stale={!!offers.error}
        style={[
          styles.listItemContainer,
          stylesWithProps({
            navigationType,
            orientation,
            safeAreaInsets,
            deviceHeight: device.height
          }).position
        ]}
      />
    </View>
  );
};
/* eslint-enable complexity */

const createStyles = (colors) => ({
  mapContainer: { flex: 1 },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.lighterPrimary,
    borderBottomLeftRadius: normalize(8),
    borderTopLeftRadius: normalize(8),
    justifyContent: 'center'
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

  map: {
    height: '100%',
    width: '100%'
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
