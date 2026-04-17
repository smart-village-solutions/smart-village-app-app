import * as Location from 'expo-location';
import { LocationObjectCoords } from 'expo-location';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { consts, normalize, texts } from '../config';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../hooks';
import { SettingsContext } from '../SettingsProvider';
import { MapMarker, ScreenName } from '../types';

import { AugmentedReality } from './augmentedReality';
import { Button } from './Button';
import { IndexFilterWrapperAndList } from './IndexFilterWrapperAndList';
import { ListComponent } from './ListComponent';
import { MapLibre } from './map';
import { SectionHeader } from './SectionHeader';
import { locationServiceEnabledAlert } from './SUE/report/SueReportLocation';
import { Wrapper } from './Wrapper';

const { MAP } = consts;

export const TOP_FILTER = {
  MAP_VIEW: 'mapView',
  LIST_VIEW: 'listView'
};

export const INITIAL_FILTER = [
  { id: TOP_FILTER.MAP_VIEW, title: texts.augmentedReality.filter.mapView, selected: true },
  { id: TOP_FILTER.LIST_VIEW, title: texts.augmentedReality.filter.listView, selected: false }
];

export const TourStops = ({
  geometryTourData,
  id,
  navigation,
  tourStops
}: {
  geometryTourData: any;
  id: number | string;
  navigation: any;
  tourStops: any[];
}) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;

  const { locationSettings = {} } = useLocationSettings();
  const { locationService: locationServiceEnabled } = locationSettings as {
    locationService?: boolean;
  };
  const systemPermission = useSystemPermission();
  const skipPosition =
    systemPermission?.status !== Location.PermissionStatus.GRANTED || !locationServiceEnabled;
  const { position } = usePosition(skipPosition);
  const { position: lastKnownPosition } = useLastKnownPosition(skipPosition);
  const currentPosition = position || lastKnownPosition;

  // Show location permission alert once when the screen mounts and permissions are missing
  useEffect(() => {
    if (!systemPermission) return;

    if (!locationServiceEnabled || systemPermission.status !== Location.PermissionStatus.GRANTED) {
      locationServiceEnabledAlert({ currentPosition, locationServiceEnabled, navigation });
    }
  }, [systemPermission, locationServiceEnabled, navigation, currentPosition]);

  if (settings.ar?.tourId === String(id)) {
    return <AugmentedReality {...{ geometryTourData, id, navigation, tourStops }} />;
  }

  const [filter, setFilter] = useState(INITIAL_FILTER);
  const selectedFilterId = filter.find((entry) => entry.selected)?.id;

  const listItem = useMemo(
    () =>
      tourStops?.map((tourStop, index) => ({
        ...tourStop,
        routeName: ScreenName.TourStopDetail,
        overtitle: texts.tour.tourStop,
        title: tourStop.title,
        params: {
          geometryTourData,
          headline: tourStop.title,
          id: tourStop.id,
          subtitle: texts.tour.tourStop,
          title: texts.tour.stop + ' ' + (index + 1),
          tourStopData: tourStop,
          tourStops
        }
      })),
    [tourStops, geometryTourData]
  );

  const mapMarkers = mapToMapMarkers(tourStops);

  return (
    <>
      <SectionHeader title={texts.tour.tour} />
      <IndexFilterWrapperAndList filter={filter} setFilter={setFilter} />

      {selectedFilterId === TOP_FILTER.LIST_VIEW && (
        <ListComponent data={listItem} navigation={navigation} />
      )}

      {selectedFilterId === TOP_FILTER.MAP_VIEW && (
        <MapLibre
          currentPosition={currentPosition}
          geometryTourData={geometryTourData}
          locations={mapMarkers}
          mapStyle={styles.map}
          showMarkerLabels
          showsUserLocation
          isMyLocationButtonVisible
          onMarkerPress={(tourId) => {
            const selectedTourStop = tourStops.find((stop) => stop.id.toString() === tourId);
            const index = tourStops.findIndex((stop) => stop.id.toString() === tourId);

            navigation.navigate(ScreenName.TourStopDetail, {
              geometryTourData,
              headline: selectedTourStop?.title,
              id: tourId,
              subtitle: texts.tour.tourStop,
              title: texts.tour.stop + ' ' + (index + 1),
              tourStopData: selectedTourStop,
              tourStops
            });
          }}
          // onMaximizeButtonPress={() => console.log('Maximize map pressed')} // TODO: implement maximize map functionality
        />
      )}

      <Wrapper>
        <Button
          onPress={() => {
            navigation.navigate(ScreenName.TourStopDetail, {
              geometryTourData,
              headline: tourStops[0]?.title,
              id: tourStops[0]?.id,
              subtitle: texts.tour.tourStop,
              title: texts.tour.stop + ' 1',
              tourStopData: tourStops[0],
              tourStops
            });
          }}
          title={texts.tour.tourStart}
        />
      </Wrapper>
    </>
  );
};

type TourStopItem = {
  id: string | number;
  location?: {
    geoLocation?: {
      latitude?: number;
      longitude?: number;
    };
  };
};

export const mapToMapMarkers = (
  data: TourStopItem[] | undefined,
  id?: string | number
): MapMarker[] | undefined =>
  data
    ?.map((item, index) => {
      const latitude = item.location?.geoLocation?.latitude;
      const longitude = item.location?.geoLocation?.longitude;

      if (!latitude || !longitude) return undefined;

      return {
        iconName:
          !!id && item.id.toString() === id.toString() ? 'tourStopPinActive' : 'tourStopPin',
        activeIconName: 'tourStopPinActive',
        [MAP.DEFAULT_PIN]: 1,
        id: item.id.toString(),
        label: String(index + 1),
        position: {
          latitude,
          longitude
        } as LocationObjectCoords
      };
    })
    .filter((item) => item !== undefined);

const styles = StyleSheet.create({
  map: {
    height: normalize(500),
    width: '100%'
  }
});
