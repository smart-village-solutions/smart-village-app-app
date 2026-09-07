/* eslint-disable react/prop-types */
import { StackScreenProps } from 'expo-router/js-stack';
import * as Location from 'expo-location';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, StyleSheet, View } from 'react-native';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import {
  EmptyMessage,
  Filter,
  HeaderLeft,
  LoadingSpinner,
  MapLibre,
  TextListItem
} from '../../components';
import { expandMapBounds, getMarkerBounds } from '../../components/map/getMarkerBounds';
import { consts, normalize, texts } from '../../config';
import { geoLocationFilteredListItem } from '../../helpers';
import {
  buildParticipationProjectPreviewItem,
  getParticipationProjectRadiusFilter,
  getParticipationProjectGeoLocation,
  isParticipationProjectMapEligible,
  isParticipationProjectStatus,
  normalizeParticipationProjectStatusPosition,
  PARTICIPATION_PROJECT_DEFAULT_STATUSES,
  PARTICIPATION_PROJECT_FILTER_CHANGED_EVENT,
  PARTICIPATION_PROJECT_STATUS_FILTER,
  PARTICIPATION_PROJECT_STATUS_POSITION_PARAM,
  ParticipationProject
} from '../../helpers/participationProjectHelper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../hooks';
import { getQuery, QUERY_TYPES } from '../../queries';
import {
  FilterProps,
  FilterTypesProps,
  GenericType,
  MapMarker,
  ScreenName,
  ThemeColorPalette
} from '../../types';

type ParticipationProjectMapParamList = Record<string, object | undefined> & {
  [ScreenName.ParticipationProjectMap]: {
    filterTypes?: FilterTypesProps[];
    initialQueryVariables?: FilterProps;
    queryVariables?: Record<string, unknown>;
    rootRouteName?: string;
    sourceRouteKey?: string;
    subtitleNumberOfLines?: number;
    title?: string;
    titleNumberOfLines?: number;
  };
};

type ParticipationProjectItemsResponse = {
  [QUERY_TYPES.GENERIC_ITEMS]: ParticipationProject[];
};

const INITIAL_BOUNDS_EXPANSION_FACTOR = 2;
const { MAP } = consts;

const resolveMapFilterTypes = (filterTypes?: FilterTypesProps[]) =>
  filterTypes?.length ? filterTypes : [getParticipationProjectRadiusFilter()];

const createInitialMapFilters = (queryVariables: Record<string, unknown>): FilterProps => ({
  ...queryVariables,
  [PARTICIPATION_PROJECT_STATUS_FILTER]:
    queryVariables[PARTICIPATION_PROJECT_STATUS_FILTER] || PARTICIPATION_PROJECT_DEFAULT_STATUSES
});

