/* eslint-disable react/prop-types */
import { StackScreenProps } from '@react-navigation/stack';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import { LoadingSpinner, MapLibre, RegularText, TextListItem, Wrapper } from '../../components';
import { consts, normalize } from '../../config';
import {
  buildParticipationProjectPreviewItem,
  getParticipationProjectGeoLocation,
  isParticipationProjectMapEligible,
  ParticipationProject
} from '../../helpers';
import { getQuery, QUERY_TYPES } from '../../queries';
import { GenericType, MapMarker, ScreenName } from '../../types';

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
const { MAP } = consts;

export const ParticipationProjectMapScreen = ({
  navigation,
  route
}: StackScreenProps<ParticipationProjectMapParamList, ScreenName.ParticipationProjectMap>) => {
  const [selectedMarker, setSelectedMarker] = useState<string>();
  const titleNumberOfLines = route.params?.titleNumberOfLines;
  const subtitleNumberOfLines = route.params?.subtitleNumberOfLines;
  const rootRouteName = route.params?.rootRouteName;
  const mapQueryVariables = useMemo(
    () => ({
      ...(route.params?.queryVariables || {}),
      genericType: GenericType.ParticipationProject,
      limit: undefined
    }),
    [route.params?.queryVariables]
  );

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
    () => (data?.[QUERY_TYPES.GENERIC_ITEMS] || []).filter(isParticipationProjectMapEligible),
    [data]
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

  const selectedProject = useMemo(
    () => eligibleProjects.find((item) => item.id === selectedMarker),
    [eligibleProjects, selectedMarker]
  );

  const selectedPreviewItem = useMemo(
    () =>
      selectedProject
        ? buildParticipationProjectPreviewItem(selectedProject, { rootRouteName })
        : undefined,
    [rootRouteName, selectedProject]
  );

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View style={styles.container}>
      {!!markers.length && (
        <MapLibre
          isMyLocationButtonVisible={false}
          locations={markers}
          mapStyle={styles.map}
          onMarkerPress={setSelectedMarker}
          selectedMarker={selectedMarker}
        />
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

const styles = StyleSheet.create({
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
  map: {
    height: '100%',
    width: '100%'
  }
});
