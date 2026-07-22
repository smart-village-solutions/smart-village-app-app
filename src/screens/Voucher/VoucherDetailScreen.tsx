import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView } from 'react-native';
import { useQuery as RQuseQuery } from 'react-query';

import { ReactQueryClient } from '../../ReactQueryClient';
import {
  BoldText,
  Button,
  Discount,
  HtmlView,
  INCREMENT_VOUCHER_COUNT,
  INITIAL_VOUCHER_COUNT,
  ImageSection,
  LoadingSpinner,
  OperatingCompany,
  ReadAloudContent,
  RegularText,
  SectionHeader,
  VoucherListItem,
  VoucherRedeem,
  Wrapper
} from '../../components';
import { texts } from '../../config';
import { dateOfAvailabilityText, parseListItemsFromQuery } from '../../helpers';
import { useOpenWebScreen, useVoucher } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { useReadAloudScrollContentContainerStyle } from '../../ReadAloudAvailabilityProvider';
import { ScreenName, TVoucherContentBlock, TVoucherItem } from '../../types';
import { useTheme } from '../../hooks/useTheme';

/* eslint-disable complexity */
export const VoucherDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { colors } = useTheme();

  const { memberId } = useVoucher();
  const scrollContentContainerStyle = useReadAloudScrollContentContainerStyle();
  const [refreshing, setRefreshing] = useState(false);
  const [loadedVoucherDataCount, setLoadedVoucherDataCount] = useState(INITIAL_VOUCHER_COUNT);

  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  // action to open source urls
  const openWebScreen = useOpenWebScreen('Anbieter', undefined, route.params?.rootRouteName);

  const {
    data,
    isLoading: loading,
    refetch
  } = RQuseQuery([query, { memberId, ...queryVariables }], async () => {
    const client = await ReactQueryClient();

    return await client.request(getQuery(query), { memberId, ...queryVariables });
  });

  const {
    contentBlocks,
    dataProvider,
    dates,
    discountType,
    id,
    mediaContents,
    payload,
    pointOfInterest,
    quota,
    subtitle,
    title
  } = data?.[QUERY_TYPES.GENERIC_ITEM] ?? {};

  const ids: string[] =
    pointOfInterest?.vouchers?.flatMap((voucher: TVoucherItem) =>
      voucher.id !== queryVariables?.id ? [voucher.id] : []
    ) ?? [];

  const { data: actualVouchersData, refetch: actualVouchersRefetch } = RQuseQuery(
    [QUERY_TYPES.VOUCHERS, { ids }],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(QUERY_TYPES.VOUCHERS), { ids });
    },
    {
      enabled: !!ids?.length
    }
  );

  const voucherListItems = useMemo(() => {
    return parseListItemsFromQuery(QUERY_TYPES.VOUCHERS, actualVouchersData, undefined, {
      withDate: false,
      queryKey: QUERY_TYPES.GENERIC_ITEMS
    });
  }, [actualVouchersData]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    await actualVouchersRefetch();
    setRefreshing(false);
  }, [refetch, setRefreshing]);

  if (!data || loading) {
    return <LoadingSpinner loading />;
  }

  const availabilityText = dateOfAvailabilityText(dates?.[0]?.dateStart, dates?.[0]?.dateEnd);
  const dataProviderLogo = dataProvider?.logo?.url;
  const { availableQuantity, frequency, maxPerPerson, maxQuantity } = quota || {};

  // hide quota when more than 10% is still available (show only when 90%+ has been used)
  const shouldHideQuota = !!maxQuantity && availableQuantity / maxQuantity > 0.1;

  return (
    <ScrollView
      contentContainerStyle={scrollContentContainerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.refreshControl]}
          tintColor={colors.refreshControl}
        />
      }
    >
      <ImageSection mediaContents={mediaContents} />

      <Wrapper>
        {!!quota && !shouldHideQuota && (
          <>
            {maxQuantity && frequency ? (
              <>
                <BoldText small primary={availableQuantity} placeholder={!availableQuantity}>
                  {texts.voucher.detailScreen.limit(availableQuantity, maxQuantity)}
                </BoldText>
                <RegularText small primary={availableQuantity} placeholder={!availableQuantity}>
                  {texts.voucher.detailScreen.frequency(maxPerPerson, frequency)}
                </RegularText>
              </>
            ) : maxQuantity ? (
              <BoldText small primary={availableQuantity} placeholder={!availableQuantity}>
                {texts.voucher.detailScreen.limit(availableQuantity, maxQuantity)}
              </BoldText>
            ) : (
              <BoldText small primary={availableQuantity} placeholder={!availableQuantity}>
                {texts.voucher.detailScreen.frequency(maxPerPerson, frequency)}
              </BoldText>
            )}
          </>
        )}

        {/* always show availability dates regardless of quota visibility */}
        {!!availabilityText && (
          <RegularText small primary={availableQuantity} placeholder={!availableQuantity}>
            {availabilityText}
          </RegularText>
        )}
      </Wrapper>

      {!!discountType && (
        <Wrapper noPaddingTop>
          <Discount
            discount={discountType}
            id={id}
            payloadId={payload.id}
            query={QUERY_TYPES.VOUCHERS}
          />
        </Wrapper>
      )}

      {!!title && (
        <Wrapper noPaddingTop>
          <BoldText>{title}</BoldText>
        </Wrapper>
      )}

      {!!subtitle && (
        <Wrapper noPaddingTop>
          <RegularText>{subtitle}</RegularText>
        </Wrapper>
      )}

      {!!contentBlocks?.length &&
        contentBlocks.map((item: TVoucherContentBlock, index: number) => (
          <Wrapper key={index}>
            {!!item.title && <BoldText>{item.title}</BoldText>}
            {!!item.body && (
              <>
                <ReadAloudContent
                  content={item.body}
                  contentId={`voucher-detail-content-block-${id || 'unknown'}-${index}`}
                />
                <HtmlView html={item.body} />
              </>
            )}
          </Wrapper>
        ))}

      {!!quota && (
        <Wrapper noPaddingTop>
          <VoucherRedeem dates={dates} quota={quota} voucherId={id} />
        </Wrapper>
      )}

      {!!pointOfInterest?.operatingCompany && (
        <>
          <OperatingCompany
            logo={dataProviderLogo}
            openWebScreen={openWebScreen}
            operatingCompany={pointOfInterest.operatingCompany}
            title={texts.pointOfInterest.operatingCompany}
          />

          <Wrapper>
            <Button
              title={texts.voucher.detailScreen.toPartnerButton}
              onPress={() =>
                navigation.push(ScreenName.Detail, {
                  query: QUERY_TYPES.POINT_OF_INTEREST,
                  title: texts.detailTitles.pointOfInterest,
                  queryVariables: {
                    id: pointOfInterest.id
                  }
                })
              }
              invert
            />
          </Wrapper>
        </>
      )}

      {!!voucherListItems?.length && (
        <>
          <SectionHeader title={texts.pointOfInterest.vouchersMore} />
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
        </>
      )}
    </ScrollView>
  );
};
/* eslint-enable complexity */
