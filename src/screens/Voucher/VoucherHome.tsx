import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback } from 'react';
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
import { colors } from '../../config';
import { useStaticContent } from '../../hooks';

export const VoucherHome = ({ route }: StackScreenProps<any>) => {
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

        {/* TODO: add login button here */}

        <ServiceTiles staticJsonName="voucherHome" />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  imageContainerStyle: {
    alignSelf: 'center'
  },
  noPaddingBottom: {
    paddingBottom: 0
  }
});
