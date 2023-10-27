import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useQuery } from 'react-query';
import { Divider } from 'react-native-elements';

import { NetworkContext } from '../../../NetworkProvider';
import { colors, texts } from '../../../config';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { HtmlView } from '../../HtmlView';
import { ImageSection } from '../../ImageSection';
import { SUEAddress, SUECategory, SUEStatus } from '../../SUE';
import { SUEDatetime } from '../../SUE/SUEDatetime';
import { SafeAreaViewFlex } from '../../SafeAreaViewFlex';
import { SectionHeader } from '../../SectionHeader';
import { BoldText } from '../../Text';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../../Wrapper';
import { Map } from '../../map';
import { SUEStatuses } from '../../SUE/SUEStatuses';

type Props = {
  navigation: StackNavigationProp<never>;
  route: RouteProp<any, never>;
};

/* eslint-disable complexity */
export const SUEDetailScreen = ({ navigation, route }: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const queryVariables = route.params?.queryVariables ?? {};
  const [refreshing, setRefreshing] = useState(false);

  const { data, refetch } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, queryVariables?.id],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID)(queryVariables?.id)
  );

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
          <SUECategory serviceName={serviceName} requestedDate={requestedDatetime} />
        )}

        {!!title && (
          <WrapperHorizontal>
            <BoldText big>{title}</BoldText>
          </WrapperHorizontal>
        )}

        {!!status && <SUEStatus status={status} backgroundColors="" textColors="" />}

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
        {!!address && <SUEAddress address={address} />}

        {((!!latitude && !!longitude) || !!address) && (
          <WrapperHorizontal>
            <Divider />
          </WrapperHorizontal>
        )}

        {!!requestedDatetime && <SUEDatetime requestedDatetime={requestedDatetime} />}

        {!!status && <SUEStatuses status={status} />}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

SUEDetailScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
