import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import * as ScreenOrientation from 'expo-screen-orientation';
import parsePhoneNumber from 'libphonenumber-js';
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { UseFormGetValues, UseFormSetValue, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useMutation, useQuery } from 'react-query';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  HeaderRight,
  LoadingContainer,
  RegularText,
  SafeAreaViewFlex,
  SueReportDescription,
  SueReportLocation,
  SueReportProgress,
  SueReportSend,
  SueReportServices,
  SueReportUser,
  Wrapper
} from '../../components';
import { colors, consts, device, normalize, texts } from '../../config';
import { addToStore, formatSizeStandard, readFromStore } from '../../helpers';
import { useKeyboardHeight } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { postRequests } from '../../queries/SUE';

export const SUE_REPORT_VALUES = 'sueReportValues';

const { INPUT_KEYS } = consts;

type TRequiredFields = {
  [key: string]: {
    [key: string]: boolean;
  };
};

// we had to apply this mapping because the input keys from ConfigAPI and the keys in the code do not match.
// TODO: this part of the code can be removed after the API update.
const keyMapping = {
  [INPUT_KEYS.SUE.NAME]: INPUT_KEYS.SUE.FIRST_NAME,
  [INPUT_KEYS.SUE.FAMILY_NAME]: INPUT_KEYS.SUE.LAST_NAME
};

export const getMappedKey = (inputKey: string) => keyMapping[inputKey] || inputKey;

const sueProgressWithRequiredInputs = (
  requiredFields: TRequiredFields,
  geoMap: { locationIsRequired: boolean; locationStreetIsRequired: boolean },
  progress: TProgress[]
): TProgress[] => {
  const requiredInputs: { [key: string]: boolean } = {};

  if (requiredFields?.contact) {
    for (const field in requiredFields.contact) {
      const mappedKey = getMappedKey(field);
      requiredInputs[mappedKey] = requiredFields.contact[field];
    }
  }

  requiredInputs[INPUT_KEYS.SUE.CITY] = !!geoMap?.locationIsRequired;
  requiredInputs[INPUT_KEYS.SUE.POSTAL_CODE] = !!geoMap?.locationIsRequired;
  requiredInputs[INPUT_KEYS.SUE.STREET] = !!geoMap?.locationStreetIsRequired;

  return progress.map((item) => {
    item.requiredInputs = (item.requiredInputs || []).filter(
      (key: string) => requiredInputs?.[getMappedKey(key)]
    );

    for (const key of item.inputs || []) {
      const mappedKey = getMappedKey(key);
      if (requiredInputs[mappedKey] && !item.requiredInputs.includes(mappedKey)) {
        item.requiredInputs.push(mappedKey);
      }
    }

    return item;
  });
};

export type TValues = {
  city: string;
  description: string;
  email: string;
  familyName: string;
  houseNumber: string;
  images: string;
  name: string;
  phone: string;
  postalCode: string;
  street: string;
  termsOfService: boolean;
  title: string;
};

export type TService = {
  description: string;
  metadata: boolean;
  serviceCode: string;
  serviceName: string;
};

type TContent = {
  areaServiceData?: { postalCodes?: string[] };
  configuration: {
    geoMap: {
      areas: any[];
      center: number[];
      clisterTreshold: number;
      clusterDistance: number;
      locationIsRequired: boolean;
      locationStreetIsRequired: boolean;
      minZoom: number;
    };
    limitation: any;
    requiredFields: any;
  };
  content: 'category' | 'description' | 'location' | 'user';
  control: any;
  errorMessage: string;
  errors: any;
  getValues: UseFormGetValues<TValues>;
  requiredInputs: keyof TValues[];
  selectedPosition?: Location.LocationObjectCoords;
  service?: TService;
  setSelectedPosition: (position?: Location.LocationObjectCoords) => void;
  setService: any;
  setShowCoordinatesFromImageAlert: (value: boolean) => void;
  setUpdateRegionFromImage: (value: boolean) => void;
  setValue: UseFormSetValue<TValues>;
  updateRegionFromImage: boolean;
};

