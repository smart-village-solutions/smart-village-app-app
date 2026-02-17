import { StackScreenProps } from '@react-navigation/stack';
import { BarcodeScanningResult } from 'expo-camera';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import appJson from '../../../app.json';
import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { Scanner } from '../Scanner';

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

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
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

  return <Scanner isScanning={isScanning} handleBarCodeScanned={handleBarCodeScanned} />;
};
