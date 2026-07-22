import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { Icon, normalize, texts } from '../../config';
import { trimNewLines } from '../../helpers';
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
import { TourDetailInfoCard } from '../infoCard';
import { MapLibre } from '../map';
import { MediaCarousel } from '../MediaCarousel';
import { locationServiceEnabledAlert } from '../SUE/report/SueReportLocation';
import { HeadlineText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { mapToMapMarkers } from '../TourStops';
import { Wrapper, WrapperRow, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

import { SectionHeader } from './../SectionHeader';

/* eslint-disable complexity */
export const TourStopDetail = ({ route, navigation }: { route: any; navigation: any }) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { geometryTourData, id, rootRouteName, tourStops, tourStopData, subtitle } = route.params;
  const { description, mediaContents, title } = tourStopData || {};

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
    const currentIndex = tourStops.findIndex((stop) => stop.id?.toString() === id?.toString());

    if (currentIndex === -1) return;

    const nextStop = tourStops[currentIndex + 1];

    if (nextStop) {
      navigation.navigate(ScreenName.TourStopDetail, {
        geometryTourData,
        id: nextStop.id,
        headline: nextStop.title,
        rootRouteName,
        subtitle: texts.tour.tourStop,
        title: texts.tour.stop + ' ' + (currentIndex + 2),
        tourStopData: nextStop,
        tourStops
      });
    }
  };

  const previousStop = () => {
    const currentIndex = tourStops.findIndex((stop) => stop.id?.toString() === id?.toString());

    if (currentIndex === -1) return;

    const previousStop = tourStops[currentIndex - 1];

    if (previousStop) {
      navigation.navigate(ScreenName.TourStopDetail, {
        geometryTourData,
        id: previousStop.id,
        headline: previousStop.title,
        rootRouteName,
        subtitle: texts.tour.tourStop,
        title: texts.tour.stop + ' ' + currentIndex,
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

  // Normalize id to string for reliable comparisons (map markers pass string IDs)
  const idStr = id?.toString();
  const mapCenterPosition = tourStops.find((stop) => stop.id?.toString() === idStr)?.location
    ?.geoLocation;

  return (
    <ScrollView ref={scrollViewRef}>
      {!!subtitle && (
        <WrapperVertical noPaddingBottom>
          <WrapperRow center>
            <HeadlineText smaller uppercase>
              {subtitle}
            </HeadlineText>
          </WrapperRow>
        </WrapperVertical>
      )}

      <WrapperRow center>
        <SectionHeader big center title={trimNewLines(title)} />
      </WrapperRow>

      <MediaCarousel mediaContents={mediaContents} />

      <SectionHeader title={texts.tour.overview} />

      <TourDetailInfoCard currentPosition={currentPosition} tourStopData={tourStopData} />

      <>
        <Wrapper>
          <WrapperRow itemsCenter>
            <Icon.Location color={colors.primary} style={styles.margin} />
            <Touchable
              accessibilityLabel={texts.accessibilityLabels.actions.showOnMap}
              onPress={() => scrollViewRef.current?.scrollTo({ y: mapY, animated: true })}
            >
              <RegularText>{texts.tour.showOnMap}</RegularText>
            </Touchable>
          </WrapperRow>
        </Wrapper>

        <Divider style={styles.divider} />
      </>

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
          isMultipleMarkersMap
          isMyLocationButtonVisible
          locations={mapMarkers}
          mapCenterPosition={mapCenterPosition}
          mapStyle={styles.map}
          selectedMarker={idStr}
          showMarkerLabels
          showsUserLocation
          onMarkerPress={(tourId) => {
            if (!tourId) return;

            const selectedTourStop = tourStops.find((stop) => stop.id?.toString() === tourId);
            const index = tourStops.findIndex((stop) => stop.id?.toString() === tourId);

            navigation.navigate(ScreenName.TourStopDetail, {
              geometryTourData,
              headline: selectedTourStop?.title,
              id: tourId,
              rootRouteName,
              subtitle: texts.tour.tourStop,
              title: texts.tour.stop + ' ' + (index + 1),
              tourStopData: selectedTourStop,
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
              disabled={idStr === tourStops[0].id?.toString()}
              icon={
                <Icon.ArrowLeft
                  color={idStr === tourStops[0].id?.toString() ? colors.surface : colors.primary}
                />
              }
              iconPosition="left"
              invert
              notFullWidth
              onPress={previousStop}
              title={texts.tour.previous}
            />
            <Button
              disabled={idStr === tourStops[tourStops.length - 1].id?.toString()}
              icon={<Icon.ArrowRight color={colors.surface} />}
              iconPosition="right"
              notFullWidth
              onPress={nextStop}
              title={texts.tour.next}
            />
          </WrapperRow>
        </WrapperVertical>
      )}
    </ScrollView>
  );
};
/* eslint-enable complexity */

const createStyles = (colors) => ({
  divider: {
    backgroundColor: colors.placeholder
  },

  map: {
    height: normalize(500),
    width: '100%'
  },

  margin: {
    marginRight: normalize(12)
  }
});