export const ParticipationProjectMapScreen = ({
  navigation,
  route
}: StackScreenProps<ParticipationProjectMapParamList, ScreenName.ParticipationProjectMap>) => {
  const styles = useThemeStyles(createStyles);
  const [selectedMarker, setSelectedMarker] = useState<string>();
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocationAlertShow, setIsLocationAlertShow] = useState(false);
  const { locationSettings = {} } = useLocationSettings();
  const systemPermission = useSystemPermission();
  const initialQueryVariables = route.params?.initialQueryVariables || {};
  const currentQueryVariables = route.params?.queryVariables || initialQueryVariables;
  const [queryVariables, setQueryVariables] = useState<FilterProps>(() =>
    createInitialMapFilters(currentQueryVariables)
  );

  useEffect(() => {
    if (!route.params?.sourceRouteKey) return;

    DeviceEventEmitter.emit(PARTICIPATION_PROJECT_FILTER_CHANGED_EVENT, {
      queryVariables,
      sourceRouteKey: route.params.sourceRouteKey
    });
  }, [queryVariables, route.params?.sourceRouteKey]);
  const filterTypes = resolveMapFilterTypes(route.params?.filterTypes);
  const radiusSearch = queryVariables.radiusSearch as
    | { currentPosition?: boolean; distance?: number; index?: number }
    | undefined;
  const skipPosition =
    !radiusSearch?.distance || systemPermission?.status !== Location.PermissionStatus.GRANTED;
  const { position } = usePosition(skipPosition);
  const { position: lastKnownPosition } = useLastKnownPosition(skipPosition);
  const currentPosition = position || lastKnownPosition;
  const titleNumberOfLines = route.params?.titleNumberOfLines;
  const subtitleNumberOfLines = route.params?.subtitleNumberOfLines;
  const rootRouteName = route.params?.rootRouteName;
  const statusPosition = normalizeParticipationProjectStatusPosition(
    route.params?.queryVariables?.[PARTICIPATION_PROJECT_STATUS_POSITION_PARAM]
  );
  const selectedMapStatuses = useMemo(() => {
    const selectedStatuses = queryVariables[PARTICIPATION_PROJECT_STATUS_FILTER];
    const statuses = Array.isArray(selectedStatuses)
      ? selectedStatuses
      : typeof selectedStatuses === 'string'
      ? [selectedStatuses]
      : PARTICIPATION_PROJECT_DEFAULT_STATUSES;

    return statuses.filter((status): status is string => typeof status === 'string');
  }, [queryVariables]);
  const mapQueryVariables = useMemo(() => {
    const networkQueryVariables = { ...queryVariables };
    delete networkQueryVariables[PARTICIPATION_PROJECT_STATUS_FILTER];
    delete networkQueryVariables[PARTICIPATION_PROJECT_STATUS_POSITION_PARAM];
    delete networkQueryVariables.participationOrder;
    delete networkQueryVariables.radiusSearch;
    delete networkQueryVariables.subtitleNumberOfLines;
    delete networkQueryVariables.titleNumberOfLines;

    return {
      ...networkQueryVariables,
      genericType: GenericType.ParticipationProject,
      limit: undefined
    };
  }, [queryVariables]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
      title: route.params?.title
    });
  }, [navigation, route.params?.title]);

  const { data, isLoading } = useQuery<ParticipationProjectItemsResponse>(
    [QUERY_TYPES.GENERIC_ITEMS, mapQueryVariables],
    async () => {
      const client = await ReactQueryClient();

      return await client.request<ParticipationProjectItemsResponse>(
        getQuery(QUERY_TYPES.GENERIC_ITEMS),
        mapQueryVariables
      );
    }
  );

  const eligibleProjects = useMemo(() => {
    const projects = (data?.[QUERY_TYPES.GENERIC_ITEMS] || []).filter(
      (item) =>
        isParticipationProjectMapEligible(item) &&
        selectedMapStatuses.some((status) => isParticipationProjectStatus(item, status))
    );

    if (!radiusSearch?.distance) return projects;

    return geoLocationFilteredListItem({
      currentPosition,
      isLocationAlertShow,
      listItem: projects,
      locationSettings,
      navigation,
      queryVariables: { radiusSearch },
      setIsLocationAlertShow
    });
  }, [
    currentPosition,
    data,
    isLocationAlertShow,
    locationSettings,
    navigation,
    radiusSearch,
    selectedMapStatuses
  ]);

  const markers = useMemo<MapMarker[]>(
    () =>
      eligibleProjects.map((item) => ({
        activeIconName: `${MAP.DEFAULT_PIN}Active`,
        iconName: MAP.DEFAULT_PIN,
        id: item.id,
        position: getParticipationProjectGeoLocation(item) as MapMarker['position'],
        title: item.title
      })),
    [eligibleProjects]
  );
  const initialBounds = useMemo(() => {
    const markerBounds = getMarkerBounds(markers);

    return markerBounds
      ? expandMapBounds(markerBounds, INITIAL_BOUNDS_EXPANSION_FACTOR)
      : undefined;
  }, [markers]);

  const selectedProject = useMemo(
    () => eligibleProjects.find((item) => item.id === selectedMarker),
    [eligibleProjects, selectedMarker]
  );

  const selectedPreviewItem = useMemo(
    () =>
      selectedProject
        ? buildParticipationProjectPreviewItem(selectedProject, { rootRouteName, statusPosition })
        : undefined,
    [rootRouteName, selectedProject, statusPosition]
  );

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View style={styles.container}>
      <Filter
        countInitialFilter={PARTICIPATION_PROJECT_STATUS_FILTER}
        filterTypes={filterTypes}
        initialQueryVariables={initialQueryVariables}
        isOverlay
        queryVariables={queryVariables}
        setQueryVariables={setQueryVariables}
      />

      {!!markers.length && (
        <MapLibre
          currentPosition={currentPosition}
          initialBounds={initialBounds}
          isMyLocationButtonVisible
          locations={markers}
          mapStyle={styles.map}
          onMapReady={() => setIsMapReady(true)}
          onMarkerPress={setSelectedMarker}
          selectedMarker={selectedMarker}
        />
      )}

      {!!markers.length && !isMapReady && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <LoadingSpinner loading />
        </View>
      )}

      {!markers.length && (
        <View style={styles.emptyState} testID="participation-map-empty-state">
          <EmptyMessage title={texts.empty.list} showIcon />
        </View>
      )}

      {!!selectedPreviewItem && (
        <View style={styles.listItemContainer}>
          <TextListItem
            containerStyle={styles.textListItemContainer}
            imageContentPosition="left center"
            imageContainerStyle={styles.imageRadius}
            imageStyle={styles.imageStyle}
            item={selectedPreviewItem}
            leftImage={!!selectedPreviewItem.picture?.url}
            listItemStyle={styles.listItem}
            listsWithoutArrows
            navigation={navigation}
            noSubtitle
            subtitleNumberOfLines={subtitleNumberOfLines}
            titleNumberOfLines={titleNumberOfLines}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColorPalette) => ({
  container: {
    flex: 1,
    width: '100%'
  },
  emptyState: {
    flex: 1,
    paddingHorizontal: normalize(16)
  },
  imageRadius: {
    alignSelf: 'stretch',
    borderBottomLeftRadius: normalize(12),
    borderTopLeftRadius: normalize(12),
    overflow: 'hidden',
    width: normalize(96)
  },
  imageStyle: {
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    height: '100%',
    width: normalize(96)
  },
  listItem: {
    marginVertical: normalize(16)
  },
  listItemContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(12),
    bottom: '4%',
    elevation: 2,
    left: '4%',
    position: 'absolute',
    right: '4%',
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 5,
      width: 0
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    width: '92%'
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
    zIndex: 1
  },
  map: {
    flex: 1,
    width: '100%'
  },
  textListItemContainer: {
    alignItems: 'stretch',
    padding: 0,
    paddingVertical: 0
  }
});
