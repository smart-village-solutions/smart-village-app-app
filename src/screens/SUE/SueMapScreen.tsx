import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
  RegularText,
  SafeAreaViewFlex,
  SueImageFallback,
  SueStatus,
  Touchable,
  Wrapper
} from '../../components';
import { Icon, colors, consts, normalize, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';

const CloseButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.closeButton}>
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
  statusViewColors: Record<string, string | undefined>,
  statusTextColors: Record<string, string | undefined>
): MapMarker[] | undefined =>
  items
    ?.filter((item) => item.lat && item.long)
    ?.map((item: ItemProps) => ({
      ...item,
      iconBackgroundColor: statusViewColors?.[item.status],
      iconColor: statusTextColors?.[item.status],
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
};

export const SueMapScreen = ({ navigation, route }: Props) => {
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { globalSettings } = useContext(SettingsContext);
  const { navigation: navigationType } = globalSettings;
  const { sueStatus = {} } = appDesignSystem;
  const { statusViewColors = {}, statusTextColors = {} } = sueStatus;
  const queryVariables = route.params?.queryVariables ?? {
    start_date: '1900-01-01T00:00:00+01:00'
  };
  const [selectedRequestId, setSelectedRequestId] = useState<string>();

  const { data, isLoading } = useQuery([QUERY_TYPES.SUE.REQUESTS, queryVariables], () =>
    getQuery(QUERY_TYPES.SUE.REQUESTS)(queryVariables)
  );

  const mapMarkers = useMemo(
    () =>
      mapToMapMarkers(
        parseListItemsFromQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, data, undefined, {
          appDesignSystem
        }),
        statusViewColors,
        statusTextColors
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
        isMultipleMarkersMap
        clusteringEnabled={true}
        locations={mapMarkers}
        mapStyle={styles.map}
        onMarkerPress={(id) => {
          // reset selected request id to undefined to avoid rendering bug with images in overlay
          setSelectedRequestId(undefined);

          setTimeout(() => {
            setSelectedRequestId(id);
          }, 100);
        }}
        selectedMarker={selectedRequestId}
      />
      {!detailsLoading && !!selectedRequestId && !!item && (
        <View style={[styles.listItemContainer, stylesWithProps({ navigationType }).position]}>
          <ListItem
            accessibilityLabel={`(${item.title}) ${consts.a11yLabel.button}`}
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
                <SueImageFallback style={styles.image} />
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
    </SafeAreaViewFlex>
  );
};

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
