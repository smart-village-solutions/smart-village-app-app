import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { consts, texts } from '../../config';
import { matomoTrackingString, parseListItemsFromQuery } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';
import { InfoCard } from '../infoCard';
import { Map } from '../map';
import { VoucherListItem } from '../vouchers';

import { SettingsContext } from '../../SettingsProvider';
import { AvailableVehicles } from './AvailableVehicles';
import { OpeningTimesCard } from './OpeningTimesCard';
import { OperatingCompany } from './OperatingCompany';
import { PriceCard } from './PriceCard';
import { TimeTables } from './TimeTables';

const { MATOMO_TRACKING } = consts;
export const INITIAL_VOUCHER_COUNT = 3;
export const INCREMENT_VOUCHER_COUNT = 5;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
export const PointOfInterest = ({ data, hideMap, navigation, route }) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { showFilterByOpeningTimes: showOpeningTimes = true } = settings;
  const [loadedVoucherDataCount, setLoadedVoucherDataCount] = useState(INITIAL_VOUCHER_COUNT);
  const {
    addresses,
    categories,
    category,
    contact,
    dataProvider,
    description,
    id,
    lunches,
    mediaContents,
    openingHours,
    operatingCompany,
    payload,
    priceInformations,
    title,
    travelTimes,
    vouchers,
    webUrls
  } = data;

  const latitude = addresses?.[0]?.geoLocation?.latitude;
  const longitude = addresses?.[0]?.geoLocation?.longitude;

  // action to open source urls
  const openWebScreen = useOpenWebScreen('Ort', undefined, route.params?.rootRouteName);

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

  const voucherListItems = useMemo(() => {
    return parseListItemsFromQuery(
      QUERY_TYPES.VOUCHERS,
      { [QUERY_TYPES.VOUCHERS]: vouchers },
      undefined,
      {
        withDate: false,
        queryKey: QUERY_TYPES.VOUCHERS
      }
    );
  }, [vouchers]);

  const businessAccount = dataProvider?.dataType === 'business_account';

  return (
    <View>
      <ImageSection mediaContents={mediaContents} />
      <SectionHeader title={title} />
      <Wrapper>
        {!!logo && <Logo source={{ uri: logo }} />}

        <InfoCard
          addresses={addresses}
          category={category}
          contact={contact}
          openingHours={openingHours}
          openWebScreen={openWebScreen}
          showOpeningTimes={showOpeningTimes}
          webUrls={webUrls}
        />
      </Wrapper>

      {!!voucherListItems?.length && (
        <View>
          <SectionHeader title={texts.pointOfInterest.vouchers} />
          <FlatList
            data={voucherListItems.slice(0, loadedVoucherDataCount)}
            renderItem={({ item }) => <VoucherListItem item={item} navigation={navigation} />}
            ListFooterComponent={() =>
              voucherListItems.length > loadedVoucherDataCount && (
                <Wrapper>
                  <Button
                    title={texts.pointOfInterest.loadMoreVouchers}
                    onPress={() =>
                      setLoadedVoucherDataCount((prev) => prev + INCREMENT_VOUCHER_COUNT)
                    }
                  />
                </Wrapper>
              )
            }
          />
        </View>
      )}

      {!!payload?.freeStatusUrl && (
        <AvailableVehicles freeStatusUrl={payload.freeStatusUrl} iconName={category?.iconName} />
      )}

      {!!travelTimes?.length && (
        <TimeTables travelTimes={travelTimes} iconName={category?.iconName} />
      )}

      {!!openingHours?.length && (
        <View>
          <SectionHeader title={texts.pointOfInterest.openingTime} />
          <OpeningTimesCard openingHours={openingHours} />
        </View>
      )}

      {!!priceInformations?.length && (
        <View>
          <SectionHeader title={texts.pointOfInterest.prices} />
          <PriceCard prices={priceInformations} />
        </View>
      )}

      {!!description && (
        <View>
          <SectionHeader title={texts.pointOfInterest.description} />
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
          <SectionHeader title={texts.pointOfInterest.location} />
          <Map
            locations={[
              {
                position: { latitude, longitude }
              }
            ]}
          />
        </View>
      )}

      <OperatingCompany
        openWebScreen={openWebScreen}
        operatingCompany={operatingCompany}
        title={texts.pointOfInterest.operatingCompany}
      />

      <DataProviderNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

      {!!businessAccount && <DataProviderButton dataProvider={dataProvider} />}
    </View>
  );
};
/* eslint-enable complexity */

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired,
  hideMap: PropTypes.bool,
  navigation: PropTypes.object,
  route: PropTypes.object.isRequired
};
