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
import { sleep } from '../helpers';
import { useCreateEncounter, useEncounterUser } from '../hooks';
import { ScreenName, User } from '../types';

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

// limit accepted aspect ratios to avoid unpredictable layouts. these aspect ratios should catch most devices
type AcceptedRatio = '1:1' | '4:3' | '3:2' | '16:9';

// a retry is needed because sometimes the device needs a short moment before the camera is fully launched.
// if after there is still no result after the retries there might be another error, and we fall back to 1:1 instead of possibly retrying infinitely
const getBestSupportedRatioWithRetry = async (cameraRef: Camera): Promise<AcceptedRatio> => {
  let ratioArray: string[] | undefined = undefined;
  let retryCount = 0;

  while (retryCount < 3 && !ratioArray) {
    try {
      ratioArray = await cameraRef.getSupportedRatiosAsync();
    } catch (e) {
      console.warn(e);
      sleep(50);
      retryCount++;
    }
  }

  if (ratioArray?.includes('1:1')) {
    return '1:1';
  }
  if (ratioArray?.includes('4:3')) {
    return '4:3';
  }
  if (ratioArray?.includes('3:2')) {
    return '3:2';
  }
  if (ratioArray?.includes('16:9')) {
    return '16:9';
  }

  // fall back to '1:1'
  return '1:1';
};

const getNumericalRatioFromAspectRatio = (ratioAsString: AcceptedRatio) => {
  switch (ratioAsString) {
    case '16:9':
      return 9 / 16;
    case '3:2':
      return 2 / 3;
    case '4:3':
      return 3 / 4;
    default:
      return 1;
  }
};

// TODO: accesibility labels
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterScannerScreen = ({ navigation }: { navigation: any }) => {
  const ref = useRef<Camera>(null);
  const { loading: loadingUser, user } = useEncounterUser();
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
    if (qrId && user?.userId) {
      createEncounter(qrId, user.userId);
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

  if (hasPermission === undefined || loadingUser || loadingCreateEncounter) {
    return (
      <SafeAreaViewFlex>
        <SectionHeader title={texts.encounter.scannerTitle} />
        <LoadingSpinner loading />
      </SafeAreaViewFlex>
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
