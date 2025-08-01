import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { useQuery } from 'react-query';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { SettingsContext } from '../../SettingsProvider';
import {
  BoldText,
  Image,
  LoadingContainer,
  Map,
  MapAndListSwitcher,
  RegularText,
  SafeAreaViewFlex,
  SueImageFallback,
  SueStatus,
  Touchable,
  Wrapper,
  locationServiceEnabledAlert
} from '../../components';
import { Icon, colors, consts, normalize, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker, SueViewType } from '../../types';

const CloseButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    accessibilityLabel={consts.a11yLabel.closeIcon}
    onPress={onPress}
    style={styles.closeButton}
  >
    <Icon.Close size={normalize(16)} color={colors.surface} />
  </TouchableOpacity>
);

type ItemProps = {
  iconName: string;
  lat: number;
  long: number;
  serviceRequestId: string;
  status: string;
  title: string;
};

export const mapToMapMarkers = (
  items: ItemProps[],
  activeBackgroundColors: Record<string, string | undefined>,
  activeIconColors: Record<string, string | undefined>,
  backgroundColors: Record<string, string | undefined>,
  iconColors: Record<string, string | undefined>
): MapMarker[] | undefined =>
  items
    ?.filter((item) => item.lat && item.long)
    ?.map((item: ItemProps) => ({
      ...item,
      activeBackgroundColor: activeBackgroundColors?.[item.status],
      iconBackgroundColor: backgroundColors?.[item.status],
      activeIconColor: activeIconColors?.[item.status],
      iconColor: iconColors?.[item.status],
      iconBorderColor: iconColors?.[item.status],
      iconName: `Sue${_upperFirst(item.iconName)}`,
      id: item.serviceRequestId,
      position: {
        latitude: item.lat,
        longitude: item.long
      },
      title: item.title
    }));

type Props = {
  navigation: StackNavigationProp<Record<string, any>>;
  route: RouteProp<any, never>;
  viewType: SueViewType;
  setViewType: (viewType: SueViewType) => void;
};

