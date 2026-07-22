import { BarcodeScanningResult } from 'expo-camera';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { consts, Icon, normalize, texts } from '../../config';
import { Scanner } from '../../screens';
import { Touchable } from '../Touchable';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

export const WalletCardScanner = ({
  setCardNumber,
  setIsScannerOpen
}: {
  setCardNumber: (number: string) => void;
  setIsScannerOpen: (isOpen: boolean) => void;
}) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
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

      <Touchable
        accessibilityLabel={consts.a11yLabel.closeIcon}
        onPress={() => setIsScannerOpen(false)}
        style={styles.closeButton}
      >
        <Icon.Close size={24} color={colors.surface} />
      </Touchable>
    </>
  );
};

const createStyles = (colors) => ({
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
