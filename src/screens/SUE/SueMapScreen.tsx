import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { useQuery } from 'react-query';

import { SettingsContext } from '../../SettingsProvider';
import {
  BoldText,
  Image,
  LoadingContainer,
  Map,
  RegularText,
  SafeAreaViewFlex,
  SueStatus,
  Touchable,
  Wrapper
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import { parseListItemsFromQuery } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MapMarker } from '../../types';

type ItemProps = {
  lat: number;
  long: number;
  serviceRequestId: string;
  title: string;
};

const mapToMapMarkers = (items: ItemProps[]): MapMarker[] | undefined =>
  items
    ?.filter((item) => item.lat && item.long)
    ?.map((item: ItemProps) => ({
      iconAnchor: undefined,
      iconName: undefined,
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
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem, navigation: navigationType } = globalSettings;
  const queryVariables = route.params?.queryVariables ?? {};
  const [selectedRequest, setSelectedRequest] = useState<string>();

  const { data, isLoading } = useQuery([QUERY_TYPES.SUE.REQUESTS, queryVariables], () =>
    getQuery(QUERY_TYPES.SUE.REQUESTS)(queryVariables)
  );

  const mapMarkers = useMemo(() => {
    return mapToMapMarkers(data);
  }, [data]);

  const { data: detailsData } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, selectedRequest],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID)(selectedRequest),
    { enabled: !!selectedRequest }
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
        locations={mapMarkers}
        mapStyle={styles.map}
        onMarkerPress={setSelectedRequest}
        selectedMarker={selectedRequest}
      />
      {!!selectedRequest && !!item && (
        <View style={[styles.listItemContainer, stylesWithProps({ navigationType }).position]}>
          <ListItem
            accessibilityLabel={`(${item.title}) ${consts.a11yLabel.button}`}
            containerStyle={styles.listItem}
            Component={Touchable}
            delayPressIn={0}
            onPress={() => navigation.push(item.routeName, item.params)}
          >
            {!!item.picture?.url && (
              <Image
                source={{ uri: item.picture.url }}
                style={styles.image}
                containerStyle={styles.imageContainer}
              />
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
