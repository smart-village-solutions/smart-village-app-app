import { StackScreenProps } from '@react-navigation/stack';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import React from 'react';
import { StyleSheet } from 'react-native';

import { SafeAreaViewFlex } from '../../components';
import { texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

export const VoucherScannerScreen = ({ navigation }: StackScreenProps<any>) => {
  const handleBarCodeScanned = ({ data: id }: BarCodeScanningResult) => {
    if (!id) {
      return;
    }

    return navigation.navigate(ScreenName.Detail, {
      queryVariables: { id },
      query: QUERY_TYPES.POINT_OF_INTEREST,
      title: texts.screenTitles.voucher.partner
    });
  };

  return (
    <SafeAreaViewFlex>
      <Camera onBarCodeScanned={handleBarCodeScanned} style={styles.scanner} />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  scanner: {
    height: '100%',
    width: '100%'
  }
});
