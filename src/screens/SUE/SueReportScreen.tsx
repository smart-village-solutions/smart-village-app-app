import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import * as ScreenOrientation from 'expo-screen-orientation';
import parsePhoneNumber from 'libphonenumber-js';
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useForm, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  HeaderRight,
  LoadingContainer,
  SafeAreaViewFlex,
  SueReportDescription,
  SueReportLocation,
  SueReportProgress,
  SueReportSend,
  SueReportServices,
  SueReportUser,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { colors, device, normalize, texts } from '../../config';
import { addToStore, readFromStore } from '../../helpers';
import { useKeyboardHeight, useStaticContent } from '../../hooks';
import { postRequests } from '../../queries/SUE';
import { SettingsContext } from '../../SettingsProvider';

export const SUE_REPORT_VALUES = 'sueReportValues';

export type TValues = {
  city: string;
  description: string;
  email: string;
  firstName: string;
  houseNumber: string;
  images: string;
  lastName: string;
  phone: string;
  street: string;
  termsOfService: boolean;
  title: string;
  zipCode: string;
};

const Content = (
  content: 'category' | 'description' | 'location' | 'user',
  requiredInputs: string[],
  serviceCode: string,
  setServiceCode: any,
  control: any,
  errors: any,
  selectedPosition: Location.LocationObjectCoords | undefined,
  setSelectedPosition: any,
  setValue: UseFormSetValue<TValues>,
  getValues: UseFormGetValues<TValues>
) => {
  switch (content) {
    case 'description':
      return <SueReportDescription control={control} requiredInputs={requiredInputs} />;
    case 'location':
      return (
        <SueReportLocation
          control={control}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          setValue={setValue}
          getValues={getValues}
          requiredInputs={requiredInputs}
        />
      );
    case 'user':
      return <SueReportUser control={control} errors={errors} requiredInputs={requiredInputs} />;
    default:
      return <SueReportServices serviceCode={serviceCode} setServiceCode={setServiceCode} />;
  }
};

type TReports = {
  category: string;
  city: string;
  description: string;
  email: string;
  firstName: string;
  houseNumber: string;
  images: { uri: string; mimeType: string }[];
  lastName: string;
  phone: string;
  street: string;
  termsOfService: string;
  title: string;
  zipCode: string;
};

type TProgress = {
  content: 'category' | 'description' | 'location' | 'user';
  requiredInputs: keyof TReports[];
  serviceCode: string;
  title: string;
};