const Content = ({
  areaServiceData,
  configuration,
  content,
  control,
  errorMessage,
  errors,
  getValues,
  requiredInputs,
  selectedPosition,
  service,
  setSelectedPosition,
  setService,
  setShowCoordinatesFromImageAlert,
  setUpdateRegionFromImage,
  setValue,
  updateRegionFromImage
}: TContent) => {
  switch (content) {
    case 'description':
      return (
        <SueReportDescription
          areaServiceData={areaServiceData}
          configuration={configuration}
          control={control}
          errorMessage={errorMessage}
          requiredInputs={requiredInputs}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          setShowCoordinatesFromImageAlert={setShowCoordinatesFromImageAlert}
          setUpdateRegionFromImage={setUpdateRegionFromImage}
          setValue={setValue}
        />
      );
    case 'location':
      return (
        <SueReportLocation
          areaServiceData={areaServiceData}
          control={control}
          errorMessage={errorMessage}
          getValues={getValues}
          requiredInputs={requiredInputs}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          setUpdateRegionFromImage={setUpdateRegionFromImage}
          setValue={setValue}
          updateRegionFromImage={updateRegionFromImage}
        />
      );
    case 'user':
      return (
        <SueReportUser
          configuration={configuration}
          control={control}
          errors={errors}
          requiredInputs={requiredInputs}
        />
      );
    default:
      return <SueReportServices setService={setService} service={service} />;
  }
};

type TReports = {
  category: string;
  city: string;
  description: string;
  email: string;
  familyName: string;
  houseNumber: string;
  images: { uri: string; mimeType: string }[];
  name: string;
  phone: string;
  postalCode: string;
  street: string;
  termsOfService: string;
  title: string;
};

type TProgress = {
  content: 'category' | 'description' | 'location' | 'user';
  inputs: string[];
  requiredInputs?: keyof TReports[];
  serviceCode: string;
  title: string;
};

const MemoizedContent = memo(Content);

