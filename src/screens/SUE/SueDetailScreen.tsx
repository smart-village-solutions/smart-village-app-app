import { StackScreenProps } from 'expo-router/js-stack';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import _upperFirst from 'lodash/upperFirst';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useQuery } from 'react-query';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { NetworkContext } from '../../NetworkProvider';
import { useReadAloudScrollContentContainerStyle } from '../../ReadAloudAvailabilityProvider';
import {
  BoldText,
  Button,
  HtmlView,
  ImageSection,
  LoadingContainer,
  MapLibre,
  ReadAloudContent,
  RegularText,
  SafeAreaViewFlex,
  SueCategory,
  SueDatetime,
  SueStatus,
  SueStatuses,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { SUE_MY_REPORTS, device, normalize, texts } from '../../config';
import { getVisibleSueStatus, readFromStore } from '../../helpers';
import { getSueApiConfig } from '../../helpers/sueHelper';
import {
  readSueOutbox,
  sueOutboxPresentation,
  SueDeliveryStatus
} from '../../helpers/sueReportStorage';
import { retrySueReport } from '../../helpers/sueReportSync';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ScreenName } from '../../types';

/* eslint-disable complexity */
export const SueDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { appDesignSystem = {}, sueConfig = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const { statuses } = sueStatus;
  const query = route.params?.query ?? QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID;
  const queryVariables = route.params?.queryVariables ?? {};
  const scrollContentContainerStyle = useReadAloudScrollContentContainerStyle();
  const [refreshing, setRefreshing] = useState(false);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [isMyReport, setIsMyReport] = useState<boolean>(false);
  const { bottom: safeAreaBottom, top: safeAreaTop } = useSafeAreaInsets();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const localId = route.params?.localId || route.params?.details?.localId;
  const { data: savedEntry, refetch: refetchSavedEntry } = useQuery(
    ['sueOutboxReport', localId],
    async () => (await readSueOutbox()).find((entry) => entry.localId === localId),
    { enabled: !!localId }
  );
  const localDetails = savedEntry ? sueOutboxPresentation(savedEntry) : route.params?.details;
  const deliveryStatus = localDetails?.deliveryStatus as SueDeliveryStatus | undefined;
  const remoteId = savedEntry?.serviceRequestId || queryVariables?.id;
  const currentEndpoint = `${
    getSueApiConfig((sueConfig as { apiConfig?: Record<string, unknown> }).apiConfig).serverUrl
  }/requests`;
  const sameEndpoint =
    !localDetails?.submissionEndpoint || localDetails.submissionEndpoint === currentEndpoint;
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    try {
      await retrySueReport(localId);
      await refetchSavedEntry();
    } catch {
      Alert.alert(texts.sue.report.alerts.hint, texts.sue.delivery.actionError);
    } finally {
      setRetrying(false);
    }
  };

  const { data, refetch, isLoading } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, remoteId],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID)(remoteId),
    { enabled: !!remoteId && sameEndpoint && isConnected }
  );

  useEffect(() => {
    const checkIfMyReport = async () => {
      try {
        const myReportsJson = await readFromStore(SUE_MY_REPORTS);
        const myReports = [
          ...JSON.parse(myReportsJson || '[]'),
          ...(await readSueOutbox()).map(sueOutboxPresentation)
        ];
        const found = myReports.some(
          (report: { serviceRequestId?: string | number; submissionEndpoint?: string }) =>
            report.serviceRequestId &&
            String(report.serviceRequestId) === String(remoteId) &&
            (!report.submissionEndpoint || report.submissionEndpoint === currentEndpoint)
        );

        setIsMyReport(!!found);
      } catch (e) {
        console.error('Error checking if report is my report', e);
      }
    };

    checkIfMyReport();
  }, [data, queryVariables, route.params, remoteId, currentEndpoint]);

  if (query === QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID && isLoading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  const details =
    query === QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID ? data || {} : localDetails || {};
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
  } = details;
  const visibleStatus =
    query === QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID
      ? getVisibleSueStatus(details, sueConfig.showInternalPendingStatus)
      : typeof status === 'string'
      ? status
      : undefined;

  const refresh = async () => {
    setRefreshing(true);
    if (localId) await refetchSavedEntry();
    if (isConnected && remoteId && sameEndpoint) await refetch();
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

  const matchedStatus = visibleStatus
    ? statuses?.find((item: { matchingStatuses: string[] }) =>
        item.matchingStatuses.includes(visibleStatus)
      )
    : undefined;

  return (
    <SafeAreaViewFlex>
      <ScrollView
        contentContainerStyle={scrollContentContainerStyle}
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

          {!!serviceName && !!requestedDatetime && (
            <SueCategory serviceName={serviceName} requestedDatetime={requestedDatetime} />
          )}

          {!!title && (
            <WrapperHorizontal>
              <BoldText big>{serviceRequestId ? `#${serviceRequestId} ${title}` : title}</BoldText>
            </WrapperHorizontal>
          )}

          {!!deliveryStatus && query === QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID && (
            <Wrapper>
              <BoldText>{texts.sue.delivery.labels[deliveryStatus]}</BoldText>
              <RegularText>{texts.sue.delivery.messages[deliveryStatus]}</RegularText>
              {!sameEndpoint && <RegularText>{texts.sue.delivery.differentServer}</RegularText>}
              {sameEndpoint && localDetails.deliveryStatus === 'failed' && (
                <Button
                  title={texts.sue.delivery.edit}
                  accessibilityLabel={texts.sue.delivery.edit}
                  accessibilityHint={texts.sue.delivery.messages.failed}
                  small={false}
                  smallest={false}
                  onPress={() =>
                    navigation.push(ScreenName.SueReport, { rejectedReportId: localId })
                  }
                />
              )}
              {sameEndpoint && ['failed', 'uncertain'].includes(localDetails.deliveryStatus) && (
                <Button
                  disabled={retrying}
                  title={texts.sue.delivery.retry}
                  accessibilityLabel={texts.sue.delivery.retry}
                  accessibilityHint={texts.sue.delivery.messages[deliveryStatus]}
                  small={false}
                  smallest={false}
                  onPress={() => {
                    if (localDetails.deliveryStatus === 'uncertain') {
                      Alert.alert(texts.sue.delivery.retryTitle, texts.sue.delivery.retryMessage, [
                        { text: texts.sue.report.alerts.close, style: 'cancel' },
                        { text: texts.sue.delivery.retry, onPress: retry }
                      ]);
                    } else {
                      void retry();
                    }
                  }}
                />
              )}
            </Wrapper>
          )}

          {!!matchedStatus && (
            <SueStatus iconName={matchedStatus.iconName} status={matchedStatus?.status} />
          )}

          <WrapperHorizontal>
            <Divider />
          </WrapperHorizontal>

          {((query === QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID &&
            sameEndpoint &&
            !!remoteId &&
            !!data?.serviceRequestId &&
            data?.status !== 404) ||
            (query === QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID && isMyReport)) && (
            <Wrapper noPaddingBottom>
              <Button
                big={false}
                disabled={false}
                icon=""
                invert
                small={false}
                smallest={false}
                onPress={async () => {
                  // Determine which query we are navigating to
                  const targetQuery =
                    query === QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID
                      ? QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID
                      : QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID;
                  let details = route.params?.details;

                  // When navigating to "Mein gespeicherter Bericht", prefer local data from SUE_MY_REPORTS
                  if (targetQuery === QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID) {
                    try {
                      const storedReportsJson = await readFromStore(SUE_MY_REPORTS);

                      const storedReports = [
                        ...JSON.parse(storedReportsJson || '[]'),
                        ...(await readSueOutbox()).map(sueOutboxPresentation)
                      ];
                      const matchingReport = storedReports.find(
                        (report: {
                          serviceRequestId?: string | number;
                          submissionEndpoint?: string;
                        }) =>
                          String(report.serviceRequestId) === String(serviceRequestId) &&
                          (!report.submissionEndpoint ||
                            report.submissionEndpoint === currentEndpoint)
                      );

                      if (matchingReport) {
                        details = matchingReport;
                      }
                    } catch (e) {
                      // In case of any storage error, fall back to existing route params
                    }
                  }

                  navigation.push(ScreenName.Detail, {
                    bookmarkable: false,
                    localId: details?.localId,
                    details,
                    query: targetQuery,
                    queryVariables: { id: serviceRequestId },
                    title: `#${serviceRequestId} ${title}`
                  });
                }}
                title={
                  query === QUERY_TYPES.SUE.MY_REQUEST_WITH_SERVICE_REQUEST_ID
                    ? texts.sue.viewOfficialReportDetail
                    : texts.sue.viewMyReportDetail
                }
              />
            </Wrapper>
          )}

          {!!description && (
            <>
              <Wrapper>
                <BoldText>{texts.sue.description}</BoldText>
                <ReadAloudContent
                  content={description}
                  contentId="sue-detail-description-content"
                />
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
                    iconName: matchedStatus?.iconName
                      ? `Sue${_upperFirst(matchedStatus.iconName)}`
                      : undefined,
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

          {!!visibleStatus && <SueStatuses status={visibleStatus} />}

          {!!serviceNotice && (
            <>
              <WrapperHorizontal>
                <Divider />
              </WrapperHorizontal>

              <Wrapper>
                <BoldText>{texts.sue.answer}</BoldText>
                <ReadAloudContent content={serviceNotice} contentId="sue-detail-answer-content" />
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

const createStyles = () => ({
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
