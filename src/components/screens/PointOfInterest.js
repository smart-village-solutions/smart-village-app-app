import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { View } from 'react-native';

import { colors, consts, device, texts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView } from '../../hooks';
import { location, locationIconAnchor } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { Button } from '../Button';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { WebViewMap } from '../map/WebViewMap';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { TMBNotice } from '../TMB/Notice';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';
import { OpeningTimesCard } from './OpeningTimesCard';
import { OperatingCompany } from './OperatingCompany';
import { PriceCard } from './PriceCard';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PointOfInterest = ({ data, hideMap, navigation }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const {
    addresses,
    category,
    categories,
    contact,
    dataProvider,
    description,
    id,
    lunches,
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

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
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

  const businessAccount = dataProvider?.dataType === 'business_account';

  const navigateToDataProvider = useCallback(
    () =>
      dataProvider &&
      businessAccount &&
      navigation.navigate('DataProvider', {
        dataProviderId: dataProvider.id,
        dataProviderName: dataProvider.name,
        logo,
        title: dataProvider.name
      }),

    [businessAccount, dataProvider, logo, navigation]
  );

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />

      <WrapperWithOrientation>
        {!!title && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${title} (Überschrift)`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </View>
        )}

        <Wrapper>
          {!!logo && <Logo source={{ uri: logo }} />}

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
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        {!!lunches?.length && (
          <Wrapper>
            <Button
              title={texts.pointOfInterest.showLunches}
              onPress={() => navigation.push('Lunch', { title: texts.widgets.lunch, poiId: id })}
            />
          </Wrapper>
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

        <OperatingCompany
          openWebScreen={openWebScreen}
          operatingCompany={operatingCompany}
          title={texts.pointOfInterest.operatingCompany}
        />

        <TMBNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

        {!!businessAccount && (
          <Wrapper>
            <Button
              title={`${texts.dataProvider.more} ${dataProvider.name}`}
              onPress={navigateToDataProvider}
            />
          </Wrapper>
        )}
      </WrapperWithOrientation>
    </View>
  );
};
/* eslint-enable complexity */

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired,
  hideMap: PropTypes.bool,
  navigation: PropTypes.object,
  fetchPolicy: PropTypes.string
};
