import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { consts, texts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { TourStops } from '../TourStops';
import { Wrapper } from '../Wrapper';

import { OperatingCompany } from './OperatingCompany';
import { TourCard } from './TourCard';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const Tour = ({ data, navigation, readAloudControls, route }) => {
  const {
    addresses,
    categories,
    category,
    contact,
    dataProvider,
    description,
    geometryTourData,
    id,
    lengthKm,
    mediaContents,
    operatingCompany,
    payload,
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

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />
      {readAloudControls}
      <SectionHeader title={title} />
      <Wrapper>
        {!!logo && <Logo source={{ uri: logo }} />}

        <InfoCard category={category} addresses={addresses} contact={contact} webUrls={webUrls} />
      </Wrapper>

      {(!!tourAddresses.length || !!lengthKm) && (
        <TourCard lengthKm={lengthKm} tourAddresses={tourAddresses} payload={payload} />
      )}

      {!!description && (
        <View>
          <SectionHeader title={texts.tour.description} />
          <Wrapper>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </Wrapper>
        </View>
      )}

      {!!tourStops?.length && (
        <TourStops
          {...{ geometryTourData, id, navigation, tourStops, payload }}
          rootRouteName={route.params?.rootRouteName}
        />
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
  readAloudControls: PropTypes.node,
  route: PropTypes.object.isRequired
};
