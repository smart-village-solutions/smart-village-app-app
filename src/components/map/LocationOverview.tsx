import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { MapMarker, WebviewLeafletMessage } from 'react-native-webview-leaflet';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

import { colors, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { location, locationIconAnchor } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { LoadingContainer } from '../LoadingContainer';
import { SafeAreaViewFlex } from '../SafeAreaViewFlex';
import { PointOfInterest } from '../screens/PointOfInterest';
import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';
import { WebViewMap } from './WebViewMap';

type Props = {
  category: string;
  navigation: NavigationScreenProps;
};

// FIXME: with our current setup the data that we receive from a query is not typed
// if we change that then we can fix this place
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToMapMarkers = (data: any): MapMarker[] | undefined => {
  return (
    data?.[QUERY_TYPES.POINTS_OF_INTEREST]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ?.map((item: any) => {
        const latitude = item.addresses?.[0]?.geoLocation?.latitude;
        const longitude = item.addresses?.[0]?.geoLocation?.longitude;

        if (!latitude || !longitude) return undefined;
        return {
          icon: location(colors.primary),
          iconAnchor: locationIconAnchor,
          id: item.id,
          position: {
            lat: latitude,
            lng: longitude
          }
        };
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((item: any) => item !== undefined)
  );
};

export const LocationOverview = ({ navigation, category }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<string>();

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime: undefined });

  const overviewQuery = getQuery(QUERY_TYPES.POINTS_OF_INTEREST);
  const { data: overviewData, loading } = useQuery(overviewQuery, {
    fetchPolicy,
    variables: { category }
  });

  const detailsQuery = getQuery(QUERY_TYPES.POINT_OF_INTEREST);
  const { data: detailsData, loading: detailsLoading } = useQuery(detailsQuery, {
    fetchPolicy,
    variables: { id: selectedPointOfInterest },
    skip: !selectedPointOfInterest
  });

  const onMessageReceived = useCallback(
    (message: WebviewLeafletMessage) => {
      if (message.event === 'onMapMarkerClicked') {
        setSelectedPointOfInterest(message.payload?.mapMarkerID);
      }
    },
    [setSelectedPointOfInterest, overviewData]
  );

  if (loading || !overviewData?.[QUERY_TYPES.POINTS_OF_INTEREST]) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.accent} />
      </LoadingContainer>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
          <WebViewMap
            locations={mapToMapMarkers(overviewData)}
            onMessageReceived={onMessageReceived}
          />
          <View>
            {!selectedPointOfInterest && (
              <Wrapper>
                <RegularText center>{texts.locationOverview.noSelection}</RegularText>
              </Wrapper>
            )}
            {detailsLoading ? (
              <LoadingContainer>
                <ActivityIndicator color={colors.accent} />
              </LoadingContainer>
            ) : (
              !!detailsData?.[QUERY_TYPES.POINT_OF_INTEREST] && (
                <PointOfInterest
                  data={detailsData[QUERY_TYPES.POINT_OF_INTEREST]}
                  navigation={navigation}
                  hideMap
                />
              )
            )}
          </View>
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
