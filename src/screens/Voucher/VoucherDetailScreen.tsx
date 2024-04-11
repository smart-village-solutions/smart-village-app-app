import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { RefreshControl, ScrollView } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import {
  BoldText,
  Discount,
  EmptyMessage,
  HtmlView,
  LoadingSpinner,
  RegularText,
  VoucherRedeem,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { TVoucherContentBlock } from '../../types';

/* eslint-disable complexity */
export const VoucherDetailScreen = ({ route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);

  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  const { data, loading, refetch } = useQuery(getQuery(query), {
    variables: queryVariables,
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

  const { contentBlocks, discountType, quota, id } = data[QUERY_TYPES.GENERIC_ITEM] || data;

  if (!quota) {
    return <EmptyMessage title={texts.voucher.detailScreen.emptyMessage} />;
  }

  const { availableQuantity, frequency, maxPerPerson, maxQuantity } = quota;

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

        {!!discountType && (
          <Discount discount={discountType} query={QUERY_TYPES.VOUCHERS} id={queryVariables.id} />
        )}
      </Wrapper>

      {!!contentBlocks?.length &&
        contentBlocks.map((item: TVoucherContentBlock, index: number) => (
          <Wrapper key={index}>
            {!!item.title && <BoldText>{item.title}</BoldText>}

            {!!item.body && <HtmlView html={item.body} />}
          </Wrapper>
        ))}

      <Wrapper>
        <VoucherRedeem quota={quota} voucherId={id} />
      </Wrapper>
    </ScrollView>
  );
};
/* eslint-enable complexity */
