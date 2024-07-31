import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { SettingsContext } from '../../SettingsProvider';
import { colors, consts, normalize, texts } from '../../config';
import { isTodayOrLater, matomoTrackingString, openLink, trimNewLines } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { LoadingContainer } from '../LoadingContainer';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { Wrapper, WrapperHorizontal } from '../Wrapper';
import { InfoCard } from '../infoCard';

import { OpeningTimesCard } from './OpeningTimesCard';
import { OperatingCompany } from './OperatingCompany';
import { PriceCard } from './PriceCard';

// necessary hacky way of implementing iframe in webview with correct zoom level
// thx to: https://stackoverflow.com/a/55780430
const INJECTED_JAVASCRIPT_FOR_IFRAME_WEBVIEW = `
  const meta = document.createElement('meta');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=0.99, user-scalable=0');
  meta.setAttribute('name', 'viewport');
  document.getElementsByTagName('head')[0].appendChild(meta);
  true;
`;

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const EventRecord = ({ data, route }) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { eventDetail = {} } = settings;
  const { numToRender: MAX_INITIAL_NUM_TO_RENDER, appointmentsShowMoreButton } = eventDetail;
  const {
    addresses,
    categories,
    category,
    contacts,
    dataProvider,
    dates,
    description,
    mediaContents,
    operatingCompany,
    priceInformations,
    settings: webUrlsSettings,
    title,
    webUrls
  } = data;
  const link = webUrls && webUrls.length && webUrls[0].url;
  const rootRouteName = route.params?.rootRouteName ?? '';
  const headerTitle = route.params?.title ?? '';

  // action to open source urls
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);

  // the categories of a news item can be nested and we need the map of all names of all categories
  const categoryNames = categories && categories.map((category) => category.name).join(' / ');

  useMatomoTrackScreenView(
    matomoTrackingString([
      MATOMO_TRACKING.SCREEN_VIEW.EVENT_RECORDS,
      dataProvider && dataProvider.name,
      categoryNames,
      title
    ])
  );

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  let media = [];

  !!mediaContents &&
    !!mediaContents.length &&
    _filter(
      mediaContents,
      (mediaContent) => mediaContent.contentType === 'video' || mediaContent.contentType === 'audio'
    ).forEach((mediaContent) => {
      !!mediaContent.sourceUrl &&
        !!mediaContent.sourceUrl.url &&
        media.push(
          <WrapperHorizontal key={`mediaContent${mediaContent.id}`}>
            <WebView
              source={{ html: trimNewLines(mediaContent.sourceUrl.url) }}
              style={styles.iframeWebView}
              scrollEnabled={false}
              bounces={false}
              injectedJavaScript={INJECTED_JAVASCRIPT_FOR_IFRAME_WEBVIEW}
              startInLoadingState
              renderLoading={() => (
                <LoadingContainer web>
                  <ActivityIndicator color={colors.refreshControl} />
                </LoadingContainer>
              )}
            />
          </WrapperHorizontal>
        );
    });

  const businessAccount = dataProvider?.dataType === 'business_account';

  const openingHours =
    dates
      ?.filter((date) => isTodayOrLater(date?.dateTo || date?.dateFrom))
      ?.map((date) => ({ ...date, useYear: date?.useYear ?? true })) || [];

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />
      <SectionHeader title={title} onPress={link ? openWebScreen : undefined} />
      <Wrapper>
        {!!logo && <Logo source={{ uri: logo }} />}

        <InfoCard
          category={category}
          addresses={addresses}
          contacts={contacts}
          webUrls={webUrlsSettings?.displayOnlySummary === 'true' ? [] : webUrls}
          openWebScreen={openWebScreen}
        />
      </Wrapper>

      {!!openingHours?.length && (
        <View>
          <SectionHeader title={texts.eventRecord.appointments} />
          <OpeningTimesCard
            openingHours={openingHours}
            MAX_INITIAL_NUM_TO_RENDER={MAX_INITIAL_NUM_TO_RENDER}
            appointmentsShowMoreButton={appointmentsShowMoreButton}
          />
        </View>
      )}

      {/* temporary logic in order to show PriceCard just when description is present for the first index */}
      {!!priceInformations && !!priceInformations.length && !!priceInformations[0].description && (
        <View>
          <SectionHeader title={texts.eventRecord.prices} />
          <PriceCard prices={priceInformations} />
        </View>
      )}

      {!!description && (
        <View>
          <SectionHeader title={texts.eventRecord.description} />
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        </View>
      )}

      {!!media.length && media}

      <OperatingCompany
        openWebScreen={openWebScreen}
        operatingCompany={operatingCompany}
        title={texts.eventRecord.operatingCompany}
      />

      {webUrlsSettings?.displayOnlySummary === 'true' && !!webUrlsSettings?.onlySummaryLinkText && (
        <Wrapper>
          {webUrls.map(({ url }, index) => (
            <Button
              key={index}
              title={webUrlsSettings.onlySummaryLinkText}
              onPress={() => openLink(url, openWebScreen)}
            />
          ))}
        </Wrapper>
      )}

      <DataProviderNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

      {!!businessAccount && <DataProviderButton dataProvider={dataProvider} />}
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  iframeWebView: {
    height: normalize(210),
    width: '100%'
  }
});

EventRecord.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  route: PropTypes.object.isRequired
};
