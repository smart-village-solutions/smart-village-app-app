import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { View } from 'react-native';

import { consts, device, texts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView } from '../../hooks';
import { Button } from '../Button';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { TMBNotice } from '../TMB/Notice';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';
import { OperatingCompany } from './OperatingCompany';
import { TourCard } from './TourCard';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Tour = ({ data, navigation }) => {
  const {
    addresses,
    category,
    categories,
    contact,
    dataProvider,
    description,
    lengthKm,
    mediaContents,
    operatingCompany,
    title,
    webUrls
  } = data;
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const headerTitle = navigation.getParam('title', '');
  // action to open source urls
  const openWebScreen = (webUrl) =>
    navigation.navigate({
      routeName: 'Web',
      params: {
        title: headerTitle,
        webUrl,
        rootRouteName
      }
    });

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  // the categories of a news item can be nested and we need the map of all names of all categories
  const categoryNames = categories && categories.map((category) => category.name).join(' / ');

  useMatomoTrackScreenView(
    matomoTrackingString([
      MATOMO_TRACKING.SCREEN_VIEW.TOURS,
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

        <TourCard lengthKm={lengthKm} addresses={addresses} />

        {!!description && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`${texts.tour.description} (Überschrift)`}>
                {texts.tour.description}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        <OperatingCompany
          openWebScreen={openWebScreen}
          operatingCompany={operatingCompany}
          title={texts.tour.operatingCompany}
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

Tour.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object
};
