import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect } from 'react';
import { useMutation } from 'react-apollo';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import {
  Button,
  HtmlView,
  Image,
  LoadingSpinner,
  SafeAreaViewFlex,
  ServiceTiles,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { addToStore, readFromStore } from '../../helpers';
import { VOUCHER_TRANSACTIONS } from '../../helpers/voucherHelper';
import { useStaticContent, useVoucher } from '../../hooks';
import { REDEEM_QUOTA_OF_VOUCHER } from '../../queries/vouchers';
import { ScreenName } from '../../types';

export const VoucherHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { refresh, isLoggedIn, memberId } = useVoucher();

  const imageUri = route?.params?.headerImage;

  const {
    data: dataHomeText,
    loading: loadingHomeText,
    refetch: refetchHomeText
  } = useStaticContent({
    refreshTimeKey: 'publicHtmlFile-voucherHomeText',
    name: 'voucherHomeText',
    type: 'html'
  });

  const refreshAuth = useCallback(() => {
    refresh();
  }, [refresh]);

  // refresh if the refreshAuth param changed, which happens after login
  useEffect(refreshAuth, [route.params?.refreshAuth]);

  const [redeemQuotaOfVoucher] = useMutation(REDEEM_QUOTA_OF_VOUCHER);

  useEffect(() => {
    const redeemLocalVouchers = async () => {
      const voucherTransactions = (await readFromStore(VOUCHER_TRANSACTIONS)) || [];
      let error = false;

      if (voucherTransactions.length) {
        for (const { voucherId, memberId, quantity, deviceToken } of voucherTransactions) {
          try {
            await redeemQuotaOfVoucher({
              variables: {
                deviceToken,
                quantity,
                voucherId,
                memberId
              }
            });
          } catch (e) {
            console.error(e);
            error = true;
            break;
          }
        }

        if (!error) {
          await addToStore(VOUCHER_TRANSACTIONS, []);
        }
      }
    };

    redeemLocalVouchers();
  }, []);

  const refreshHome = useCallback(async () => {
    await refetchHomeText();
  }, []);

  if (loadingHomeText) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshHome}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        {!!imageUri && (
          <Image source={{ uri: imageUri }} containerStyle={styles.imageContainerStyle} />
        )}

        {!!dataHomeText && (
          <Wrapper>
            <HtmlView html={dataHomeText} />
          </Wrapper>
        )}

        {(!isLoggedIn || !memberId) && (
          <Wrapper>
            <Button
              title={texts.voucher.loginButton}
              onPress={() => navigation.navigate(ScreenName.VoucherLogin, { imageUri })}
            />
          </Wrapper>
        )}

        <ServiceTiles staticJsonName="voucherHome" />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  imageContainerStyle: {
    alignSelf: 'center'
  }
});
