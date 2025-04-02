import { StackScreenProps } from '@react-navigation/stack';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import appJson from '../../../app.json';
import {
  Button,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper
} from '../../components';
import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

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
  const [permission, requestPermission] = useCameraPermissions();
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

  if (!permission) {
    return (
      <ScrollView>
        <SectionHeader title={texts.voucher.scannerScreen.scannerTitle} />
        <LoadingSpinner loading />
      </ScrollView>
    );
  }

  if (!permission.granted) {
    return (
      <ScrollView>
        <SectionHeader title={texts.voucher.scannerScreen.scannerTitle} />
        <Wrapper noPaddingBottom>
          <RegularText>{texts.voucher.scannerScreen.cameraPermissionMissing}</RegularText>
        </Wrapper>
        <Wrapper>
          <Button
            title={texts.voucher.scannerScreen.requestPermissionButton}
            onPress={requestPermission}
          />
        </Wrapper>
      </ScrollView>
    );
  }

  return (
    <SafeAreaViewFlex>
      {isScanning ? (
        <CameraView onBarcodeScanned={handleBarCodeScanned} style={styles.scanner} />
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
