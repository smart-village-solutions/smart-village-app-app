import MapLibreGL, { Camera, PointAnnotation } from '@maplibre/maplibre-react-native';
import React, { useContext } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LatLng, Region } from 'react-native-maps';

import { colors, device, normalize } from '../../config';
import { useLocationSettings } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';

import { imageHeight, imageWidth } from '../../helpers';
import { MapIcon } from './Map';

const MARKER_ICON_SIZE = normalize(40);

MapLibreGL.setAccessToken(null);

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

export const MaplibreComponent = ({
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
      <MapLibreGL.MapView
        style={[stylesForMap().map, mapStyle]}
        styleJSON="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
        compassEnabled={false}
        logoEnabled={false}
      >
        <Camera
          centerCoordinate={[initialRegion.longitude, initialRegion.latitude]}
          minZoomLevel={minZoom}
          animationDuration={0}
          zoomLevel={zoom * 45}
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
      </MapLibreGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  callout: {
    width: normalize(120),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    zIndex: 1000,
    position: 'absolute'
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
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

const stylesForMap = () => {
  return StyleSheet.create({
    map: {
      alignSelf: 'center',
      height: imageHeight(imageWidth()),
      width: device.width
    }
  });
};
