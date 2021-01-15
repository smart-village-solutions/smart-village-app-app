import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { View } from 'react-native';
import _filter from 'lodash/filter';

import { colors, consts, device, texts } from '../../config';
import { HtmlView } from '../HtmlView';
import { Image } from '../Image';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';
import { PriceCard } from './PriceCard';
import { InfoCard } from './InfoCard';
import { OperatingCompanyInfo } from './OperatingCompanyInfo';
import { OpeningTimesCard } from './OpeningTimesCard';
import { ImagesCarousel } from '../ImagesCarousel';
import { OrientationContext } from '../../OrientationProvider';
import { useMatomoTrackScreenView } from '../../hooks';
import { matomoTrackingString } from '../../helpers';
import { WebViewMap } from '../map/WebViewMap';
import { location, locationIconAnchor } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PointOfInterest = ({ data, hideMap, navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { orientation, dimensions } = useContext(OrientationContext);
  const {
    addresses,
    category,
    categories,
    contact,
    dataProvider,
    description,
    mediaContents,
    openingHours,
    operatingCompany,
    priceInformations,
    title,
    webUrls
  } = data;

  const latitude = addresses?.[0]?.geoLocation?.latitude;
  const longitude = addresses?.[0]?.geoLocation?.longitude;

  const rootRouteName = navigation.getParam('rootRouteName', '');
  // action to open source urls
  const openWebScreen = (webUrl) =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title: 'Ort',
        webUrl,
        rootRouteName
      }
    });
  // the categories of a news item can be nested and we need the map of all names of all categories
  const categoryNames = categories && categories.map((category) => category.name).join(' / ');

  useMatomoTrackScreenView(
    matomoTrackingString([
      MATOMO_TRACKING.SCREEN_VIEW.POINTS_OF_INTEREST,
      dataProvider && dataProvider.name,
      categoryNames,
      title
    ])
  );

  let images = [];
  !!mediaContents &&
    !!mediaContents.length &&
    _filter(
      mediaContents,
      (mediaContent) =>
        mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
    ).forEach((item) => {
      !!item.sourceUrl &&
        !!item.sourceUrl.url &&
        images.push({
          picture: {
            uri: item.sourceUrl.url,
            copyright: item.copyright,
            captionText: item.captionText
          }
        });
    });

  return (
    <View>
      {!!images && images.length > 1 && <ImagesCarousel data={images} />}

      <WrapperWithOrientation>
        {!!images && images.length === 1 && <Image source={images[0].picture} />}

        {!!title && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${title} (Überschrift)`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </View>
        )}

        <Wrapper>
          <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />
        </Wrapper>

        {!!openingHours && !!openingHours.length && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.pointOfInterest.openingTime} (Überschrift)`}>
                {texts.pointOfInterest.openingTime}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <OpeningTimesCard openingHours={openingHours} />
          </View>
        )}

        {!!priceInformations && !!priceInformations.length && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.pointOfInterest.prices} (Überschrift)`}>
                {texts.pointOfInterest.prices}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <PriceCard prices={priceInformations} />
          </View>
        )}

        {!!description && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.pointOfInterest.description} (Überschrift)`}>
                {texts.pointOfInterest.description}
              </Title>
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
        {!hideMap && !!latitude && !!longitude && isConnected && isMainserverUp && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.pointOfInterest.location} (Überschrift)`}>
                {texts.pointOfInterest.location}
              </Title>
            </TitleContainer>
            <WebViewMap
              locations={[
                {
                  icon: location(colors.primary),
                  iconAnchor: locationIconAnchor,
                  position: { lat: latitude, lng: longitude }
                }
              ]}
            />
            {device.platform === 'ios' && <TitleShadow />}
          </View>
        )}

        {!!operatingCompany && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.pointOfInterest.operatingCompany} (Überschrift)`}>
                {texts.pointOfInterest.operatingCompany}
              </Title>
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

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired,
  hideMap: PropTypes.bool,
  navigation: PropTypes.object
};
