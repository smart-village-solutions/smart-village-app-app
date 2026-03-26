import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../config';
import {
  useLastKnownPosition,
  useLocationSettings,
  useOpenWebScreen,
  usePosition,
  useSystemPermission
} from '../../hooks';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { TourDetailInfoCard } from '../infoCard';
import { MapLibre } from '../map';
import { locationServiceEnabledAlert } from '../SUE/report/SueReportLocation';
import { mapToMapMarkers } from '../TourStops';
import { Wrapper, WrapperHorizontal, WrapperRow, WrapperVertical } from '../Wrapper';

import { MediaSection } from '../MediaSection';
import { SectionHeader } from './../SectionHeader';
import { TourCard } from './TourCard';

/* eslint-disable complexity */
export const TourStopDetail = ({ route, navigation }: { route: any; navigation: any }) => {
  const { geometryTourData, id, tourStops, tourStopData } = route.params;
  const { description, lengthKm, mediaContents, title, tourAddresses } = tourStopData || {};

  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

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

  const nextStop = () => {
    const currentIndex = tourStops.findIndex((stop) => stop.id === id);
    const nextStop = tourStops[currentIndex + 1];

    if (nextStop) {
      navigation.navigate(ScreenName.TourStopDetail, {
        geometryTourData,
        id: nextStop.id,
        title: nextStop.title,
        tourStopData: nextStop,
        tourStops
      });
    }
  };

  const previousStop = () => {
    const currentIndex = tourStops.findIndex((stop) => stop.id === id);
    const previousStop = tourStops[currentIndex - 1];

    if (previousStop) {
      navigation.navigate(ScreenName.TourStopDetail, {
        geometryTourData,
        id: previousStop.id,
        title: previousStop.title,
        tourStopData: previousStop,
        tourStops
      });
    }
  };

  const mapMarkers = mapToMapMarkers(tourStops, id);
  const scrollViewRef = useRef<ScrollView>(null);
  const [mapY, setMapY] = useState(0);

  // Scroll to top whenever the stop changes (next/previous navigation)
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [id]);

  return (
    <ScrollView ref={scrollViewRef}>
      <ImageSection mediaContents={mediaContents} />
      <SectionHeader title={title} />

      <TourDetailInfoCard currentPosition={currentPosition} tourStopData={tourStopData} />

      {(!!tourAddresses?.length || !!lengthKm) && (
        <TourCard lengthKm={lengthKm} tourAddresses={tourAddresses} />
      )}

      <WrapperHorizontal>
        <Button
          title={texts.tour.showOnMap}
          onPress={() => scrollViewRef.current?.scrollTo({ y: mapY, animated: true })}
        />
      </WrapperHorizontal>

      <MediaSection mediaContents={mediaContents} />

      {!!description && (
        <View>
          <SectionHeader title={texts.tour.description} />
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        </View>
      )}

      <View onLayout={(e) => setMapY(e.nativeEvent.layout.y)}>
        <MapLibre
          currentPosition={currentPosition}
          geometryTourData={geometryTourData}
          locations={mapMarkers}
          mapStyle={styles.map}
          showsUserLocation={true}
          isMyLocationButtonVisible={true}
          onMarkerPress={(tourId) => {
            navigation.navigate(ScreenName.TourStopDetail, {
              geometryTourData,
              id: tourId,
              title: tourStops.find((stop) => stop.id.toString() === tourId)?.title,
              tourStopData: tourStops.find((stop) => stop.id.toString() === tourId),
              tourStops
            });
          }}
          // onMaximizeButtonPress={() => console.log('Maximize map pressed')} // TODO: implement maximize map functionality
        />
      </View>

      {!!tourStops?.length && (
        <WrapperVertical>
          <WrapperRow center spaceAround>
            <Button
              icon={
                <Icon.ArrowLeft color={id === tourStops[0].id ? colors.surface : colors.primary} />
              }
              iconPosition="left"
              invert
              notFullWidth
              disabled={id === tourStops[0].id}
              onPress={previousStop}
              title="Vorheriger"
            />
            <Button
              icon={<Icon.ArrowRight color={colors.surface} />}
              iconPosition="right"
              notFullWidth
              disabled={id === tourStops[tourStops.length - 1].id}
              onPress={nextStop}
              title="Nächster"
            />
          </WrapperRow>
        </WrapperVertical>
      )}
    </ScrollView>
  );
};
/* eslint-disable complexity */

const styles = StyleSheet.create({
  map: {
    height: normalize(500),
    width: '100%'
  }
});
