import { BarCodeScanningResult, Camera } from 'expo-camera';
import * as Linking from 'expo-linking';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import appJson from '../../app.json';
import {
  BoldText,
  Button,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { device, texts } from '../config';
import { getBestSupportedRatioWithRetry, getNumericalRatioFromAspectRatio } from '../helpers';
import { useCreateEncounter } from '../hooks';
import { AcceptedRatio, ScreenName, User } from '../types';

const useOrientationLock = () =>
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    return () => {
      (() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT))();
    };
  }, []);

const showErrorAlert = () => Alert.alert(texts.errors.errorTitle, texts.encounter.errorScanBody);

const parseQrCode = (data: string): string | undefined => {
  const result = Linking.parse(data);

  // while we are developing with expo go, the qr codes we will generate will not start with the specified app scheme, but with expo instead
  // so we need to also expect those when scanning while testing in dev mode
  if (result.scheme === (__DEV__ ? 'exp' : appJson.expo.scheme) && result.path === 'encounter') {
    return result.queryParams?.qrId;
  }
};

// TODO: accesibility labels
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterScannerScreen = ({ navigation }: { navigation: any }) => {
  const ref = useRef<Camera>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean>();
  const [cameraAspectRatio, setCameraAspectRatio] = useState<AcceptedRatio>('1:1');

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
      createEncounter(qrId);
    } else {
      showErrorAlert();
    }
  };

  const onPress = useCallback(() => {
    setIsScanning(true);
  }, []);

  const updateCameraAspectRatio = useCallback(async () => {
    if (device.platform === 'android' && hasPermission && ref.current) {
      const ratio = await getBestSupportedRatioWithRetry(ref.current);

      setCameraAspectRatio(ratio);
    }
  }, [hasPermission, ref.current]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    updateCameraAspectRatio();
  }, [updateCameraAspectRatio]);

  // changing the orientation has a bad performance and non square aspect ratios would need to be orientation aware
  useOrientationLock();

  if (hasPermission === undefined || loadingCreateEncounter) {
    return (
      <SafeAreaViewFlex>
        <ScrollView>
          <WrapperWithOrientation>
            <SectionHeader title={texts.encounter.scannerTitle} />
            <LoadingSpinner loading />
          </WrapperWithOrientation>
        </ScrollView>
      </SafeAreaViewFlex>
    );
  }

  if (!hasPermission) {
    return (
      <ScrollView>
        <WrapperWithOrientation>
          <SectionHeader title={texts.encounter.scannerTitle} />
          <Wrapper>
            <RegularText>{texts.encounter.cameraPermissionMissing}</RegularText>
          </Wrapper>
        </WrapperWithOrientation>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <WrapperWithOrientation>
        <SectionHeader title={texts.encounter.scannerTitle} />
        <Wrapper>
          <BoldText>{texts.encounter.scannerSubTitle}</BoldText>
        </Wrapper>
      </WrapperWithOrientation>
      {isScanning ? (
        <Wrapper style={styles.scannerContainer}>
          <Camera
            ref={ref}
            ratio={cameraAspectRatio}
            onBarCodeScanned={handleBarCodeScanned}
            style={[
              styles.scanner,
              { aspectRatio: getNumericalRatioFromAspectRatio(cameraAspectRatio) }
            ]}
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
    alignItems: 'center'
  },
  scanner: {
    width: '100%'
  }
});
