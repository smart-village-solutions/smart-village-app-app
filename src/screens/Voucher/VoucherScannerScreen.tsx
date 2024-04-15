import { StackScreenProps } from '@react-navigation/stack';
import { BarCodeScanningResult, Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import appJson from '../../../app.json';
import { SafeAreaViewFlex } from '../../components';
import { consts, texts } from '../../config';
import { ScreenName } from '../../types';
import { QUERY_TYPES } from '../../queries';

const { HOST_NAMES } = consts;

const parseQrCode = (
  data: string
): { query: string; queryVariables: { id: number | undefined } } => {
  const result = Linking.parse(data);

  if (result.scheme === appJson.expo.scheme && result.hostname === HOST_NAMES.DETAIL) {
    const id = result.queryParams?.id as number | undefined;
    const query = result.queryParams?.query?.toString() || '';

    return { query, queryVariables: { id } };
  }

  return { query: QUERY_TYPES.POINT_OF_INTEREST, queryVariables: { id: undefined } };
};

export const VoucherScannerScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isScanning, setIsScanning] = useState(true);

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    const { query, queryVariables } = parseQrCode(data);

    if (!queryVariables?.id) {
      setIsScanning(false);

      return Alert.alert(
        texts.voucher.scannerScreen.errorTitle,
        texts.voucher.scannerScreen.errorBody,
        [
          {
            text: texts.voucher.scannerScreen.errorButton,
            onPress: () => setIsScanning(true)
          }
        ]
      );
    }

    return navigation.navigate(ScreenName.Detail, {
      queryVariables,
      query,
      title: texts.screenTitles.voucher.partner
    });
  };

  return (
    <SafeAreaViewFlex>
      {isScanning ? (
        <Camera onBarCodeScanned={handleBarCodeScanned} style={styles.scanner} />
      ) : null}
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  scanner: {
    height: '100%',
    width: '100%'
  }
});
