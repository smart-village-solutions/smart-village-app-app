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
  Wrapper
} from '../components';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { consts, device, texts } from '../config';
import { getBestSupportedRatioWithRetry, getNumericalRatioFromAspectRatio } from '../helpers';
import { useCreateEncounter } from '../hooks';
import { AcceptedRatio, ScreenName, User } from '../types';

const { HOST_NAMES } = consts;

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

  if (result.scheme === appJson.expo.scheme && result.hostname === HOST_NAMES.ENCOUNTER) {
    return result.queryParams?.qrId;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterScannerScreen = ({ navigation }: { navigation: any }) => {
  const ref = useRef<Camera>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean>();
  const [cameraAspectRatio, setCameraAspectRatio] = useState<AcceptedRatio>('1:1');
  const [creationSuccess, setCreationSuccess] = useState(false);

  const onCreationSuccess = useCallback(
    (data: User) => {
      setCreationSuccess(true);
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

  // in case of a successful creation, we do not want to switch back to showing the "scan again" button during the navigation animation
  if (hasPermission === undefined || loadingCreateEncounter || creationSuccess) {
    return (
      <SafeAreaViewFlex>
        <ScrollView>
          <SectionHeader title={texts.encounter.scannerTitle} />
          <LoadingSpinner loading />
        </ScrollView>
      </SafeAreaViewFlex>
    );
  }

  if (!hasPermission) {
    return (
      <ScrollView>
        <SectionHeader title={texts.encounter.scannerTitle} />
        <Wrapper>
          <RegularText>{texts.encounter.cameraPermissionMissing}</RegularText>
        </Wrapper>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <SectionHeader title={texts.encounter.scannerTitle} />
      <Wrapper>
        <BoldText>{texts.encounter.scannerSubTitle}</BoldText>
      </Wrapper>
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
        <Wrapper>
          <Button title={texts.encounter.scanAgain} onPress={onPress} />
        </Wrapper>
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
