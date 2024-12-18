import Mapbox, { Callout, Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import React, { useContext } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LatLng, Region } from 'react-native-maps';

import { colors, device, normalize } from '../../config';
import { imageHeight, imageWidth, truncateText } from '../../helpers';
import { useLocationSettings } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';

import { MapIcon } from './Map';

Mapbox.setAccessToken('sk....');

const MARKER_ICON_SIZE = normalize(40);

type Props = {
  calloutTextEnabled?: boolean;
  clusterDistance?: number;
  clusteringEnabled?: boolean;
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  isMultipleMarkersMap?: boolean;
  isMyLocationButtonVisible?: boolean;
  locations?: MapMarker[];
  mapCenterPosition?: { latitude: number; longitude: number };
  mapStyle?: StyleProp<ViewStyle>;
  minZoom?: number;
  onMapPress?: ({ nativeEvent }: { nativeEvent?: any }) => void;
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  onMyLocationButtonPress?: () => void;
  selectedMarker?: string;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
  updatedRegion?: Region;
};

/* eslint-disable complexity */
export const MapboxComponent = ({
  isMultipleMarkersMap = false,
  locations,
  calloutTextEnabled = false,
  minZoom,
  style,
  selectedMarker,
  onMarkerPress,
  mapCenterPosition,
  mapStyle,
  ...otherProps
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { zoomLevelForMaps = {}, locationService = {} } = settings;
  const { locationSettings } = useLocationSettings();
  const showsUserLocation =
    locationSettings?.locationService ?? otherProps.showsUserLocation ?? !!locationService;
  const zoom = isMultipleMarkersMap
    ? zoomLevelForMaps.multipleMarkers
    : zoomLevelForMaps.singleMarker;

  // LATITUDE_DELTA handles the zoom, see: https://github.com/react-native-maps/react-native-maps/issues/2129#issuecomment-457056572
  const LATITUDE_DELTA = zoom || 0.0922;
  // example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/0.30.x/example/examples/DisplayLatLng.js#L18
  const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

  let initialRegion: Region = {
    latitude: 51.1657,
    longitude: 10.4515,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  };

  if (locations?.[0]?.position?.latitude && locations[0]?.position?.longitude) {
    initialRegion = {
      ...initialRegion,
      latitude: locations[0].position.latitude,
      longitude: locations[0].position.longitude
    };
  }

  if (mapCenterPosition) {
    initialRegion = {
      ...initialRegion,
      ...mapCenterPosition
    };
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        compassEnabled={false}
        logoEnabled={false}
        rotateEnabled={false}
        scaleBarEnabled={false}
        style={[styles.map, mapStyle]}
        onPress={(event) => console.log(event)}
        styleJSON="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
      >
        <Camera
          animationDuration={0}
          minZoomLevel={minZoom}
          centerCoordinate={[initialRegion.longitude, initialRegion.latitude]}
          zoomLevel={zoom * 45} // TODO: find a better way to set the zoom level
        />

        {locations?.map((marker, index) => {
          const isActiveMarker = selectedMarker && marker.id === selectedMarker;

          return (
            <PointAnnotation
              coordinate={[marker.position.longitude, marker.position.latitude]}
              id={marker.id}
              key={`${index}-${marker.id}`}
              onSelected={() => onMarkerPress?.(marker.id)}
            >
              <>
                {calloutTextEnabled && isActiveMarker && (
                  <Callout title={truncateText(marker.title)} />
                )}

                {!!marker.iconName &&
                marker.iconName != 'ownLocation' &&
                marker.iconName != 'location' ? (
                  <>
                    <MapIcon
                      iconColor={
                        marker.iconBackgroundColor
                          ? isActiveMarker
                            ? marker.iconColor
                            : marker.iconBackgroundColor
                          : isActiveMarker
                          ? colors.accent
                          : undefined
                      }
                      strokeColor={marker.iconBorderColor}
                    />
                    <View
                      style={[
                        styles.mapIconOnLocationMarker,
                        isActiveMarker ? styles.mapIconOnLocationMarkerActive : undefined,
                        !!marker.iconBackgroundColor && {
                          backgroundColor: isActiveMarker
                            ? marker.iconColor
                            : marker.iconBackgroundColor
                        }
                      ]}
                    >
                      <MapIcon
                        iconColor={
                          marker.iconColor
                            ? isActiveMarker
                              ? colors.surface
                              : marker.iconColor
                            : colors.surface
                        }
                        iconName={marker.iconName}
                        iconSize={MARKER_ICON_SIZE / 3.25}
                        strokeColor={marker.iconBorderColor}
                      />
                    </View>
                  </>
                ) : (
                  <MapIcon
                    iconColor={isActiveMarker ? colors.accent : undefined}
                    iconName={marker.iconName ? marker.iconName : undefined}
                    strokeColor={marker.iconBorderColor}
                  />
                )}
              </>
            </PointAnnotation>
          );
        })}
      </MapView>
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  map: {
    alignSelf: 'center',
    height: imageHeight(imageWidth()),
    width: device.width
  },
  mapIconOnLocationMarker: {
    backgroundColor: colors.primary,
    left: MARKER_ICON_SIZE / 2.9,
    position: 'absolute',
    top: MARKER_ICON_SIZE / 4.2
  },
  mapIconOnLocationMarkerActive: {
    backgroundColor: colors.accent
  }
});
