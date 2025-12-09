import { BarcodeScanningResult } from 'expo-camera';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { texts } from '../../config';
import { Scanner } from '../../screens';

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

    setCardNumber(data);
    setIsScannerOpen(false);
  };

  return <Scanner isScanning={isScanning} handleBarCodeScanned={handleBarCodeScanned} />;
};
