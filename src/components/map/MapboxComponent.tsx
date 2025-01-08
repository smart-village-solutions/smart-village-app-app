import Mapbox, {
  Camera,
  CircleLayer,
  Image,
  Images,
  LineLayer,
  LocationPuck,
  MapView,
  MarkerView,
  ShapeSource,
  SymbolLayer
} from '@rnmapbox/maps';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
import turfDistance from '@turf/distance';
import { featureCollection, lineString, point } from '@turf/helpers';
import React, { useContext, useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { LatLng, Region } from 'react-native-maps';

import { colors, consts, device, Icon, normalize, texts } from '../../config';
import { imageHeight, imageWidth, truncateText } from '../../helpers';
import { useLocationSettings } from '../../hooks';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { BoldText, RegularText } from '../Text';

import { MapIcon } from './Map';

const { a11yLabel } = consts;

Mapbox.setAccessToken('');

const MARKER_ICON_SIZE = normalize(40);
const CIRCLE_SIZES = [60, 50, 40, 30];

const renderClusterCircles = () =>
  CIRCLE_SIZES.map((size, index) => (
    <CircleLayer
      filter={['has', 'point_count']}
      id={`cluster-circle-${index}`}
      key={`cluster-circle-${index}`}
      style={{
        circleColor: colors.primary,
        circleOpacity: 0.2 * (index + 1),
        circleRadius: normalize(size / 2)
      }}
    />
  ));

const renderClusterNumbers = () => (
  <SymbolLayer
    filter={['has', 'point_count']}
    id="cluster-count"
    style={{
      textColor: colors.lightestText,
      textField: ['get', 'point_count'],
      textSize: normalize(12)
    }}
  />
);

const CustomCalloutView = ({ feature }: { feature: GeoJSON.Feature }) => {
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

/* eslint-disable complexity  */
/* eslint-disable react-native/no-inline-styles */
export const MapboxComponent = ({
  calloutTextEnabled = false,
  isMultipleMarkersMap = false,
  geometryTourData,
  clusterDistance,
  clusteringEnabled,
  locations,
  isMaximizeButtonVisible,
  onMaximizeButtonPress,
  onMyLocationButtonPress,
  isMyLocationButtonVisible = true,
  mapCenterPosition,
  mapStyle,
  minZoom,
  onMarkerPress,
  selectedMarker,
  style,
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
  const zoomLevel = 10;

  const [followsUserLocation, setFollowsUserLocation] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const shapeSourceRef = useRef(null);
  const cameraRef = useRef(null);
  const mapRef = useRef(null);

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

  const points = locations.map((location) =>
    point([location.position.longitude, location.position.latitude], {
      ...location
    })
  );

  const line =
    !!geometryTourData?.length &&
    lineString(geometryTourData.map((location) => [location.longitude, location.latitude]));

  const handleClusterPress = async (event: OnPressEvent) => {
    const { features, coordinates } = event;

    if (!features || features.length === 0) return;

    const clickedCoordinate = [coordinates.longitude, coordinates.latitude];
    const clusterFeature = features.find((f) => f.properties?.cluster === true);

    if (clusterFeature) {
      const zoom = await shapeSourceRef.current?.getClusterExpansionZoom(clusterFeature);

      cameraRef.current?.setCamera({
        animationDuration: 1000,
        centerCoordinate: clusterFeature.geometry.coordinates,
        zoomLevel: zoom
      });
      return;
    }

    const nearestFeature = features.reduce((closest, current) => {
      const currentCoordinate = current.geometry.coordinates;
      const distanceToCurrent = turfDistance(
        { type: 'Point', coordinates: clickedCoordinate },
        { type: 'Point', coordinates: currentCoordinate },
        { units: 'meters' }
      );

      if (!closest || distanceToCurrent < closest.distance) {
        return { feature: current, distance: distanceToCurrent };
      }

      return closest;
    }, null);

    if (nearestFeature) {
      setSelectedFeature(nearestFeature.feature);
      onMarkerPress?.(nearestFeature.feature.properties.id);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        compassEnabled={false}
        logoEnabled={false}
        onPress={(event) => console.log(event)}
        ref={mapRef}
        rotateEnabled={false}
        scaleBarEnabled={false}
        style={[styles.map, mapStyle]}
        styleJSON="https://tileserver-gl.smart-village.app/styles/osm-liberty/style.json"
      >
        <Camera
          animationDuration={0}
          centerCoordinate={[initialRegion.longitude, initialRegion.latitude]}
          minZoomLevel={minZoom}
          ref={cameraRef}
          followUserLocation={followsUserLocation}
          zoomLevel={zoomLevel}
        />

        {!!showsUserLocation && (
          <LocationPuck puckBearingEnabled puckBearing="heading" pulsing={{ isEnabled: true }} />
        )}

        {!!line && (
          <ShapeSource id="lineSource" shape={featureCollection([line])}>
            <LineLayer
              id="lineLayer"
              style={{
                lineCap: 'round',
                lineColor: colors.primary,
                lineJoin: 'round',
                lineWidth: normalize(7)
              }}
            />
          </ShapeSource>
        )}

        <ShapeSource
          cluster={clusteringEnabled}
          clusterMaxZoom={14}
          clusterRadius={clusterDistance}
          id="clusterSource"
          onPress={handleClusterPress}
          ref={shapeSourceRef}
          shape={featureCollection(points)}
        >
          <SymbolLayer
            filter={['!', ['has', 'point_count']]}
            id="symbolLayer"
            style={{
              iconImage: ['location'],
              iconAllowOverlap: true,
              iconAnchor: 'bottom'
            }}
          />

          <Images
            onImageMissing={(imageKey) => {
              console.warn(`Image not found: ${imageKey}`);
            }}
          >
            <Image name="location">
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <MapIcon iconColor={colors.accent} strokeColor={colors.accent} />
              </View>
            </Image>
          </Images>

          {renderClusterCircles()}
          {renderClusterNumbers()}
        </ShapeSource>

        {selectedFeature && calloutTextEnabled && (
          <MarkerView coordinate={selectedFeature.geometry.coordinates}>
            <CustomCalloutView feature={selectedFeature} />
          </MarkerView>
        )}
      </MapView>

      {isMyLocationButtonVisible && (
        <View style={styles.myLocationContainer}>
          <TouchableOpacity
            accessibilityLabel={`${texts.components.map} ${a11yLabel.button}`}
            onPress={() => {
              setFollowsUserLocation(true);
              onMyLocationButtonPress;
            }}
            style={styles.buttons}
          >
            <Icon.GPS size={normalize(18)} />
          </TouchableOpacity>
        </View>
      )}

      {isMaximizeButtonVisible && (
        <View style={styles.maximizeMapContainer}>
          <TouchableOpacity
            accessibilityLabel={`Karte vergrößern ${a11yLabel.button}`}
            onPress={onMaximizeButtonPress}
            style={styles.buttons}
          >
            <Icon.ExpandMap size={normalize(18)} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
/* eslint-enable complexity */
/* eslint-enable react-native/no-inline-styles */

const styles = StyleSheet.create({
  callout: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  calloutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(140)
  },
  calloutTriangel: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: colors.transparent,
    borderRightColor: colors.transparent,
    borderTopColor: colors.surface,
    alignSelf: 'center',
    marginTop: -1
  },
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
  maximizeMapContainer: {
    backgroundColor: colors.surface,
    borderRadius: 50,
    bottom: normalize(15),
    height: normalize(48),
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 1
  },
  buttons: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center'
  },
  myLocationContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    zIndex: 10,
    borderRadius: 50,
    top: normalize(15),
    height: normalize(48),
    justifyContent: 'center',
    position: 'absolute',
    right: normalize(15),
    width: normalize(48)
  }
});
