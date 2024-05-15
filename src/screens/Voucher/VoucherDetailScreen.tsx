import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import {
  BoldText,
  Button,
  Discount,
  HtmlView,
  ImageSection,
  LoadingSpinner,
  OperatingCompany,
  RegularText,
  VoucherRedeem,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useOpenWebScreen, useVoucher } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ScreenName, TVoucherContentBlock } from '../../types';

/* eslint-disable complexity */
export const VoucherDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
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
    discountType,
    id,
    mediaContents,
    payload,
    pointOfInterest,
    quota,
    subtitle,
    title
  } = data[QUERY_TYPES.GENERIC_ITEM];

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
        {!!quota &&
          (maxQuantity && frequency ? (
            <>
              <BoldText small primary>
                {texts.voucher.detailScreen.limit(availableQuantity, maxQuantity)}
              </BoldText>
              <RegularText small primary>
                {texts.voucher.detailScreen.frequency(maxPerPerson, frequency)}
              </RegularText>
            </>
          ) : maxQuantity ? (
            <BoldText small primary>
              {texts.voucher.detailScreen.limit(availableQuantity, maxQuantity)}
            </BoldText>
          ) : (
            <BoldText small primary>
              {texts.voucher.detailScreen.frequency(maxPerPerson, frequency)}
            </BoldText>
          ))}
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
    </ScrollView>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
