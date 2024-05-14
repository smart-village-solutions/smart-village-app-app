import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import {
  BoldText,
  DataProviderButton,
  Discount,
  HtmlView,
  ImageSection,
  LoadingSpinner,
  OperatingCompany,
  RegularText,
  VoucherRedeem,
  Wrapper
} from '../../components';
import { DataProviderNotice } from '../../components/DataProviderNotice';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy, momentFormat } from '../../helpers';
import { useOpenWebScreen, useVoucher } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { TVoucherContentBlock } from '../../types';

/* eslint-disable complexity */
export const VoucherDetailScreen = ({ route }: StackScreenProps<any>) => {
  const { memberId } = useVoucher();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);

  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  // action to open source urls
  const openWebScreen = useOpenWebScreen('Anbieter', undefined, route.params?.rootRouteName);

  const { data, loading, refetch } = useQuery(getQuery(query), {
    variables: { memberId, ...queryVariables },
    fetchPolicy
  });

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch();
    }
    setRefreshing(false);
  }, [isConnected, refetch, setRefreshing]);

  if (!data || loading) {
    return <LoadingSpinner loading />;
  }

  const {
    contentBlocks,
    dataProvider,
    dates,
    discountType,
    id,
    mediaContents,
    payload,
    quota,
    subtitle,
    title
  } = data[QUERY_TYPES.GENERIC_ITEM];

  const dateOfAvailabilityText = () => {
    const dateStart = dates?.[0]?.dateStart && momentFormat(dates[0].dateStart);
    const dateEnd = dates?.[0]?.dateEnd && momentFormat(dates[0].dateEnd);

    if (!dateStart && !dateEnd) {
      return;
    }

    if (dateStart && dateEnd) {
      return `${texts.voucher.detailScreen.available}: ${dateStart}-${dateEnd}`;
    } else if (dateStart) {
      return `${texts.voucher.detailScreen.availableFrom}: ${dateStart}`;
    } else if (dateEnd) {
      return `${texts.voucher.detailScreen.availableTo}: ${dateEnd}`;
    }
  };
  const dataProviderLogo = dataProvider?.logo?.url;
  const { availableQuantity, frequency, maxPerPerson, maxQuantity } = quota || {};

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      <ImageSection mediaContents={mediaContents} />

      <Wrapper>
        {!!quota && (
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

            {!!dateOfAvailabilityText() && (
              <RegularText small primary={availableQuantity} placeholder={!availableQuantity}>
                {dateOfAvailabilityText()}
              </RegularText>
            )}
          </>
        )}
      </Wrapper>

      {!!discountType && (
        <Wrapper style={styles.noPaddingTop}>
          <Discount
            discount={discountType}
            id={id}
            payloadId={payload.id}
            query={QUERY_TYPES.VOUCHERS}
          />
        </Wrapper>
      )}

      {!!title && (
        <Wrapper style={styles.noPaddingTop}>
          <BoldText>{title}</BoldText>
        </Wrapper>
      )}

      {!!subtitle && (
        <Wrapper style={styles.noPaddingTop}>
          <RegularText>{subtitle}</RegularText>
        </Wrapper>
      )}

      {!!contentBlocks?.length &&
        contentBlocks.map((item: TVoucherContentBlock, index: number) => (
          <Wrapper key={index}>
            {!!item.title && <BoldText>{item.title}</BoldText>}
            {!!item.body && <HtmlView html={item.body} />}
          </Wrapper>
        ))}

      {!!quota && (
        <Wrapper style={styles.noPaddingTop}>
          <VoucherRedeem quota={quota} voucherId={id} />
        </Wrapper>
      )}

      <OperatingCompany
        openWebScreen={openWebScreen}
        operatingCompany={dataProvider}
        title={texts.pointOfInterest.operatingCompany}
      />

      <DataProviderNotice dataProvider={dataProvider} openWebScreen={openWebScreen} />

      <DataProviderButton dataProvider={dataProvider} />
    </ScrollView>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