/* eslint-disable complexity */
export const SueReportScreen = ({
  navigation,
  route
}: { navigation: any } & StackScreenProps<any>) => {
  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const {
    geoMap = {},
    limitation = {},
    limitOfArea = {},
    requiredFields = {},
    sueProgress = []
  } = sueConfig;

  const {
    city: limitOfCity = '',
    postalCodes: limitOfPostalCodes = [],
    errorMessage = texts.sue.report.alerts.limitOfArea(limitOfArea.city || '')
  } = limitOfArea;

  const [showCoordinatesFromImageAlert, setShowCoordinatesFromImageAlert] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [service, setService] = useState<TService>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStoredData, setIsLoadingStoredData] = useState<boolean>(true);
  const [selectedPosition, setSelectedPosition] = useState<Location.LocationObjectCoords>();
  const [isDone, setIsDone] = useState(false);
  const [storedValues, setStoredValues] = useState<TReports>();
  const [updateRegionFromImage, setUpdateRegionFromImage] = useState(false);
  const [contentHeights, setContentHeights] = useState([]);

  const memoizedConfiguration = useMemo(
    () => ({
      limitation,
      geoMap,
      requiredFields
    }),
    [limitation, geoMap, requiredFields]
  );

  const scrollViewRef = useRef(null);
  const scrollViewContentRef = useRef([]);

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

  const handleContentSizeChange = (index: number, contentHeight: number) => {
    setContentHeights((prevHeights) => {
      const newHeights = [...prevHeights];
      newHeights[index] = contentHeight;
      return newHeights;
    });
  };

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
      [INPUT_KEYS.SUE.CITY]: '',
      [INPUT_KEYS.SUE.DESCRIPTION]: '',
      [INPUT_KEYS.SUE.EMAIL]: '',
      [INPUT_KEYS.SUE.FIRST_NAME]: '',
      [INPUT_KEYS.SUE.HOUSE_NUMBER]: '',
      [INPUT_KEYS.SUE.IMAGES]: '[]',
      [INPUT_KEYS.SUE.LAST_NAME]: '',
      [INPUT_KEYS.SUE.PHONE]: '',
      [INPUT_KEYS.SUE.POSTAL_CODE]: '',
      [INPUT_KEYS.SUE.STREET]: '',
      [INPUT_KEYS.SUE.TERMS_OF_SERVICE]: false,
      [INPUT_KEYS.SUE.TITLE]: ''
    }
  });

  const { data: areaServiceData, isLoading: areaServiceLoading } = useQuery(
    [QUERY_TYPES.SUE.AREA_SERVICE],
    () => getQuery(QUERY_TYPES.SUE.AREA_SERVICE)(),
    { enabled: !!limitOfCity }
  );

  const { mutateAsync } = useMutation(postRequests);

  /* eslint-disable complexity */
  const alertTextGeneratorForMissingData = () => {
    const requiredInputs = sueProgressWithConfig?.[currentProgress]?.requiredInputs;

    const isAnyInputMissing = requiredInputs?.some((inputKey: string) => {
      const mappedKey = getMappedKey(inputKey);
      return !getValues(mappedKey);
    });

    switch (currentProgress) {
      case 0:
        if (!service?.serviceCode) {
          return texts.sue.report.alerts.serviceCode;
        }
        break;
      case 1:
        if (!getValues(INPUT_KEYS.SUE.TITLE).trim()) {
          return texts.sue.report.alerts.title;
        } else if (getValues(INPUT_KEYS.SUE.IMAGES)) {
          let images;

          try {
            images = JSON.parse(getValues(INPUT_KEYS.SUE.IMAGES));
          } catch (error) {
            console.error('Invalid JSON in images:', error);
            return;
          }

          if (!images?.length) {
            return;
          }

          let totalSize = 0;
          const totalSizeLimit = parseInt(limitation?.maxAttachmentSize?.value);

          const isImageGreater10MB = images.some(({ size }: { size: number }) => {
            totalSize += size;
            return size >= 10485760;
          });

          /* the server does not support files more than 10MB in size. */
          if (isImageGreater10MB) {
            return texts.sue.report.alerts.imageGreater10MBError;
          }

          /* the server does not support files larger than `totalSizeLimit` in total of all files. */
          if (totalSize >= totalSizeLimit) {
            return texts.sue.report.alerts.imagesTotalSizeError(
              formatSizeStandard(totalSizeLimit, 0)
            );
          }

          if (selectedPosition && !showCoordinatesFromImageAlert) {
            setShowCoordinatesFromImageAlert(true);

            Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.imageLocation);
          }

          if (selectedPosition && !showCoordinatesFromImageAlert) {
            setShowCoordinatesFromImageAlert(true);

            Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.imageLocation);
          }
        }

        if (isAnyInputMissing) {
          return texts.sue.report.alerts.missingAnyInput;
        }
        break;
      case 2:
        if (getValues(INPUT_KEYS.SUE.HOUSE_NUMBER) && !getValues(INPUT_KEYS.SUE.STREET)) {
          return texts.sue.report.alerts.street;
        }

        if (getValues(INPUT_KEYS.SUE.CITY)) {
          if (!getValues(INPUT_KEYS.SUE.POSTAL_CODE)) {
            return texts.sue.report.alerts.postalCode;
          }

          if (!areaServiceData?.postalCodes?.includes(getValues(INPUT_KEYS.SUE.POSTAL_CODE))) {
            return errorMessage;
          }
        }

        if (getValues(INPUT_KEYS.SUE.POSTAL_CODE)) {
          if (getValues(INPUT_KEYS.SUE.POSTAL_CODE).length !== 5) {
            return texts.sue.report.alerts.postalCodeLength;
          }

          if (!getValues(INPUT_KEYS.SUE.CITY)) {
            return texts.sue.report.alerts.city;
          }

          if (
            !!limitOfPostalCodes.length &&
            !limitOfPostalCodes.includes(getValues(INPUT_KEYS.SUE.POSTAL_CODE))
          ) {
            return errorMessage;
          }
        }

        if (isAnyInputMissing) {
          return texts.sue.report.alerts.missingAnyInput;
        }
        break;
      case 3:
        if (isAnyInputMissing) {
          return texts.sue.report.alerts.missingAnyInput;
        }

        if (!getValues(INPUT_KEYS.SUE.TERMS_OF_SERVICE)) {
          scrollViewContentRef.current[currentProgress]?.scrollTo({
            x: 0,
            y: contentHeights[currentProgress],
            animated: true
          });

          return texts.sue.report.alerts.terms;
        }
        break;
      default:
        break;
    }
  };
  /* eslint-enable complexity */

  useEffect(() => {
    readReportValuesFromStore();
  }, []);

  const sueProgressWithConfig = useMemo(
    () => sueProgressWithRequiredInputs(requiredFields, geoMap, sueProgress),
    [requiredFields, geoMap, sueProgress]
  );

  const storeReportValues = useCallback(async () => {
    await addToStore(SUE_REPORT_VALUES, {
      selectedPosition,
      service,
      ...getValues()
    });
  }, [selectedPosition, service, getValues]);

  const readReportValuesFromStore = async () => {
    const storedValues = await readFromStore(SUE_REPORT_VALUES);

    if (storedValues) {
      setStoredValues(storedValues);
      setService(storedValues.service);
      setSelectedPosition(storedValues.selectedPosition);
      Object.entries(storedValues).map(([key, value]) => setValue(key, value));
    }

    setIsLoadingStoredData(false);
  };

  const resetStoredValues = useCallback(async () => {
    setIsLoadingStoredData(true);
    await AsyncStorage.removeItem(SUE_REPORT_VALUES);
    setStoredValues(undefined);
    setService(undefined);
    setSelectedPosition(undefined);
    reset();
    scrollViewRef?.current?.scrollTo({
      x: 0,
      y: 0,
      animated: true
    });
    setCurrentProgress(0);
    setIsLoadingStoredData(false);
  }, [reset]);

  const handleNextPage = useCallback(async () => {
    Keyboard.dismiss();

    if (alertTextGeneratorForMissingData()) {
      return Alert.alert(texts.sue.report.alerts.hint, alertTextGeneratorForMissingData());
    }

    await storeReportValues();

    if (currentProgress < sueProgressWithConfig.length - 1) {
      setCurrentProgress(currentProgress + 1);
      scrollViewRef?.current?.scrollTo({
        x: device.width * (currentProgress + 1),
        y: 0,
        animated: true
      });
    }
  }, [
    alertTextGeneratorForMissingData,
    storeReportValues,
    currentProgress,
    sueProgressWithConfig.length
  ]);

  const handlePrevPage = useCallback(() => {
    Keyboard.dismiss();
    if (currentProgress > 0) {
      setCurrentProgress(currentProgress - 1);
      scrollViewRef?.current?.scrollTo({
        x: device.width * (currentProgress - 1),
        y: 0,
        animated: true
      });
    }
  }, [currentProgress]);

  const onSubmit = useCallback(
    async (sueReportData: TReports) => {
      Keyboard.dismiss();

      await storeReportValues();

      if (alertTextGeneratorForMissingData()) {
        return Alert.alert(texts.sue.report.alerts.hint, alertTextGeneratorForMissingData());
      }

      let addressString;
      if (
        !!sueReportData.street ||
        !!sueReportData.houseNumber ||
        !!sueReportData.postalCode ||
        !!sueReportData.city
      ) {
        addressString = `${sueReportData.street}; ${sueReportData.houseNumber}; ${sueReportData.postalCode}; ${sueReportData.city}`;
      }

      const formData = {
        addressString,
        lat: selectedPosition?.latitude,
        long: selectedPosition?.longitude,
        serviceCode: service?.serviceCode,
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
    },
    [
      alertTextGeneratorForMissingData,
      selectedPosition,
      service,
      mutateAsync,
      resetStoredValues,
      storeReportValues
    ]
  );

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
  }, [storedValues, service, selectedPosition]);

  if (areaServiceLoading) {
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
      <SueReportProgress progress={sueProgressWithConfig} currentProgress={currentProgress + 1} />

      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          horizontal
          pagingEnabled
          ref={scrollViewRef}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          {sueProgressWithConfig?.map((item: TProgress, index: number) => (
            <ScrollView
              key={index}
              contentContainerStyle={styles.contentContainer}
              ref={(e) => (scrollViewContentRef.current[index] = e)}
              onContentSizeChange={(contentHeight: number) =>
                handleContentSizeChange(index, contentHeight)
              }
            >
              {isLoadingStoredData ? (
                <LoadingContainer>
                  <ActivityIndicator color={colors.refreshControl} />
                </LoadingContainer>
              ) : (
                <MemoizedContent
                  areaServiceData={areaServiceData}
                  configuration={memoizedConfiguration}
                  content={item.content}
                  control={control}
                  errorMessage={errorMessage}
                  errors={errors}
                  getValues={getValues}
                  requiredInputs={item.requiredInputs}
                  selectedPosition={selectedPosition}
                  service={service}
                  setSelectedPosition={setSelectedPosition}
                  setService={setService}
                  setShowCoordinatesFromImageAlert={setShowCoordinatesFromImageAlert}
                  setUpdateRegionFromImage={setUpdateRegionFromImage}
                  setValue={setValue}
                  updateRegionFromImage={updateRegionFromImage}
                />
              )}

              {device.platform === 'android' && (
                <View style={{ height: normalize(keyboardHeight) * 0.5 }} />
              )}
            </ScrollView>
          ))}
        </ScrollView>

        <Divider />

        {!!service?.serviceName && !!service.description && currentProgress === 0 && (
          <Wrapper style={styles.noPaddingBottom}>
            <BoldText>{service.serviceName}</BoldText>
            <RegularText>{service.description}</RegularText>
          </Wrapper>
        )}

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
            onPress={
              currentProgress < sueProgressWithConfig.length - 1
                ? handleNextPage
                : handleSubmit(onSubmit)
            }
            title={
              currentProgress === sueProgressWithConfig.length - 1
                ? texts.sue.report.sendReport
                : texts.sue.report.next
            }
          />
        </Wrapper>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

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
  },
  noPaddingBottom: {
    paddingBottom: 0
  }
});
