import React, { useContext, useEffect, useRef, useState } from 'react';
import { FlatList, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import MapView, { LatLng, MAP_TYPES, Marker, Polyline, Region, UrlTile } from 'react-native-maps';
import { SvgXml } from 'react-native-svg';

import { colors, device, Icon, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { SettingsContext } from '../../SettingsProvider';
import { MapMarker } from '../../types';
import { POIMapView } from '../POIMapView';

type Props = {
  geometryTourData?: LatLng[];
  isMaximizeButtonVisible?: boolean;
  isMultipleMarkersMap?: boolean;
  locations?: MapMarker[];
  mapCenterPosition?: { latitude: number; longitude: number };
  mapStyle?: StyleProp<ViewStyle>;
  onMapPress?: () => void;
  onMarkerPress?: (arg0?: string) => void;
  onMaximizeButtonPress?: () => void;
  showsUserLocation?: boolean;
  style?: StyleProp<ViewStyle>;
};

const MARKER_ICON_SIZE = normalize(40);

export const Map = ({
  geometryTourData,
  isMaximizeButtonVisible = false,
  isMultipleMarkersMap = false,
  locations,
  mapCenterPosition,
  mapStyle,
  onMapPress,
  onMarkerPress,
  onMaximizeButtonPress,
  style,
  ...otherProps
}: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { zoomLevelForMaps = {}, locationService = {} } = settings;

  // state to keep track of the currently active marker
  const [activeMarker, setActiveMarker] = useState(null);

  const showsUserLocation = otherProps.showsUserLocation ?? !!locationService;
  const zoom = isMultipleMarkersMap
    ? zoomLevelForMaps.multipleMarkers
    : zoomLevelForMaps.singleMarker;

  const refForMapView = useRef<MapView>(null);
  const flatListRef = useRef<FlatList>(null);
  // LATITUDE_DELTA handles the zoom, see: https://github.com/react-native-maps/react-native-maps/issues/2129#issuecomment-457056572
  const LATITUDE_DELTA = zoom || 0.0922;
  // example for longitude delta: https://github.com/react-native-maps/react-native-maps/blob/0.30.x/example/examples/DisplayLatLng.js#L18
  const LONGITUDE_DELTA = LATITUDE_DELTA * (device.width / (device.height / 2));

  let initialRegion: Region = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  };

  if (mapCenterPosition) {
    initialRegion = {
      ...initialRegion,
      ...mapCenterPosition
    };
  }

  if (locations?.[0]?.position?.latitude && locations[0]?.position?.longitude) {
    initialRegion = {
      ...initialRegion,
      latitude: locations[0].position.latitude,
      longitude: locations[0].position.longitude
    };
  }

  // ref function to handle changes in the viewable items of the FlatList
  // it sets the activeMarker state to the ID of the first viewable item
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const firstViewableItem = viewableItems[0]?.item;
    if (firstViewableItem) {
      setActiveMarker(firstViewableItem.id);
    }
  }).current;

  // useEffect to handle changes in activeMarker
  // it animates the map to focus on the coordinates of the active marker
  useEffect(() => {
    if (activeMarker && refForMapView.current) {
      const marker = locations?.find((loc) => loc.id === activeMarker);

      if (marker) {
        const { latitude, longitude } = marker.position;

        refForMapView.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          },
          500
        );
      }
    }
  }, [activeMarker]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        initialRegion={initialRegion}
        mapType={device.platform === 'android' ? MAP_TYPES.NONE : MAP_TYPES.STANDARD}
        onPress={onMapPress}
        ref={refForMapView}
        rotateEnabled={false}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        style={[stylesForMap().map, mapStyle]}
        userLocationPriority="balanced"
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
          urlTemplate="https://tile-server.sva-services.customer.planetary-quantum.net/tile/{z}/{x}/{y}.png"
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
        {locations?.map((marker, index) => (
          <Marker
            identifier={marker.id}
            key={`${index}-${marker.id}`}
            coordinate={marker.position}
            onPress={() => {
              if (onMarkerPress) {
                onMarkerPress(marker.id);

                // find the index of the clicked marker in the locations array
                const index = locations?.findIndex((loc) => loc.id === marker.id);

                // if the index is found and is valid, scroll the FlatList to that index
                if (index && index !== -1) {
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                }
              }
            }}
          >
            <SvgXml xml={marker.icon} width={MARKER_ICON_SIZE} height={MARKER_ICON_SIZE} />
          </Marker>
        ))}
      </MapView>

      {isMaximizeButtonVisible && (
        <TouchableOpacity style={styles.maximizeMapButton} onPress={onMaximizeButtonPress}>
          <Icon.ExpandMap size={normalize(18)} />
        </TouchableOpacity>
      )}

      <FlatList
        data={locations}
        getItemLayout={(data, index) => ({
          length: device.width,
          offset: device.width * index,
          index
        })}
        horizontal
        keyExtractor={(item) => item.id}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled
        ref={flatListRef}
        renderItem={({ item }) => <POIMapView item={item} />}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        style={styles.poiList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    justifyContent: 'center'
  },
  maximizeMapButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    bottom: normalize(15),
    height: normalize(48),
    justifyContent: 'center',
    opacity: 0.6,
    position: 'absolute',
    right: normalize(15),
    width: normalize(48),
    zIndex: 1
  },
  poiList: {
    position: 'absolute',
    bottom: 0
  }
});

// the map should have the same aspect ratio as images in portrait and a full width on landscape.
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten by server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForMap = () => {
  return StyleSheet.create({
    // eslint-disable-next-line react-native/no-unused-styles
    map: {
      alignSelf: 'center',
      height: imageHeight(imageWidth()),
      width: device.width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
