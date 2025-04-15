import {
  Camera,
  CircleLayer,
  Images,
  MapView,
  MarkerView,
  ShapeSource,
  ShapeSourceRef,
  SymbolLayer,
  UserLocation,
  UserLocationRenderMode,
  UserTrackingMode
} from '@maplibre/maplibre-react-native';
import { featureCollection, point } from '@turf/helpers';
import { LocationObjectCoords } from 'expo-location';
import { default as React, useContext, useRef, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LatLng, Region } from 'react-native-maps';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { truncateText } from '../../helpers';
import { useLocationSettings, useMapFeatureConfig } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { getLocationMarker } from '../settings';
import { BoldText, RegularText } from '../Text';

const { a11yLabel } = consts;

const CustomCallout = ({ feature }: { feature: GeoJSON.Feature }) => {
  const { properties = {} } = feature;

  const serviceName = truncateText(properties?.serviceName);
  const title = truncateText(properties?.title);

  return (
    <View style={styles.calloutContainer}>
      <View style={styles.callout}>
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
      </View>
      <View style={styles.calloutTriangel} />
    </View>
  );
};

type Props = {
  calloutTextEnabled?: boolean;
  clusterDistance?: number;
  clusteringEnabled?: boolean;
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  isMultipleMarkersMap?: boolean;
  isMyLocationButtonVisible?: boolean;
  locations: MapMarker[];
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
export const MapLibre = ({
  calloutTextEnabled = false,
  isMultipleMarkersMap = true,
  clusterDistance,
  clusteringEnabled,
  locations,
  isMyLocationButtonVisible = true,
  mapStyle,
  minZoom,
  onMarkerPress,
  selectedMarker,
  style,
  ...otherProps
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { locationService = {} } = settings;
  const {
    clusterCircleColor,
    clusterMaxZoom,
    clusterProperties,
    layerStyles = {},
    markerImages,
    zoomLevel = {}
  } = useMapFeatureConfig(locations);
  const initialZoomLevel = isMultipleMarkersMap
    ? zoomLevel.multipleMarkers
    : zoomLevel.singleMarker;

  const { locationSettings = {} } = useLocationSettings();
  const showsUserLocation =
    locationSettings?.locationService ?? otherProps.showsUserLocation ?? !!locationService;
  const { alternativePosition, defaultAlternativePosition } = locationSettings;
  const [followsUserLocation, setFollowsUserLocation] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const mapRef = useRef(null);
  const cameraRef = useRef(null);
  const shapeSourceRef = useRef<ShapeSourceRef>(null);

  let initialRegion: LocationObjectCoords = {
    latitude: 51.1657,
    longitude: 10.4515
  };

  if (locations?.[0]?.position?.latitude && locations[0]?.position?.longitude) {
    initialRegion = {
      ...initialRegion,
      latitude: locations[0].position.latitude,
      longitude: locations[0].position.longitude
    };
  }

  let mapCenterPosition = {} as LocationObjectCoords;

  if (alternativePosition) {
    mapCenterPosition = getLocationMarker(alternativePosition).position;
  } else if (defaultAlternativePosition) {
    mapCenterPosition = getLocationMarker(defaultAlternativePosition).position;
  }

  if (mapCenterPosition) {
    initialRegion = {
      ...initialRegion,
      ...mapCenterPosition
    };
  }

  const handleClusterPress = async (event: any) => {
    const cluster = event.features[0];

    if (cluster?.type === 'Feature') {
      const zoomForCluster = (await shapeSourceRef.current?.getClusterExpansionZoom(cluster)) ?? 0;
      const newZoomLevel = Math.min(zoomForCluster, 20);

      cameraRef.current?.setCamera({
        animationDuration: 1500,
        animationMode: 'flyTo',
        centerCoordinate: cluster.geometry.coordinates,
        zoomLevel: newZoomLevel
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        attributionEnabled={false}
        compassEnabled={false}
        mapStyle="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
        ref={mapRef}
        rotateEnabled={false}
        style={[styles.map, mapStyle]}
        zoomEnabled
      >
        <Camera
          centerCoordinate={[initialRegion.longitude, initialRegion.latitude]}
          followUserLocation={followsUserLocation}
          followUserMode={UserTrackingMode.FollowWithHeading}
          minZoomLevel={minZoom}
          ref={cameraRef}
          zoomLevel={initialZoomLevel}
        />

        <UserLocation
          androidRenderMode="compass"
          renderMode={UserLocationRenderMode.Native}
          showsUserHeadingIndicator
          visible={showsUserLocation}
        />

        <Images images={markerImages} />

        <ShapeSource
          id="benches"
          ref={shapeSourceRef}
          shape={featureCollection(
            locations?.map((location) =>
              point([location.position.longitude, location.position.latitude], { ...location })
            )
          )}
          onPress={handleClusterPress}
          cluster
          clusterRadius={50}
          clusterMaxZoomLevel={clusterMaxZoom}
          clusterProperties={clusterProperties}
        >
          <CircleLayer
            id="cluster-shadow"
            filter={['has', 'point_count']}
            style={{ ...layerStyles.clusteredCircleShadow, circlePitchAlignment: 'map' }}
          />

          <SymbolLayer
            id="single-icon"
            filter={['!', ['has', 'point_count']]}
            style={{ ...layerStyles.singleIcon, iconImage: ['get', 'iconName'] }}
          />

          <CircleLayer
            id="cluster"
            filter={['has', 'point_count']}
            style={{
              ...layerStyles.clusteredCircle,
              circlePitchAlignment: 'map',
              circleColor: clusterCircleColor
            }}
          />

          <SymbolLayer
            id="cluster-count"
            style={{
              ...layerStyles.clusterCount,
              textField: ['format', ['concat', ['get', 'point_count']]],
              textPitchAlignment: 'map'
            }}
          />
        </ShapeSource>

        {selectedFeature && calloutTextEnabled && (
          <MarkerView coordinate={selectedFeature.geometry.coordinates}>
            <CustomCallout feature={selectedFeature} />
          </MarkerView>
        )}
      </MapView>

      {isMyLocationButtonVisible && (
        <View style={styles.myLocationContainer}>
          <TouchableOpacity
            accessibilityLabel={`${texts.components.map} ${a11yLabel.button}`}
            onPress={() => {
              setFollowsUserLocation(true);
              setTimeout(() => setFollowsUserLocation(false), 2000);
            }}
            style={styles.buttons}
          >
            <Icon.GPS size={normalize(18)} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  buttons: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center'
  },
  callout: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    elevation: 5,
    padding: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  calloutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(140)
  },
  calloutTriangel: {
    alignSelf: 'center',
    borderLeftColor: colors.transparent,
    borderLeftWidth: 10,
    borderRightColor: colors.transparent,
    borderRightWidth: 10,
    borderTopColor: colors.surface,
    borderTopWidth: 10,
    height: 0,
    marginTop: -1,
    width: 0
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  map: {
    flex: 1
  },
  myLocationContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    top: normalize(15),
    width: normalize(48),
    zIndex: 10
  }
});
