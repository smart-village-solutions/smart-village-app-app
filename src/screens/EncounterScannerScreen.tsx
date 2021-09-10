import { BarCodeScanningResult, Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import appJson from '../../app.json';
import {
  BoldText,
  Button,
  RegularText,
  SectionHeader,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { device, texts } from '../config';
import { useCreateEncounter, useEncounterUser } from '../hooks';
import { ScreenName, User } from '../types';

const showErrorAlert = () =>
  Alert.alert(texts.encounter.errorScanTitle, texts.encounter.errorScanBody);

const parseQrCode = (data: string): string | undefined => {
  const result = Linking.parse(data);

  if (result.scheme === (__DEV__ ? 'exp' : appJson.expo.scheme) && result.path === 'encounter') {
    return result.queryParams?.qrId;
  }
};

// TODO: accesibility labels
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterScannerScreen = ({ navigation }: { navigation: any }) => {
  const { loading: loadingUser, userId } = useEncounterUser();
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean>();

  const onCreationSuccess = useCallback(
    (data: User) => {
      navigation.navigate(ScreenName.EncounterUserDetail, { data });
    },
    [navigation]
  );

  const { loading: loadingCreateEncounter, createEncounter } = useCreateEncounter(
    onCreationSuccess,
    showErrorAlert
  );

  const handleBarCodeScanned = ({ data, type }: BarCodeScanningResult) => {
    if (type !== (device.platform === 'android' ? 256 : 'org.iso.QRCode')) {
      return;
    }

    setIsScanning(false);
    const qrId = parseQrCode(data);
    if (qrId) {
      createEncounter(qrId, userId);
    } else {
      showErrorAlert();
    }
  };

  const onPress = useCallback(() => {
    setIsScanning(true);
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === undefined || loadingUser || loadingCreateEncounter) {
    return (
      <ScrollView>
        <SectionHeader title={texts.encounter.scannerTitle} />
        <LoadingSpinner loading />
      </ScrollView>
    );
  }

  if (!hasPermission) {
    return (
      <ScrollView>
        <SectionHeader title={texts.encounter.scannerTitle} />
        <WrapperWithOrientation>
          <Wrapper>
            <RegularText>{texts.encounter.cameraPermissionMissing}</RegularText>
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <SectionHeader title={texts.encounter.scannerTitle} />
      <WrapperWithOrientation>
        <Wrapper>
          <BoldText>{texts.encounter.scannerSubTitle}</BoldText>
        </Wrapper>
      </WrapperWithOrientation>
      {isScanning ? (
        <Wrapper style={styles.scannerContainer}>
          <Camera
            ratio="1:1"
            onBarCodeScanned={handleBarCodeScanned}
            style={styles.scanner}
            // barCodeTypes={['org.iso.QRCode']}
          />
        </Wrapper>
      ) : (
        <WrapperWithOrientation>
          <Wrapper>
            <Button title={texts.encounter.scanAgain} onPress={onPress} />
          </Wrapper>
        </WrapperWithOrientation>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scannerContainer: {
    alignItems: 'center',
    height: device.width
  },
  scanner: {
    aspectRatio: 1,
    height: '100%'
  }
});
