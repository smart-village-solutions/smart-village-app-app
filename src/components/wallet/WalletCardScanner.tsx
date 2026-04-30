import { BarcodeScanningResult } from 'expo-camera';
import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { colors, Icon, normalize, texts } from '../../config';
import { Scanner } from '../../screens';
import { Touchable } from '../Touchable';

export const WalletCardScanner = ({
  setCardNumber,
  setIsScannerOpen
}: {
  setCardNumber: (number: string) => void;
  setIsScannerOpen: (isOpen: boolean) => void;
}) => {
  const [isScanning, setIsScanning] = useState(true);

  const handleBarCodeScanned = ({ data }: BarcodeScanningResult) => {
    if (!data) {
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

    const extractedNumber = data.includes('sgh-') ? data.split('sgh-')[1] : data;

    setCardNumber(extractedNumber);
    setIsScannerOpen(false);
  };

  return (
    <>
      <Scanner isScanning={isScanning} handleBarCodeScanned={handleBarCodeScanned} />

      <Touchable onPress={() => setIsScannerOpen(false)} style={styles.closeButton}>
        <Icon.Close size={24} color={colors.surface} />
      </Touchable>
    </>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.darkText,
    borderRadius: 25,
    height: normalize(32),
    justifyContent: 'center',
    opacity: 0.64,
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(32),
    zIndex: 1
  }
});
