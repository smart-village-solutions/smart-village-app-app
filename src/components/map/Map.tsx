import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useRef } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView from 'react-native-map-clustering';
import { Callout, LatLng, MAP_TYPES, Marker, Polyline, Region, UrlTile } from 'react-native-maps';

import { colors, consts, device, Icon, normalize, texts } from '../../config';
import { imageHeight, imageWidth, truncateText } from '../../helpers';
import { useLocationSettings } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { BoldText, RegularText } from '../Text';

const { a11yLabel } = consts;

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

const MARKER_ICON_SIZE = normalize(40);
const CIRCLE_SIZES = [60, 50, 40, 30];

const MapIcon = ({
  iconColor,
  iconName = 'location',
  iconSize = MARKER_ICON_SIZE
}: {
  iconColor?: string;
  iconName?: string;
  iconSize?: number;
}) => {
  const MarkerIcon = Icon[_upperFirst(iconName) as keyof typeof Icon];

  return <MarkerIcon color={iconColor} size={iconSize} />;
};

type TCluster = {
  clusterColor: string;
  geometry: { coordinates: [number, number] };
  id: string;
  onPress: () => void;
  properties: { point_count: number };
};

const renderCluster = (cluster: TCluster) => {
  const { clusterColor: backgroundColor, geometry, id, onPress, properties = {} } = cluster;
  const { point_count: points } = properties;

  return (
    <Marker
      key={`cluster-${id}`}
      coordinate={{
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1]
      }}
      style={styles.clusterMarker}
      onPress={onPress}
    >
      {CIRCLE_SIZES.map((size, index) => (
        <View
          key={`circle-${index}`}
          style={[
            styles.clusterCircle,
            {
              backgroundColor,
              borderRadius: normalize(size / 2),
              height: normalize(size),
              opacity: 0.2 * (index + 1),
              width: normalize(size)
            }
          ]}
        >
          <RegularText lightest center smallest>
            {points}
          </RegularText>
        </View>
      ))}
    </Marker>
  );
};

/* eslint-disable complexity */
export const Map = ({
  calloutTextEnabled = false,
  clusterDistance,
  clusteringEnabled = false,
  geometryTourData,
  isMaximizeButtonVisible = false,
  isMultipleMarkersMap = false,
  isMyLocationButtonVisible = false,
  locations,
  mapCenterPosition,
  mapStyle,
  minZoom,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  onMyLocationButtonPress,
  selectedMarker,
  style,
  updatedRegion,
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

  const refForMapView = useRef<MapView>(null);
  // LATITUDE_DELTA handles the zoom, see: https://github.com/react-native-maps/react-native-maps/issues/2129#issuecomment-457056572
  const LATITUDE_DELTA = zoom || 0.0922;
  // example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/0.30.x/example/examples/DisplayLatLng.js#L18
  const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

  // center of Germany
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
        clusterColor={colors.primary}
        clusterFontFamily="regular"
        clusteringEnabled={clusteringEnabled}
        radius={clusterDistance}
        renderCluster={renderCluster}
        initialRegion={initialRegion}
        region={updatedRegion}
        mapType={device.platform === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        onPress={onMapPress}
        ref={refForMapView}
        rotateEnabled={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        style={[stylesForMap().map, mapStyle]}
        userLocationPriority="balanced"
        minZoom={minZoom}
        mapPadding={{
          top: 0,
          right: 0,
          bottom: -normalize(30),
          left: 0
        }}
        legalLabelInsets={{
          top: 0,
          right: 0,
          bottom: normalize(10),
          left: 0
        }}
      >
        <UrlTile
          urlTemplate="https://tileserver-gl.smart-village.app/styles/osm-liberty/{z}/{x}/{y}.png"
          shouldReplaceMapContent={device.platform === 'ios'}
        />
        {!!geometryTourData?.length && (
          <Polyline
            coordinates={geometryTourData}
            strokeWidth={2}
            strokeColor={colors.primary}
            zIndex={1}
          />
        )}
        {locations?.map((marker, index) => {
          const isActiveMarker = selectedMarker && marker.id === selectedMarker;
          const serviceName = truncateText(marker.serviceName);
          const title = truncateText(marker.title);

          return (
            <Marker
              centerOffset={marker.iconAnchor || { x: 0, y: -(MARKER_ICON_SIZE / 2) }}
              coordinate={marker.position}
              identifier={marker.id}
              key={`${index}-${marker.id}`}
              onPress={() => onMarkerPress?.(marker.id)}
              zIndex={isActiveMarker ? 1010 : 1}
            >
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
                    />
                  </View>
                </>
              ) : (
                <MapIcon
                  iconColor={isActiveMarker ? colors.accent : undefined}
                  iconName={marker.iconName ? marker.iconName : undefined}
                />
              )}

              {calloutTextEnabled && (
                <Callout style={styles.callout}>
                  {!!serviceName && (
                    <BoldText smallest center>
                      {serviceName}
                    </BoldText>
                  )}
                  {!!title && (
                    <RegularText smallest center>
                      {title}
                    </RegularText>
                  )}
                </Callout>
              )}
            </Marker>
          );
        })}
      </MapView>
      {isMaximizeButtonVisible && (
        <TouchableOpacity
          accessibilityLabel={`Karte vergrößern ${a11yLabel.button}`}
          style={styles.maximizeMapButton}
          onPress={onMaximizeButtonPress}
        >
          <Icon.ExpandMap size={normalize(18)} />
        </TouchableOpacity>
      )}
      {isMyLocationButtonVisible && (
        <TouchableOpacity
          accessibilityLabel={`${texts.components.map} ${a11yLabel.button}`}
          style={styles.myLocationButton}
          onPress={onMyLocationButtonPress}
        >
          <Icon.GPS size={normalize(18)} />
        </TouchableOpacity>
      )}
      {device.platform === 'android' && (
        <View style={styles.logoContainer}>
          <RegularText smallest>© OpenStreetMap</RegularText>
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  callout: {
    width: normalize(120)
  },
  clusterCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute'
  },
  clusterMarker: {
    alignItems: 'center',
    height: normalize(60),
    justifyContent: 'center',
    width: normalize(60)
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    bottom: 0,
    height: normalize(30),
    justifyContent: 'center',
    left: normalize(13),
    position: 'absolute',
    width: normalize(100)
  },
  mapIconOnLocationMarker: {
    backgroundColor: colors.primary,
    left: MARKER_ICON_SIZE / 2.9,
    position: 'absolute',
    top: MARKER_ICON_SIZE / 4.2
  },
  mapIconOnLocationMarkerActive: {
    backgroundColor: colors.accent
  },
  maximizeMapButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    bottom: normalize(15),
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 1
  },
  myLocationButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    top: normalize(15),
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 1
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
// the map should have the same aspect ratio as images in portrait and a full width on landscape.
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten by server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForMap = () => {
  return StyleSheet.create({
    map: {
      alignSelf: 'center',
      height: imageHeight(imageWidth()),
      width: device.width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