export const SueReportScreen = ({
  navigation,
  route
}: { navigation: any } & StackScreenProps<any>) => {
  const { data, loading } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-sueReportProgress',
    name: 'sueReportProgress',
    type: 'json'
  });

  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { limitOfArea = {} } = settings;
  const {
    city: limitOfCity = '',
    zipCodes: limitOfZipCodes = [],
    errorMessage = texts.sue.report.alerts.limitOfArea(limitOfArea.city || '')
  } = limitOfArea;

  const [currentProgress, setCurrentProgress] = useState(0);
  const [serviceCode, setServiceCode] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStoredData, setIsLoadingStoredData] = useState<boolean>(true);
  const [selectedPosition, setSelectedPosition] = useState<Location.LocationObjectCoords>();
  const [isDone, setIsDone] = useState(false);
  const [storedValues, setStoredValues] = useState<TReports>();

  const scrollViewRef = useRef(null);
  const scrollViewContentRef = useRef(null);

  const keyboardHeight = useKeyboardHeight();

  useEffect(() => {
    // this screen is set to portrait mode because half of the screen is visible in landscape
    // mode when viewing pictures in large screen mode
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    });

    return unsubscribe;
  }, [navigation]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
    setValue,
    reset
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      city: '',
      description: '',
      email: '',
      firstName: '',
      houseNumber: '',
      images: '[]',
      lastName: '',
      phone: '',
      street: '',
      termsOfService: false,
      title: '',
      zipCode: ''
    }
  });

  const { mutateAsync } = useMutation(postRequests);

  const onSubmit = async (sueReportData: TReports) => {
    Keyboard.dismiss();

    storeReportValues();

    if (alertTextGeneratorForMissingData()) {
      return Alert.alert(texts.sue.report.alerts.hint, alertTextGeneratorForMissingData());
    }

    let addressString;
    if (
      !!sueReportData.street ||
      !!sueReportData.houseNumber ||
      !!sueReportData.zipCode ||
      !!sueReportData.city
    ) {
      addressString = `${sueReportData.street}; ${sueReportData.houseNumber}; ${sueReportData.zipCode}; ${sueReportData.city}`;
    }

    const formData = {
      addressString,
      lat: selectedPosition?.latitude,
      long: selectedPosition?.longitude,
      serviceCode,
      ...sueReportData,
      phone: parsePhoneNumber(sueReportData.phone, 'DE')?.formatInternational(),
      description: sueReportData.description || '-'
    };

    setIsLoading(true);
    await mutateAsync(formData, {
      onError: () => {
        setIsLoading(false);
        setCurrentProgress(0);

        return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
      },
      onSuccess: (data) => {
        if (data?.status && data.status !== 200) {
          setIsLoading(false);
          setCurrentProgress(0);

          return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
        }

        setTimeout(
          () => {
            setIsDone(true);
            resetStoredValues();
            setIsLoading(false);
          },
          JSON.parse(sueReportData?.images).length ? 0 : 3000
        );
      }
    });
  };

  /* eslint-disable complexity */
  const alertTextGeneratorForMissingData = () => {
    switch (currentProgress) {
      case 0:
        if (!serviceCode) {
          return texts.sue.report.alerts.serviceCode;
        }
        break;
      case 1:
        if (!getValues().title) {
          return texts.sue.report.alerts.title;
        } else if (getValues().images) {
          const images = JSON.parse(getValues().images);

          let totalSize = 0;
          const sizeOfImage = images.some(({ size }: { size: number }) => {
            totalSize += size;
            return size >= 10485760;
          });

          /* the server does not support files more than 10MB in size. */
          if (sizeOfImage) {
            return texts.sue.report.alerts.imageGreater10MBError;
          }

          /* the server does not support files larger than 30 MB in total of all files. */
          if (totalSize >= 31457280) {
            return texts.sue.report.alerts.imagesGreater30MBError;
          }
        }
        break;
      case 2:
        if (getValues().houseNumber && !getValues().street) {
          return texts.sue.report.alerts.street;
        }

        if (getValues().city) {
          if (!getValues().zipCode) {
            return texts.sue.report.alerts.zipCode;
          }

          if (
            !!limitOfCity &&
            limitOfCity.toLocaleLowerCase() !== getValues().city.toLocaleLowerCase()
          ) {
            return errorMessage;
          }
        }

        if (getValues().zipCode) {
          if (getValues().zipCode.length !== 5) {
            return texts.sue.report.alerts.zipCodeLength;
          }

          if (!getValues().city) {
            return texts.sue.report.alerts.city;
          }

          if (!!limitOfZipCodes.length && !limitOfZipCodes.includes(getValues().zipCode)) {
            return errorMessage;
          }
        }
        break;
      case 3:
        if (!getValues().firstName && !getValues().lastName && !getValues().email) {
          return texts.sue.report.alerts.contact;
        }

        if (!getValues().termsOfService) {
          scrollViewContentRef.current?.scrollTo({
            x: 0,
            y: device.height,
            animated: true
          });

          return texts.sue.report.alerts.termsOfService;
        }
        break;
      default:
        break;
    }

    const isAnyInputMissing = data?.[currentProgress]?.requiredInputs?.some(
      (inputKey: keyof TValues) => !getValues()[inputKey]
    );

    if (isAnyInputMissing) {
      return texts.sue.report.alerts.missingAnyInput;
    }
  };
  /* eslint-enable complexity */

  useEffect(() => {
    readReportValuesFromStore();
  }, []);

  const storeReportValues = async () => {
    await addToStore(SUE_REPORT_VALUES, { selectedPosition, serviceCode, ...getValues() });
  };

  const readReportValuesFromStore = async () => {
    const storedValues = await readFromStore(SUE_REPORT_VALUES);

    if (storedValues) {
      setStoredValues(storedValues);
      setServiceCode(storedValues.serviceCode);
      setSelectedPosition(storedValues.selectedPosition);
      Object.entries(storedValues).map(([key, value]) => setValue(key, value));
    }

    setIsLoadingStoredData(false);
  };

  const resetStoredValues = async () => {
    setIsLoadingStoredData(true);
    await AsyncStorage.removeItem(SUE_REPORT_VALUES);
    setStoredValues(undefined);
    setServiceCode(undefined);
    setSelectedPosition(undefined);
    reset();
    scrollViewRef?.current?.scrollTo({
      x: 0,
      y: 0,
      animated: true
    });
    setCurrentProgress(0);
    setIsLoadingStoredData(false);
  };

  const handleNextPage = async () => {
    Keyboard.dismiss();
    if (alertTextGeneratorForMissingData()) {
      return Alert.alert(texts.sue.report.alerts.hint, alertTextGeneratorForMissingData());
    }

    storeReportValues();

    if (currentProgress < data.length - 1) {
      setCurrentProgress(currentProgress + 1);
      scrollViewRef?.current?.scrollTo({
        x: device.width * (currentProgress + 1),
        y: 0,
        animated: true
      });
    }
  };

  const handlePrevPage = () => {
    Keyboard.dismiss();
    if (currentProgress > 0) {
      setCurrentProgress(currentProgress - 1);
      scrollViewRef?.current?.scrollTo({
        x: device.width * (currentProgress - 1),
        y: 0,
        animated: true
      });
    }
  };

  useLayoutEffect(() => {
    if (storedValues) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            {...{
              onPress: () =>
                Alert.alert(
                  texts.sue.report.alerts.dataDeleteAlert.title,
                  texts.sue.report.alerts.dataDeleteAlert.message,
                  [
                    { text: texts.sue.report.alerts.dataDeleteAlert.cancel },
                    {
                      text: texts.sue.report.alerts.dataDeleteAlert.ok,
                      onPress: resetStoredValues,
                      style: 'destructive'
                    }
                  ]
                ),
              navigation,
              route,
              withDelete: true
            }}
          />
        )
      });
    } else {
      navigation.setOptions({
        headerRight: () => null
      });
    }
  }, [storedValues, serviceCode, selectedPosition]);

  if (loading) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  if (isDone || isLoading) {
    return <SueReportSend navigation={navigation} isDone={isDone} isLoading={isLoading} />;
  }

  return (
    <SafeAreaViewFlex>
      <SueReportProgress progress={data} currentProgress={currentProgress + 1} />

      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          horizontal
          pagingEnabled
          ref={scrollViewRef}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          {data?.map((item: TProgress, index: number) => (
            <ScrollView
              key={index}
              contentContainerStyle={styles.contentContainer}
              ref={scrollViewContentRef}
            >
              {isLoadingStoredData ? (
                <LoadingContainer>
                  <ActivityIndicator color={colors.refreshControl} />
                </LoadingContainer>
              ) : (
                Content(
                  item.content,
                  item.requiredInputs,
                  serviceCode,
                  setServiceCode,
                  control,
                  errors,
                  selectedPosition,
                  setSelectedPosition,
                  setValue,
                  getValues
                )
              )}
              {device.platform === 'android' && (
                <View style={{ height: normalize(keyboardHeight) * 0.5 }} />
              )}
            </ScrollView>
          ))}
        </ScrollView>

        <WrapperHorizontal>
          <Divider />
        </WrapperHorizontal>

        <Wrapper
          style={[styles.buttonContainer, currentProgress !== 0 && styles.buttonContainerRow]}
        >
          {currentProgress !== 0 && (
            <Button
              disabled={isLoading}
              invert
              notFullWidth
              onPress={handlePrevPage}
              title={texts.sue.report.back}
            />
          )}

          <Button
            disabled={isLoading}
            notFullWidth={currentProgress !== 0}
            onPress={currentProgress < data.length - 1 ? handleNextPage : handleSubmit(onSubmit)}
            title={
              currentProgress === data.length - 1
                ? texts.sue.report.sendReport
                : texts.sue.report.next
            }
          />
        </Wrapper>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    paddingBottom: 0
  },
  buttonContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  contentContainer: {
    width: device.width
  }
});
