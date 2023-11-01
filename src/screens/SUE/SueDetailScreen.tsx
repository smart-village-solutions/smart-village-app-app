import { RouteProp } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';
import { useQuery } from 'react-query';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import {
  BoldText,
  HtmlView,
  ImageSection,
  LoadingContainer,
  Map,
  SafeAreaViewFlex,
  SueAddress,
  SueCategory,
  SueDatetime,
  SueStatus,
  SueStatuses,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { colors, device, normalize, texts } from '../../config';
import { QUERY_TYPES, getQuery } from '../../queries';

type Props = {
  route: RouteProp<any, never>;
};

/* eslint-disable complexity */
export const SueDetailScreen = ({ route }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { appDesignSystem = {} } = globalSettings;
  const { sueStatus = {} } = appDesignSystem;
  const { statuses } = sueStatus;
  const queryVariables = route.params?.queryVariables ?? {};
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch, isLoading } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, queryVariables?.id],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID)(queryVariables?.id)
  );

  if (isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const {
    address,
    description,
    lat: latitude,
    long: longitude,
    mediaUrl,
    requestedDatetime,
    serviceName,
    status,
    title
  } = data;

  const refresh = async () => {
    setRefreshing(true);
    isConnected && (await refetch());
    setRefreshing(false);
  };

  const mediaContents = (mediaUrl || []).map(
    ({ id, url, visible }: { id: string; url: string; visible: boolean }) => ({
      id,
      sourceUrl: { url },
      visible,
      contentType: 'image'
    })
  );

  const matchedStatus = statuses?.find((item: { matchingStatuses: string[] }) =>
    item.matchingStatuses.includes(status)
  );

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        <ImageSection mediaContents={mediaContents} />

        {!!serviceName && !!requestedDatetime && (
          <SueCategory serviceName={serviceName} requestedDateTime={requestedDatetime} />
        )}

        {!!title && (
          <WrapperHorizontal>
            <BoldText big>{title}</BoldText>
          </WrapperHorizontal>
        )}

        {!!status && <SueStatus iconName={matchedStatus.iconName} status={matchedStatus?.status} />}

        <WrapperHorizontal>
          <Divider />
        </WrapperHorizontal>

        {!!description && (
          <>
            <Wrapper>
              <BoldText>{texts.sue.description}</BoldText>
              <HtmlView html={description} />
            </Wrapper>

            <WrapperHorizontal>
              <Divider />
            </WrapperHorizontal>
          </>
        )}

        {/* There are several connection states that can happen
         * a) We are connected to a wifi and our mainserver is up (and reachable)
         *   a.1) OSM is reachable -> everything is fine
         *   a.2) OSM is not reachable -> white rectangle is shown
         * b) We are connected to a wifi and our mainserver is not reachable
         *   b.1) OSM is reachable -> we don't know and do not show the map for the cached data
         *   b.2) OSM is not reachable -> everything is fine
         *
         * we can also not check for isMainserverUp here, but then we would only verify that we are
         * connected to a network with no information of internet connectivity.
         */}
        {!!latitude && !!longitude && isConnected && isMainserverUp && (
          <Wrapper style={styles.noPaddingBottom}>
            <BoldText>{texts.sue.location}</BoldText>
            <Map
              locations={[
                {
                  position: { latitude, longitude }
                }
              ]}
              mapStyle={styles.mapStyle}
            />
          </Wrapper>
        )}
        {!!address && <SueAddress address={address} />}

        {((!!latitude && !!longitude) || !!address) && (
          <WrapperHorizontal>
            <Divider />
          </WrapperHorizontal>
        )}

        {!!requestedDatetime && <SueDatetime requestedDatetime={requestedDatetime} />}

        {!!status && <SueStatuses status={status} />}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  mapStyle: {
    width: device.width - 2 * normalize(14)
  },
  noPaddingBottom: {
    paddingBottom: 0
  }
});
