/* eslint-disable react/prop-types */
import { StackScreenProps } from 'expo-router/js-stack';
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import {
  HeaderLeft,
  LoadingSpinner,
  MapLibre,
  RegularText,
  TextListItem,
  Wrapper
} from '../../components';
import { expandMapBounds, getMarkerBounds } from '../../components/map/getMarkerBounds';
import { consts, normalize } from '../../config';
import {
  buildParticipationProjectPreviewItem,
  getParticipationProjectGeoLocation,
  isParticipationProjectMapEligible,
  isParticipationProjectStatus,
  normalizeParticipationProjectStatusPosition,
  PARTICIPATION_PROJECT_DEFAULT_STATUSES,
  PARTICIPATION_PROJECT_STATUS_FILTER,
  PARTICIPATION_PROJECT_STATUS_POSITION_PARAM,
  ParticipationProject
} from '../../helpers/participationProjectHelper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { getQuery, QUERY_TYPES } from '../../queries';
import { GenericType, MapMarker, ScreenName, ThemeColorPalette } from '../../types';

type ParticipationProjectMapParamList = Record<string, object | undefined> & {
  [ScreenName.ParticipationProjectMap]: {
    queryVariables?: Record<string, unknown>;
    rootRouteName?: string;
    subtitleNumberOfLines?: number;
    title?: string;
    titleNumberOfLines?: number;
  };
};

type ParticipationProjectItemsResponse = {
  [QUERY_TYPES.GENERIC_ITEMS]: ParticipationProject[];
};

const EMPTY_STATE_TEXT = 'Keine aktiven Beteiligungsprojekte mit Standort verfuegbar.';
const INITIAL_BOUNDS_EXPANSION_FACTOR = 2;
const { MAP } = consts;

export const ParticipationProjectMapScreen = ({
  navigation,
  route
}: StackScreenProps<ParticipationProjectMapParamList, ScreenName.ParticipationProjectMap>) => {
  const styles = useThemeStyles(createStyles);
  const [selectedMarker, setSelectedMarker] = useState<string>();
  const [isMapReady, setIsMapReady] = useState(false);
  const titleNumberOfLines = route.params?.titleNumberOfLines;
  const subtitleNumberOfLines = route.params?.subtitleNumberOfLines;
  const rootRouteName = route.params?.rootRouteName;
  const statusPosition = normalizeParticipationProjectStatusPosition(
    route.params?.queryVariables?.[PARTICIPATION_PROJECT_STATUS_POSITION_PARAM]
  );
  const selectedMapStatuses = useMemo(() => {
    const selectedStatuses = route.params?.queryVariables?.[PARTICIPATION_PROJECT_STATUS_FILTER];
    const statuses = Array.isArray(selectedStatuses)
      ? selectedStatuses
      : typeof selectedStatuses === 'string'
      ? [selectedStatuses]
      : PARTICIPATION_PROJECT_DEFAULT_STATUSES;

    return statuses.filter((status): status is string => typeof status === 'string');
  }, [route.params?.queryVariables]);
  const mapQueryVariables = useMemo(() => {
    const queryVariables = { ...(route.params?.queryVariables || {}) };
    delete queryVariables[PARTICIPATION_PROJECT_STATUS_FILTER];
    delete queryVariables[PARTICIPATION_PROJECT_STATUS_POSITION_PARAM];
    delete queryVariables.participationOrder;
    delete queryVariables.subtitleNumberOfLines;
    delete queryVariables.titleNumberOfLines;

    return {
      ...queryVariables,
      genericType: GenericType.ParticipationProject,
      limit: undefined
    };
  }, [route.params?.queryVariables]);

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

  const eligibleProjects = useMemo(
    () =>
      (data?.[QUERY_TYPES.GENERIC_ITEMS] || []).filter(
        (item) =>
          isParticipationProjectMapEligible(item) &&
          selectedMapStatuses.some((status) => isParticipationProjectStatus(item, status))
      ),
    [data, selectedMapStatuses]
  );

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
      {!!markers.length && (
        <MapLibre
          initialBounds={initialBounds}
          isMyLocationButtonVisible={false}
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
        <View style={styles.emptyState}>
          <RegularText>{EMPTY_STATE_TEXT}</RegularText>
        </View>
      )}

      {!!selectedPreviewItem && (
        <Wrapper small style={styles.listItemContainer}>
          <TextListItem
            item={selectedPreviewItem}
            navigation={navigation}
            subtitleNumberOfLines={subtitleNumberOfLines}
            titleNumberOfLines={titleNumberOfLines}
          />
        </Wrapper>
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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: normalize(24)
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
    height: '100%',
    width: '100%'
  }
});
