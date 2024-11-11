import { StackScreenProps } from '@react-navigation/stack';
import { BarCodeScanningResult, Camera } from 'expo-camera/legacy';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import appJson from '../../../app.json';
import {
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
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean>();

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

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === undefined) {
    return (
      <ScrollView>
        <SectionHeader title={texts.voucher.scannerScreen.scannerTitle} />
        <LoadingSpinner loading />
      </ScrollView>
    );
  }

  if (!hasPermission) {
    return (
      <ScrollView>
        <SectionHeader title={texts.voucher.scannerScreen.scannerTitle} />
        <Wrapper>
          <RegularText>{texts.voucher.scannerScreen.cameraPermissionMissing}</RegularText>
        </Wrapper>
      </ScrollView>
    );
  }

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