/* eslint-disable complexity */
export const SueMapScreen = ({ navigation, route, viewType, setViewType }: Props) => {
  const { locationSettings = {} } = useLocationSettings();
  const { locationService: locationServiceEnabled } = locationSettings;
  const { appDesignSystem = {}, sueConfig = {} } = useContext(ConfigurationsContext);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType, settings = {} } = globalSettings;
  const { locationService } = settings;
  const { sueStatus = {}, sueListItem = {} } = appDesignSystem;
  const { mapPinColors = {} } = sueStatus;
  const { showViewSwitcherButton = false } = sueListItem;
  const { geoMap = {} } = sueConfig;
  const systemPermission = useSystemPermission();
  const { position } = usePosition(systemPermission?.status !== Location.PermissionStatus.GRANTED);
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED
  );

  const {
    activeBackgroundColors = {},
    activeIconColors = {},
    backgroundColors = {},
    iconColors = {}
  } = mapPinColors;

  const queryVariables = route.params?.queryVariables ?? {
    start_date: '1900-01-01T00:00:00+01:00'
  };
  const [selectedRequestId, setSelectedRequestId] = useState<string>();

  const [currentPosition, setCurrentPosition] = useState<
    Location.LocationObjectCoords | undefined
  >();
  const [updateRegion, setUpdatedRegion] = useState<boolean>(false);

  const { data, isLoading } = useQuery([QUERY_TYPES.SUE.LOCATION, queryVariables], () =>
    getQuery(QUERY_TYPES.SUE.LOCATION)(queryVariables)
  );

  const mapMarkers = useMemo(
    () =>
      mapToMapMarkers(
        parseListItemsFromQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, data, undefined, {
          appDesignSystem
        }),
        activeBackgroundColors,
        activeIconColors,
        backgroundColors,
        iconColors
      ),
    [data]
  );

  const { data: detailsData, isLoading: detailsLoading } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, selectedRequestId],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID)(selectedRequestId),
    { enabled: !!selectedRequestId }
  );

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  if (!mapMarkers?.length) {
    return (
      <Wrapper>
        <RegularText placeholder small center>
          {texts.map.noGeoLocations}
        </RegularText>
      </Wrapper>
    );
  }

  const item = detailsData
    ? parseListItemsFromQuery(
        QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID,
        [detailsData],
        undefined,
        { appDesignSystem }
      )?.[0]
    : undefined;

  return (
    <SafeAreaViewFlex>
      <Map
        clusterDistance={geoMap?.clusterDistance}
        clusteringEnabled
        isMultipleMarkersMap
        isMyLocationButtonVisible={!!locationService}
        locations={mapMarkers}
        mapStyle={styles.map}
        onMarkerPress={(id) => {
          // reset selected request id to undefined to avoid rendering bug with images in overlay
          setSelectedRequestId(undefined);

          setTimeout(() => {
            setSelectedRequestId(id);
          }, 100);
        }}
        onMyLocationButtonPress={() => {
          const location = position || lastKnownPosition;

          locationServiceEnabledAlert({
            currentPosition: location,
            locationServiceEnabled,
            navigation
          });

          setUpdatedRegion(true);
          setCurrentPosition(location?.coords);

          setTimeout(() => {
            setUpdatedRegion(false);
          }, 100);
        }}
        selectedMarker={selectedRequestId}
        updatedRegion={
          !!currentPosition && updateRegion
            ? {
                ...currentPosition,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
              }
            : undefined
        }
      />
      {!detailsLoading && !!selectedRequestId && !!item && (
        <View style={[styles.listItemContainer, stylesWithProps({ navigationType }).position]}>
          <ListItem
            accessibilityLabel={`${item.title} ${consts.a11yLabel.button}`}
            containerStyle={styles.listItem}
            Component={Touchable}
            delayPressIn={0}
            onPress={() => navigation.push(item.routeName, item.params)}
          >
            {item.picture?.url ? (
              <>
                <Image
                  source={{ uri: item.picture.url }}
                  childrenContainerStyle={styles.image}
                  containerStyle={styles.imageContainer}
                />
                <CloseButton onPress={() => setSelectedRequestId(undefined)} />
              </>
            ) : (
              <>
                <SueImageFallback style={[styles.imageContainer, styles.image]} />
                <CloseButton onPress={() => setSelectedRequestId(undefined)} />
              </>
            )}

            <ListItem.Content>
              <BoldText small>{item.title}</BoldText>
              <View style={styles.padding}>
                <RegularText smallest>{item.address}</RegularText>
              </View>
              <SueStatus iconName={item.iconName} status={item.status} small />
            </ListItem.Content>
          </ListItem>
        </View>
      )}
      {!!showViewSwitcherButton && (
        <MapAndListSwitcher viewType={viewType} setViewType={setViewType} />
      )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.placeholder,
    borderRadius: normalize(12),
    height: normalize(22),
    justifyContent: 'center',
    left: normalize(12),
    position: 'absolute',
    top: normalize(12),
    width: normalize(22)
  },
  listItemContainer: {
    backgroundColor: colors.surface,
    borderRadius: normalize(8),
    left: '4%',
    position: 'absolute',
    right: '4%',
    width: '92%',
    // shadow:
    elevation: 2,
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 5,
      width: 0
    },
    shadowOpacity: 0.5,
    shadowRadius: 3
  },
  listItem: {
    borderRadius: normalize(8),
    padding: 0,
    paddingRight: 14
  },
  map: {
    height: '100%',
    width: '100%'
  },
  image: {
    height: normalize(120),
    width: normalize(120)
  },
  imageContainer: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: normalize(8),
    borderTopLeftRadius: normalize(8)
  },
  padding: {
    paddingVertical: normalize(4)
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ navigationType }: { navigationType: string }) => {
  return StyleSheet.create({
    position: {
      bottom: navigationType === 'drawer' ? '8%' : '4%'
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
