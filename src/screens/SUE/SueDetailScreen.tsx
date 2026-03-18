import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';
import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useQuery } from 'react-query';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { NetworkContext } from '../../NetworkProvider';
import {
  BoldText,
  HtmlView,
  ImageSection,
  LoadingContainer,
  MapLibre,
  RegularText,
  SafeAreaViewFlex,
  SueCategory,
  SueDatetime,
  SueImageFallback,
  SueStatus,
  SueStatuses,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { colors, device, normalize, texts } from '../../config';
import { QUERY_TYPES, getQuery } from '../../queries';

/* eslint-disable complexity */
export const SueDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const { statuses } = sueStatus;
  const queryVariables = route.params?.queryVariables ?? {};
  const [refreshing, setRefreshing] = useState(false);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const { bottom: safeAreaBottom, top: safeAreaTop } = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabBarHeight();

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
    id,
    lat: latitude,
    long: longitude,
    mediaUrl,
    requestedDatetime,
    serviceName,
    serviceNotice,
    serviceRequestId,
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
        <View style={[isFullscreenMap && styles.wrapperHidden]}>
          <ImageSection mediaContents={mediaContents} />
          {!mediaContents?.length && <SueImageFallback style={styles.sueImageContainer} />}

          {!!serviceName && !!requestedDatetime && (
            <SueCategory serviceName={serviceName} requestedDatetime={requestedDatetime} />
          )}

          {!!title && (
            <WrapperHorizontal>
              <BoldText big>{serviceRequestId ? `#${serviceRequestId} ${title}` : title}</BoldText>
            </WrapperHorizontal>
          )}

          {!!status && (
            <SueStatus iconName={matchedStatus.iconName} status={matchedStatus?.status} />
          )}

          <WrapperHorizontal>
            <Divider />
          </WrapperHorizontal>

          {!!description && (
            <>
              <Wrapper>
                <BoldText>{texts.sue.description}</BoldText>
                <HtmlView big={false} html={description} />
              </Wrapper>

              <WrapperHorizontal>
                <Divider />
              </WrapperHorizontal>
            </>
          )}
        </View>
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
        {((!!latitude && !!longitude) || !!address) && (
          <Wrapper noPaddingBottom noPaddingTop={isFullscreenMap}>
            <BoldText style={[isFullscreenMap && styles.wrapperHidden]}>
              {texts.sue.location}
            </BoldText>
            {!!latitude && !!longitude && isConnected && isMainserverUp && (
              <MapLibre
                isMyLocationButtonVisible={false}
                locations={[
                  {
                    iconName: `Sue${_upperFirst(matchedStatus.iconName)}`,
                    id,
                    position: { latitude, longitude }
                  }
                ]}
                mapStyle={[
                  styles.map,
                  isFullscreenMap && styles.fullscreenMap,
                  isFullscreenMap && {
                    height:
                      device.height -
                      safeAreaBottom -
                      safeAreaTop -
                      bottomTabBarHeight -
                      (device.platform === 'android' ? getStatusBarHeight() : 0)
                  }
                ]}
                onMaximizeButtonPress={() => setIsFullscreenMap((prev: boolean) => !prev)}
              />
            )}
          </Wrapper>
        )}

        <View style={[isFullscreenMap && styles.wrapperHidden]}>
          {!!address && (
            <Wrapper noPaddingTop>
              <RegularText>{address.replace('\r\n ', '\r\n')}</RegularText>
            </Wrapper>
          )}

          {((!!latitude && !!longitude) || !!address) && (
            <WrapperHorizontal>
              <Divider />
            </WrapperHorizontal>
          )}

          {!!requestedDatetime && <SueDatetime requestedDatetime={requestedDatetime} />}

          {!!status && <SueStatuses status={status} />}

          {!!serviceNotice && (
            <>
              <WrapperHorizontal>
                <Divider />
              </WrapperHorizontal>

              <Wrapper>
                <BoldText>{texts.sue.answer}</BoldText>
                <HtmlView big={false} html={serviceNotice} />
              </Wrapper>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  fullscreenMap: {
    marginLeft: 0,
    width: device.width
  },
  map: {
    height: normalize(300),
    width: '100%'
  },
  sueImageContainer: {
    width: '100%'
  },
  wrapperHidden: {
    display: 'none'
  }
});
