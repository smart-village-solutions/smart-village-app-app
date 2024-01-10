import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect } from 'react';
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
import { useStaticContent, useVoucher } from '../../hooks';
import { ScreenName } from '../../types';

export const VoucherHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { refresh, isLoggedIn } = useVoucher();

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

        {!isLoggedIn && (
          <Wrapper>
            <Button
              title={texts.voucher.loginButton}
              onPress={() => navigation.navigate(ScreenName.VoucherLogin)}
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
