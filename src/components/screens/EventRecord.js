import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import _filter from 'lodash/filter';

import { colors, device, normalize, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { LoadingContainer } from '../LoadingContainer';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal, WrapperWithOrientation } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';
import { OpeningTimesCard } from './OpeningTimesCard';
import { ImagesCarousel } from '../ImagesCarousel';
import { trimNewLines } from '../../helpers';
import { OrientationContext } from '../../OrientationProvider';

// necessary hacky way of implementing iframe in webview with correct zoom level
// thx to: https://stackoverflow.com/a/55780430
const INJECTED_JAVASCRIPT_FOR_IFRAME_WEBVIEW = `
  const meta = document.createElement('meta');
  meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=0.99, user-scalable=0');
  meta.setAttribute('name', 'viewport');
  document.getElementsByTagName('head')[0].appendChild(meta);
  true;
`;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const EventRecord = ({ data, navigation }) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const {
    addresses,
    category,
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
  // action to open source urls
  const openWebScreen = (webUrl) =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title: 'Veranstaltung',
        webUrl: !!webUrl && typeof webUrl === 'string' ? webUrl : link,
        rootRouteName
      }
    });

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  let images = [];
  let media = [];

  !!mediaContents &&
    !!mediaContents.length &&
    _filter(
      mediaContents,
      (mediaContent) =>
        mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
    ).forEach((mediaContent) => {
      !!mediaContent.sourceUrl &&
        !!mediaContent.sourceUrl.url &&
        images.push({
          picture: {
            uri: mediaContent.sourceUrl.url,
            copyright: mediaContent.copyright
          }
        });
    });

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

  return (
    <View>
      {!!images && images.length > 1 && <ImagesCarousel data={images} />}

      <WrapperWithOrientation orientation={orientation} dimensions={dimensions}>
        {!!images && images.length === 1 && <Image source={images[0].picture} />}

        {!!title && !!link ? (
          <TitleContainer>
            <Touchable onPress={openWebScreen}>
              <Title>{title}</Title>
            </Touchable>
          </TitleContainer>
        ) : (
          !!title && (
            <TitleContainer>
              <Title>{title}</Title>
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
              <Title>{texts.eventRecord.appointments}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <OpeningTimesCard openingHours={dates} />
          </View>
        )}

        {/* temporary logic in order to show PriceCard just when description is present for the first index */}
        {!!priceInformations && !!priceInformations.length && !!priceInformations[0].description && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.prices}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <PriceCard prices={priceInformations} />
          </View>
        )}

        {!!description && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.description}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView
                html={description}
                openWebScreen={openWebScreen}
                orientation={orientation}
                dimensions={dimensions}
              />
            </Wrapper>
          </View>
        )}

        {!!media.length && media}

        {!!operatingCompany && (
          <View>
            <TitleContainer>
              <Title>{texts.eventRecord.operatingCompany}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <OperatingCompanyInfo
              name={operatingCompany.name}
              address={operatingCompany.address}
              contact={operatingCompany.contact}
              webUrls={operatingCompany.contact.webUrls}
              openWebScreen={openWebScreen}
            />
          </View>
        )}
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
