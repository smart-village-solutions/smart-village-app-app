import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { consts, device, texts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { AugmentedReality } from '../augmentedReality';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

import { OperatingCompany } from './OperatingCompany';
import { TourCard } from './TourCard';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Tour = ({ data, navigation, route }) => {
  const {
    addresses,
    categories,
    category,
    contact,
    dataProvider,
    description,
    id,
    geometryTourData,
    lengthKm,
    mediaContents,
    operatingCompany,
    title,
    tourStops,
    webUrls
  } = data;
  // action to open source urls
  const openWebScreen = useOpenWebScreen(
    route.params?.title ?? '',
    undefined,
    route.params?.rootRouteName
  );

  const logo = dataProvider && dataProvider.logo && dataProvider.logo.url;
  // the categories of a news item can be nested and we need the map of all names of all categories
  const categoryNames = categories && categories.map((category) => category.name).join(' / ');
  // for tour addresses we just consider addresses that are kind of 'start' or 'end'
  const tourAddresses = _filter(
    addresses,
    (address) => address.kind === 'start' || address.kind === 'end'
  );

  useMatomoTrackScreenView(
    matomoTrackingString([
      MATOMO_TRACKING.SCREEN_VIEW.TOURS,
      dataProvider && dataProvider.name,
      categoryNames,
      title
    ])
  );

  const businessAccount = dataProvider?.dataType === 'business_account';
  const a11yText = consts.a11yLabel;
  return (
    <View>
      <ImageSection mediaContents={mediaContents} />

      {!!title && (
        <View>
          <TitleContainer>
            <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
        </View>
      )}

      <Wrapper>
        {!!logo && <Logo source={{ uri: logo }} />}

        <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />
      </Wrapper>

      {(!!tourAddresses.length || !!lengthKm) && (
        <TourCard lengthKm={lengthKm} tourAddresses={tourAddresses} />
      )}

      {!!description && (
        <View>
          <TitleContainer>
            <Title accessibilityLabel={`(${texts.tour.description}) ${a11yText.heading}`}>
              {texts.tour.description}
            </Title>
          </TitleContainer>
          {device.platform === 'ios' && <TitleShadow />}
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        </View>
      )}

      {!!tourStops?.length && (
        <AugmentedReality {...{ geometryTourData, id, navigation, tourStops }} />
      )}

      <OperatingCompany
        openWebScreen={openWebScreen}
        operatingCompany={operatingCompany}
        title={texts.tour.operatingCompany}
      />

      <DataProviderNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

      {!!businessAccount && <DataProviderButton dataProvider={dataProvider} />}
    </View>
  );
};
/* eslint-enable complexity */

Tour.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  route: PropTypes.object.isRequired
};
