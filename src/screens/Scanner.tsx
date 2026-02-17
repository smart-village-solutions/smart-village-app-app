import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import {
  Button,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper
} from '../components';
import { texts } from '../config';

export const Scanner = ({
  isScanning,
  handleBarCodeScanned
}: {
  isScanning: boolean;
  handleBarCodeScanned: (result: BarcodeScanningResult) => void;
}) => {
  const [permission, requestPermission] = useCameraPermissions();

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
            onPress={() => {
              requestPermission().then(({ canAskAgain }) => {
                if (!canAskAgain) {
                  Alert.alert(
                    texts.voucher.scannerScreen.errorTitle,
                    texts.voucher.scannerScreen.cameraPermissionMissingBody,
                    [
                      {
                        text: texts.voucher.scannerScreen.cameraPermissionMissingButton,
                        onPress: () => Linking.openSettings()
                      },
                      {
                        text: texts.voucher.scannerScreen.cancel,
                        onPress: () => {},
                        style: 'cancel'
                      }
                    ]
                  );
                }
              });
            }}
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
