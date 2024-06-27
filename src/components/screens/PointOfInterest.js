import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { consts, normalize, texts } from '../../config';
import { matomoTrackingString } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { SectionHeader } from '../SectionHeader';
import { HeadlineText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';
import { InfoCard } from '../infoCard';
import { Map } from '../map';

import { AvailableVehicles } from './AvailableVehicles';
import { OpeningTimesCard } from './OpeningTimesCard';
import { OperatingCompany } from './OperatingCompany';
import { PriceCard } from './PriceCard';
import { TravelTimes } from './TravelTimes';

const { MATOMO_TRACKING } = consts;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PointOfInterest = ({ data, hideMap, navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const {
    addresses,
    payload,
    categories,
    category,
    contact,
    dataProvider,
    description,
    hasTravelTimes,
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

  // action to open source urls
  const openWebScreen = useOpenWebScreen('Ort', undefined, route.params?.rootRouteName);

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

  const categoryName = route.params?.queryVariables?.categoryName;
  let nestedCategory;
  if (categoryName) {
    nestedCategory = categories.find((category) => category.name === categoryName);
  }

  return (
    <WrapperVertical>
      {(!!nestedCategory?.name || category?.name) && (
        <WrapperHorizontal>
          <HeadlineText smaller uppercase>
            {nestedCategory?.name || category.name}
          </HeadlineText>
        </WrapperHorizontal>
      )}
      <SectionHeader big title={title} />

      {!!mediaContents?.length && (
        <WrapperVertical>
          <ImageSection mediaContents={mediaContents} />
        </WrapperVertical>
      )}

      {(!!addresses?.length || !!contact || !!openingHours?.length || !!webUrls?.length) && (
        <SectionHeader title={texts.pointOfInterest.overview} />
      )}

      {(!!addresses?.length || !!contact || !!openingHours?.length || !!webUrls?.length) && (
        <Wrapper>
          <InfoCard
            addresses={addresses}
            contact={contact}
            openingHours={openingHours}
            openWebScreen={openWebScreen}
            webUrls={webUrls}
          />
        </Wrapper>
      )}

      {!!payload?.freeStatusUrl && (
        <AvailableVehicles freeStatusUrl={payload.freeStatusUrl} iconName={category?.iconName} />
      )}

      {hasTravelTimes && <TravelTimes id={id} iconName={category?.iconName} />}

      {!!openingHours?.length && (
        <WrapperVertical>
          <SectionHeader title={texts.pointOfInterest.openingTime} />
          <OpeningTimesCard openingHours={openingHours} />
        </WrapperVertical>
      )}

      {!!priceInformations?.length && (
        <WrapperVertical>
          <SectionHeader title={texts.pointOfInterest.prices} />
          <PriceCard prices={priceInformations} />
        </WrapperVertical>
      )}

      {!!description && (
        <WrapperVertical>
          <SectionHeader title={texts.pointOfInterest.description} />
          <WrapperHorizontal>
            <HtmlView html={description} openWebScreen={openWebScreen} />
          </WrapperHorizontal>
        </WrapperVertical>
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
        <WrapperVertical>
          <SectionHeader title={texts.pointOfInterest.location} />
          <Map
            locations={[
              {
                position: { latitude, longitude },
                iconName: nestedCategory?.iconName?.length
                  ? nestedCategory.iconName
                  : category?.iconName?.length
                  ? category.iconName
                  : undefined,
                id
              }
            ]}
            selectedMarker={id}
            mapStyle={styles.mapStyle}
            logoContainerStyle={styles.logoContainerStyle}
          />
        </WrapperVertical>
      )}

      <OperatingCompany
        openWebScreen={openWebScreen}
        operatingCompany={operatingCompany}
        title={texts.pointOfInterest.operatingCompany}
      />

      <DataProviderNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

      {!!businessAccount && <DataProviderButton dataProvider={dataProvider} />}
    </WrapperVertical>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  logoContainerStyle: {
    paddingLeft: normalize(16),
    width: normalize(124)
  },
  mapStyle: {
    borderRadius: normalize(8)
  }
});

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired,
  hideMap: PropTypes.bool,
  navigation: PropTypes.object,
  route: PropTypes.object.isRequired
};
