import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import { SettingsContext } from '../../SettingsProvider';
import { consts, normalize, texts } from '../../config';
import { matomoTrackingString, parseListItemsFromQuery } from '../../helpers';
import { useMatomoTrackScreenView, useOpenWebScreen } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { Button } from '../Button';
import { DataProviderButton } from '../DataProviderButton';
import { DataProviderNotice } from '../DataProviderNotice';
import { HtmlView } from '../HtmlView';
import { ImageSection } from '../ImageSection';
import { LoadingSpinner } from '../LoadingSpinner';
import { SectionHeader } from '../SectionHeader';
import { HeadlineText } from '../Text';
import { Wrapper, WrapperHorizontal, WrapperVertical } from '../Wrapper';
import { InfoCard } from '../infoCard';
import { MapLibre } from '../map';
import { VoucherListItem } from '../vouchers';

import {
  AvailableVehicles,
  KNOWN_ICON_STATUS_NAMES,
  VehicleStatusFeature,
  fetchAvailableVehicles,
  vehiclePropertyKey
} from './AvailableVehicles';
import { OpeningTimesCard } from './OpeningTimesCard';
import { OperatingCompany } from './OperatingCompany';
import { PriceCard } from './PriceCard';
import { TravelTimes } from './TravelTimes';

const { MAP, MATOMO_TRACKING } = consts;
export const INITIAL_VOUCHER_COUNT = 3;
export const INCREMENT_VOUCHER_COUNT = 5;

/* eslint-disable complexity */
/* NOTE: we need to check a lot for presence, so this is that complex */
type PointOfInterestProps = {
  data: any;
  hideMap?: boolean;
  navigation?: any;
  route: any;
};

export const PointOfInterest = ({ data, hideMap, navigation, route }: PointOfInterestProps) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { showOpeningTimes = true } = settings;
  const [loadedVoucherDataCount, setLoadedVoucherDataCount] = useState(INITIAL_VOUCHER_COUNT);
  const [availableVehiclesData, setAvailableVehiclesData] = useState<VehicleStatusFeature[]>([]);
  const [availableVehiclesLoading, setAvailableVehiclesLoading] = useState(true);
  const {
    addresses,
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
    payload,
    priceInformations,
    title,
    vouchers,
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

  const voucherListItems = useMemo(() => {
    return parseListItemsFromQuery(
      QUERY_TYPES.VOUCHERS,
      { [QUERY_TYPES.GENERIC_ITEMS]: vouchers },
      undefined,
      {
        withDate: false,
        queryKey: QUERY_TYPES.GENERIC_ITEMS
      }
    );
  }, [vouchers]);

  useEffect(() => {
    // Reset state immediately so the previous POI's status is never shown for the new one
    setAvailableVehiclesLoading(true);
    setAvailableVehiclesData([]);

    if (!payload?.freeStatusUrl) {
      setAvailableVehiclesLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const data = await fetchAvailableVehicles(payload.freeStatusUrl, controller.signal);
        setAvailableVehiclesData(data);
        setAvailableVehiclesLoading(false);
      } catch (error) {
        // AbortError is expected when freeStatusUrl changes or the component unmounts before
        // the request completes. Skip state updates so stale data is never written.
        if (!(error instanceof Error && error.name === 'AbortError')) {
          setAvailableVehiclesLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [payload?.freeStatusUrl]);

  const businessAccount = dataProvider?.dataType === 'business_account';

  const categoryName = route.params?.queryVariables?.categoryName;
  let nestedCategory;
  if (categoryName) {
    nestedCategory = categories.find((category) => category.name === categoryName);
  }

  const status = availableVehiclesData?.length
    ? availableVehiclesData[0]?.properties?.[vehiclePropertyKey]
    : undefined;

  if (availableVehiclesLoading) {
    return <LoadingSpinner loading={availableVehiclesLoading} />;
  }

  const iconName =
    payload?.iconName ||
    category?.iconName ||
    availableVehiclesData[0]?.iconName ||
    MAP.DEFAULT_PIN;

  const vehicleActiveIconName =
    availableVehiclesData[0]?.activeIconName || availableVehiclesData[0]?.iconNameActive;

  // Fall back to the "Active" suffix only for icons that come from the category or the default
  // pin (where the asset is guaranteed to exist). When the icon originates from payload or
  // freeStatus response and no active icon is supplied, pass undefined so MapLibre falls back
  // to iconName instead of trying a missing asset.
  const fallbackActiveIconName =
    payload?.iconName || availableVehiclesData[0]?.iconName ? undefined : `${iconName}Active`;

  // Use payload.activeIconName when provided; if status signals occupancy/availability use that;
  // otherwise fall back through vehicle data and finally to the computed fallback.
  const activeIconName =
    typeof status === 'string' && KNOWN_ICON_STATUS_NAMES.has(status)
      ? status
      : payload?.activeIconName || vehicleActiveIconName || fallbackActiveIconName;

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
            showOpeningTimes={showOpeningTimes}
            webUrls={webUrls}
          />
        </Wrapper>
      )}

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
        <AvailableVehicles
          iconName={iconName}
          isSpecialForParkHaus={availableVehiclesData[0]?.isSpecialForParkHaus}
          loading={availableVehiclesLoading}
          status={status}
        />
      )}

      {hasTravelTimes && <TravelTimes id={id} iconName={iconName} />}

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
            <HtmlView html={description} openWebScreen={openWebScreen} selectable />
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
          <MapLibre
            isMultipleMarkersMap={false}
            isMyLocationButtonVisible={false}
            locations={[
              {
                iconName,
                activeIconName,
                id,
                position: { latitude, longitude }
              }
            ]}
            mapStyle={styles.mapStyle}
            selectedMarker={id}
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
  mapStyle: {
    // borderRadius: normalize(8),
    height: normalize(300),
    width: '100%'
  }
});
