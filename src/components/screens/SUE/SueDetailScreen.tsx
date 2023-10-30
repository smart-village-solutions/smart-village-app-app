import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { Divider } from 'react-native-elements';
import { useQuery } from 'react-query';

import { NetworkContext } from '../../../NetworkProvider';
import { colors, texts } from '../../../config';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { HtmlView } from '../../HtmlView';
import { ImageSection } from '../../ImageSection';
import { SafeAreaViewFlex } from '../../SafeAreaViewFlex';
import { BoldText } from '../../Text';
import { Wrapper, WrapperHorizontal } from '../../Wrapper';
import { Map } from '../../map';
import { SueAddress, SueCategory, SueDatetime, SueStatus, SueStatuses } from '../../SUE';
import { LoadingContainer } from '../../LoadingContainer';

type Props = {
  navigation: StackNavigationProp<never>;
  route: RouteProp<any, never>;
};

/* eslint-disable complexity */
export const SueDetailScreen = ({ navigation, route }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
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

        {!!status && <SueStatus status={status} />}

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
          <Wrapper>
            <BoldText>{texts.sue.location}</BoldText>
            <Map
              locations={[
                {
                  position: { latitude, longitude }
                }
              ]}
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
