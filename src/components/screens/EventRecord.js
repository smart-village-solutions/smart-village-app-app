import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import _filter from 'lodash/filter';

import { colors, consts, device, normalize, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { LoadingContainer } from '../LoadingContainer';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal, WrapperWithOrientation } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { OpeningTimesCard } from './OpeningTimesCard';
import { matomoTrackingString, trimNewLines } from '../../helpers';
import { useMatomoTrackScreenView } from '../../hooks';
import { TMBNotice } from '../TMB/Notice';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { OperatingCompany } from './OperatingCompany';
import { CrossDataSection } from '../CrossDataSection';
import { QUERY_TYPES } from '../../queries';

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
export const EventRecord = ({ data, navigation }) => {
  const {
    addresses,
    category,
    categories,
    contacts,
    dataProvider,
    dates,
    description,
    mediaContents,
    operatingCompany,
    priceInformations,
    title,
    webUrls
  } = data;
  const link = webUrls && webUrls.length && webUrls[0].url;
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const headerTitle = navigation.getParam('title', '');
  // action to open source urls
  const openWebScreen = (webUrl) =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title: headerTitle,
        webUrl: !!webUrl && typeof webUrl === 'string' ? webUrl : link,
        rootRouteName
      }
    });
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
                  <ActivityIndicator color={colors.accent} />
                </LoadingContainer>
              )}
            />
          </WrapperHorizontal>
        );
    });

  const businessAccount = dataProvider?.dataType === 'business_account';

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />

      <WrapperWithOrientation>
        {!!title && !!link ? (
          <TitleContainer>
            <Touchable onPress={openWebScreen}>
              <Title accessibilityLabel={`${title} (Überschrift) (Taste)`}>{title}</Title>
            </Touchable>
          </TitleContainer>
        ) : (
          !!title && (
            <TitleContainer>
              <Title accessibilityLabel={`${title} (Überschrift)`}>{title}</Title>
            </TitleContainer>
          )
        )}
        {device.platform === 'ios' && <TitleShadow />}
        <Wrapper>
          {!!logo && <Logo source={{ uri: logo }} />}

          <InfoCard
            category={category}
            addresses={addresses}
            contacts={contacts}
            webUrls={webUrls}
            openWebScreen={openWebScreen}
          />
        </Wrapper>

        {!!dates && !!dates.length && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.eventRecord.appointments} (Überschrift) `}>
                {texts.eventRecord.appointments}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <OpeningTimesCard openingHours={dates} />
          </View>
        )}

        {/* temporary logic in order to show PriceCard just when description is present for the first index */}
        {!!priceInformations && !!priceInformations.length && !!priceInformations[0].description && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.eventRecord.prices} (Überschrift)`}>
                {texts.eventRecord.prices}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <PriceCard prices={priceInformations} />
          </View>
        )}

        {!!description && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.eventRecord.description} (Überschrift)`}>
                {texts.eventRecord.description}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        {!!media.length && media}

        {!!businessAccount && (
          <CrossDataSection
            dataProviderId={dataProvider.id}
            navigation={navigation}
            query={QUERY_TYPES.EVENT_RECORDS}
          />
        )}

        <OperatingCompany
          openWebScreen={openWebScreen}
          operatingCompany={operatingCompany}
          title={texts.eventRecord.operatingCompany}
        />

        <TMBNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />
      </WrapperWithOrientation>
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
  navigation: PropTypes.object
};
