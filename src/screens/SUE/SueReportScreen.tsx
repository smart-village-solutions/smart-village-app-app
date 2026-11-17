import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from 'expo-router/js-stack';
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
import { UseFormSetValue, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Keyboard, ScrollView, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useMutation, useQuery } from 'react-query';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  HeaderRight,
  HtmlView,
  LoadingContainer,
  SafeAreaViewFlex,
  SueReportDescription,
  SueReportLocation,
  SueReportProgress,
  SueReportSend,
  SueReportServices,
  SueReportUser,
  Wrapper
} from '../../components';
import { SUE_MY_REPORTS, SUE_REPORT_VALUES, consts, device, normalize, texts } from '../../config';
import {
  addToStore,
  formatSizeStandard,
  getInitialSueStatus,
  getSueLimitOfAreaCity,
  readFromStore
} from '../../helpers';
import {
  geocodeSueAddress,
  getSueAddressKey,
  isSuePostalCodeAllowed,
  isSuePostalCodeValid,
  withSueLocationTimeout,
  SueAddress
} from '../../helpers/sueReportLocation';
import { useKeyboardHeight } from '../../hooks';
import {
  SueCoordinates,
  SueLocationRequest,
  useSueReportLocation
} from '../../hooks/useSueReportLocation';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { QUERY_TYPES, getQuery } from '../../queries';
import { postRequests } from '../../queries/SUE';

const { INPUT_KEYS, MB_TO_BYTES } = consts;

type TRequiredFields = {
  [key: string]: {
    [key: string]: boolean;
  };
};

const sueProgressWithRequiredInputs = (
  requiredFields: TRequiredFields,
  geoMap: { locationIsRequired: boolean; locationStreetIsRequired: boolean },
  progress: TProgress[]
): TProgress[] => {
  const requiredInputs: { [key: string]: boolean } = {};

  if (requiredFields) {
    for (const field in requiredFields) {
      requiredInputs[field] = requiredFields[field];
    }
  }

  requiredInputs[INPUT_KEYS.SUE.CITY] = !!geoMap?.locationIsRequired;
  requiredInputs[INPUT_KEYS.SUE.POSTAL_CODE] = !!geoMap?.locationIsRequired;
  requiredInputs[INPUT_KEYS.SUE.STREET] = !!geoMap?.locationStreetIsRequired;

  return progress.map((item) => {
    item.requiredInputs = (item.requiredInputs || []).filter((key) => requiredInputs?.[key]);

    for (const key of item.inputs || []) {
      if (requiredInputs[key] && !item.requiredInputs.includes(key)) {
        item.requiredInputs.push(key);
      }
    }

    return item;
  });
};

const clampProgress = (progress: unknown, maxProgress: number) => {
  const numericProgress = typeof progress === 'number' ? progress : Number(progress);
  const normalizedProgress = Number.isFinite(numericProgress) ? Math.trunc(numericProgress) : 0;

  if (maxProgress < 0) {
    return 0;
  }

  return Math.min(Math.max(normalizedProgress, 0), maxProgress);
};

export type TValues = {
  city: string;
  description: string;
  email: string;
  lastName: string;
  houseNumber: string;
  images: string;
  firstName: string;
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
  beginLocationUpdate: () => SueLocationRequest;
  invalidateLocation: (change?: Partial<SueAddress>) => void;
  configuration: {
    geoMap: {
      areas: any[];
      center: number[];
      clusterDistance: number;
      clusterThreshold: number;
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
  isFullscreenMap: boolean;
  requiredInputs?: (keyof TValues)[];
  resolveManualLocation: () => Promise<boolean | undefined>;
  selectedPosition?: SueCoordinates;
  service?: TService;
  storeReportValues: () => Promise<void>;
  setIsFullscreenMap: (value: boolean) => void;
  setSelectedPosition: (position?: SueCoordinates) => void;
  setService: any;
  setShowCoordinatesFromImageAlert: (value: boolean) => void;
  setUpdateRegionFromImage: (value: boolean) => void;
  setValue: UseFormSetValue<TValues>;
  updateRegionFromImage: boolean;
};

const Content = ({
  areaServiceData,
  beginLocationUpdate,
  configuration,
  content,
  control,
  errorMessage,
  errors,
  isFullscreenMap,
  invalidateLocation,
  requiredInputs,
  resolveManualLocation,
  selectedPosition,
  service,
  storeReportValues,
  setIsFullscreenMap,
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
          beginLocationUpdate={beginLocationUpdate}
          configuration={configuration}
          control={control}
          errorMessage={errorMessage}
          requiredInputs={requiredInputs}
          selectedPosition={selectedPosition}
          storeReportValues={storeReportValues}
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
          beginLocationUpdate={beginLocationUpdate}
          configuration={configuration}
          control={control}
          errorMessage={errorMessage}
          invalidateLocation={invalidateLocation}
          isFullscreenMap={isFullscreenMap}
          requiredInputs={requiredInputs}
          resolveManualLocation={resolveManualLocation}
          selectedPosition={selectedPosition}
          setIsFullscreenMap={setIsFullscreenMap}
          setSelectedPosition={setSelectedPosition}
          setShowCoordinatesFromImageAlert={setShowCoordinatesFromImageAlert}
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

type TStoredValues = Partial<TValues> & {
  confirmedLocationAddress?: string;
  currentProgress?: number;
  selectedPosition?: SueCoordinates;
  service?: TService;
};

type TProgress = {
  content: 'category' | 'description' | 'location' | 'user';
  inputs: (keyof TValues)[];
  requiredInputs?: (keyof TValues)[];
  serviceCode: string;
  title: string;
};

const MemoizedContent = memo(Content);

/* eslint-disable complexity */
export const SueReportScreen = ({
  navigation,
  route
}: { navigation: any } & StackScreenProps<any>) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const {
    isLoading: isConfigLoading,
    refetch: configRefetch,
    sueConfig = {}
  } = useContext(ConfigurationsContext);
  const {
    geoMap = {},
    limitation = {},
    limitOfArea = {},
    requiredFields = {},
    showInternalPendingStatus,
    sueProgress = []
  } = sueConfig;

  const {
    city: limitOfCity = '',
    postalCodes: limitOfPostalCodes = [],
    zipCodes: legacyZipCodes = [],
    errorMessage: configuredErrorMessage = ''
  } = limitOfArea;
  const limitOfAreaCity = getSueLimitOfAreaCity({
    areaName: geoMap?.areas?.[0]?.name,
    configuredCity: limitOfCity
  });
  const areaServiceAreaId =
    geoMap?.areas?.[0]?.id ||
    (sueConfig as { apiConfig?: { areaService?: { id?: string } } })?.apiConfig?.areaService?.id ||
    '';
  const errorMessage =
    configuredErrorMessage ||
    (limitOfAreaCity
      ? texts.sue.report.alerts.limitOfArea(limitOfAreaCity)
      : texts.sue.report.alerts.locationOutsideArea);

  // useRef instead of useState: the flag must be read synchronously inside
  // alertTextGeneratorForMissingData to prevent React async-batching from
  // causing the "coordinates from image" alert to fire more than once.
  const showCoordinatesFromImageAlertRef = useRef(false);
  const setShowCoordinatesFromImageAlert = useCallback((value: boolean) => {
    showCoordinatesFromImageAlertRef.current = value;
  }, []);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [service, setService] = useState<TService>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStoredData, setIsLoadingStoredData] = useState<boolean>(true);
  const [isDone, setIsDone] = useState(false);
  const [storedValues, setStoredValues] = useState<TStoredValues>();
  const [updateRegionFromImage, setUpdateRegionFromImage] = useState(false);
  const [contentHeights, setContentHeights] = useState([]);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  const memoizedConfiguration = useMemo(
    () => ({
      limitation,
      geoMap,
      requiredFields
    }),
    [limitation, geoMap, requiredFields]
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollViewContentRef = useRef<(ScrollView | null)[]>([]);
  const hasAppliedInitialProgressRef = useRef(false);

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
  } = useForm<TValues>({
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

  const { data: areaServiceResult, isLoading: areaServiceLoading } = useQuery(
    [QUERY_TYPES.SUE.AREA_SERVICE, areaServiceAreaId, limitOfAreaCity],
    () => withSueLocationTimeout((signal) => getQuery(QUERY_TYPES.SUE.AREA_SERVICE)({ signal })),
    { enabled: !!(areaServiceAreaId || limitOfAreaCity), retry: false }
  );

  const areaServiceData = useMemo(() => {
    if (limitOfPostalCodes.length) return { postalCodes: limitOfPostalCodes };
    if (legacyZipCodes.length) return { postalCodes: legacyZipCodes };
    if (areaServiceResult?.postalCodes?.length) return areaServiceResult;
    return areaServiceAreaId || limitOfAreaCity ? { postalCodes: [] } : undefined;
  }, [areaServiceAreaId, areaServiceResult, limitOfPostalCodes, legacyZipCodes, limitOfAreaCity]);

  const {
    beginLocationUpdate,
    cancelLocationUpdate,
    getConfirmedLocation,
    invalidateLocation,
    isLocationPending,
    selectedPosition,
    setSelectedPosition
  } = useSueReportLocation(getValues);
  const { mutateAsync } = useMutation(postRequests);

  const alertTextGeneratorForMissingData = () => {
    const requiredInputs = sueProgressWithConfig?.[currentProgress]?.requiredInputs;
    const isAnyInputMissing = requiredInputs?.some((inputKey) => !getValues(inputKey));
    let alertText = '';

    if (sueProgressWithConfig?.[currentProgress]?.content === 'location') {
      return (
        getLocationError(getValues()) ||
        (isAnyInputMissing ? texts.sue.report.alerts.missingAnyInput : '')
      );
    }

    switch (currentProgress) {
      case 0:
        if (!service?.serviceCode) {
          alertText = texts.sue.report.alerts.serviceCode;
        }
        break;
      case 1:
        if (!getValues(INPUT_KEYS.SUE.TITLE).trim()) {
          alertText = texts.sue.report.alerts.title;
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
          const isImageGreater30MB = images.some(({ size }: { size: number }) => {
            totalSize += size;
            return size >= MB_TO_BYTES[30];
          });

          /* the server does not support files more than 30MB in size. */
          if (isImageGreater30MB) {
            /* the server does not support files larger than `totalSizeLimit` in total of all files. */
            alertText = texts.sue.report.alerts.imageGreater30MBError;
          } else if (totalSize >= totalSizeLimit) {
            alertText = texts.sue.report.alerts.imagesTotalSizeError(
              formatSizeStandard(totalSizeLimit, 0)
            );
          } else if (selectedPosition && !showCoordinatesFromImageAlertRef.current) {
            setShowCoordinatesFromImageAlert(true);
            Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.imageLocation);
          }
        }

        if (isAnyInputMissing) {
          alertText = texts.sue.report.alerts.missingAnyInput;
        }
        break;
      case 3:
        if (isAnyInputMissing) {
          alertText = texts.sue.report.alerts.missingAnyInput;
        } else if (!getValues(INPUT_KEYS.SUE.TERMS_OF_SERVICE)) {
          scrollViewContentRef.current[currentProgress]?.scrollTo({
            x: 0,
            y: contentHeights[currentProgress],
            animated: true
          });
          alertText = texts.sue.report.alerts.terms;
        }
        break;
      default:
        break;
    }

    return alertText;
  };

  useEffect(() => {
    readReportValuesFromStore();
  }, []);

  const sueProgressWithConfig = useMemo(
    () => sueProgressWithRequiredInputs(requiredFields, geoMap, sueProgress),
    [requiredFields, geoMap, sueProgress]
  );

  const locationStep = sueProgressWithConfig.findIndex(({ content }) => content === 'location');
  const getLocationError = useCallback(
    (address: SueAddress) => {
      if (locationStep < 0) return '';
      if (isLocationPending()) return texts.sue.report.alerts.locationPending;
      if (address.houseNumber && !address.street) return texts.sue.report.alerts.street;
      if (address.city && !address.postalCode) return texts.sue.report.alerts.postalCode;
      if (address.postalCode && !isSuePostalCodeValid(address.postalCode)) {
        return texts.sue.report.alerts.postalCodeLength;
      }
      if (address.postalCode && !address.city) return texts.sue.report.alerts.city;
      if (
        (geoMap.locationStreetIsRequired && !address.street.trim()) ||
        (geoMap.locationIsRequired && (!address.city.trim() || !address.postalCode))
      ) {
        return texts.sue.report.alerts.missingAnyInput;
      }
      if (
        address.postalCode &&
        areaServiceData?.postalCodes &&
        !isSuePostalCodeAllowed(address.postalCode, areaServiceData.postalCodes)
      ) {
        return errorMessage;
      }

      return '';
    },
    [
      areaServiceData,
      errorMessage,
      geoMap.locationIsRequired,
      geoMap.locationStreetIsRequired,
      isLocationPending,
      locationStep
    ]
  );

  const resolveManualLocation = useCallback(async () => {
    if (isLocationPending()) return;
    const address = getValues();
    const confirmedLocation = getConfirmedLocation(address);
    if (confirmedLocation) {
      // A new position reference recenters the camera on the same pin.
      setSelectedPosition({ ...confirmedLocation.position });
      return true;
    }

    const addressKey = getSueAddressKey(address);
    const request = beginLocationUpdate();
    const canApplyResult = () =>
      request.isLatestRequest() && addressKey === getSueAddressKey(getValues());
    setShowCoordinatesFromImageAlert(true);
    setUpdateRegionFromImage(false);

    try {
      const position = await geocodeSueAddress(address, areaServiceData?.postalCodes);
      if (!canApplyResult()) return;

      if (position) setSelectedPosition(position);
      return !!position;
    } catch {
      if (canApplyResult()) return false;
    } finally {
      request.finish();
    }
  }, [
    areaServiceData,
    beginLocationUpdate,
    getConfirmedLocation,
    getValues,
    isLocationPending,
    setSelectedPosition,
    setShowCoordinatesFromImageAlert
  ]);

  const storeReportValues = useCallback(
    async (progress = currentProgress) => {
      const values = getValues();
      const location = getConfirmedLocation(values);
      await addToStore(SUE_REPORT_VALUES, {
        currentProgress: progress,
        confirmedLocationAddress: location?.addressKey,
        selectedPosition: location?.position,
        service,
        ...values
      });
    },
    [currentProgress, service, getValues, getConfirmedLocation]
  );

  const storeMyReportsValues = async (newReport: any) => {
    try {
      const jsonValue = await readFromStore(SUE_MY_REPORTS);
      let myReports = [];

      if (jsonValue != null) {
        myReports = JSON.parse(jsonValue);
      }
      myReports.unshift(newReport);

      await addToStore(SUE_MY_REPORTS, JSON.stringify(myReports));
    } catch (error) {
      console.error('Error storing my reports values to AsyncStorage', error);
    }
  };

  async function readReportValuesFromStore() {
    const savedValues = (await readFromStore(SUE_REPORT_VALUES)) as TStoredValues | undefined;

    if (savedValues) {
      const restoredProgress = clampProgress(
        savedValues.currentProgress,
        sueProgressWithConfig.length - 1
      );
      setStoredValues(savedValues);
      setService(savedValues.service);
      setCurrentProgress(restoredProgress);
      const fields = Object.keys(getValues()) as (keyof TValues)[];
      for (const key of fields) {
        if (savedValues[key] !== undefined) setValue(key, savedValues[key]);
      }
      if (savedValues.confirmedLocationAddress === getSueAddressKey(getValues())) {
        setSelectedPosition(savedValues.selectedPosition);
      }
    }

    setIsLoadingStoredData(false);
  }

  const resetStoredValues = useCallback(async () => {
    invalidateLocation();
    setIsLoadingStoredData(true);
    await AsyncStorage.removeItem(SUE_REPORT_VALUES);
    setStoredValues(undefined);
    setService(undefined);
    reset();
    scrollViewRef?.current?.scrollTo({
      x: 0,
      y: 0,
      animated: true
    });
    setCurrentProgress(0);
    hasAppliedInitialProgressRef.current = false;
    setIsLoadingStoredData(false);
  }, [invalidateLocation, reset]);

  useEffect(() => {
    if (isLoadingStoredData || hasAppliedInitialProgressRef.current) {
      return;
    }

    if (currentProgress > 0) {
      scrollViewRef?.current?.scrollTo({
        x: device.width * currentProgress,
        y: 0,
        animated: false
      });
    }

    hasAppliedInitialProgressRef.current = true;
  }, [isLoadingStoredData, currentProgress]);

  const handleNextPage = async () => {
    Keyboard.dismiss();

    const validationError = alertTextGeneratorForMissingData();
    if (validationError) return Alert.alert(texts.sue.report.alerts.hint, validationError);

    if (currentProgress === locationStep) {
      const address = getValues();
      if (
        address.street.trim() &&
        address.city.trim() &&
        address.postalCode &&
        !getConfirmedLocation(address) &&
        (await resolveManualLocation()) === undefined
      ) {
        return;
      }

      const locationError = getLocationError(getValues());
      if (locationError) return Alert.alert(texts.sue.report.alerts.hint, locationError);
    }

    const nextProgress = Math.min(currentProgress + 1, sueProgressWithConfig.length - 1);
    await storeReportValues(nextProgress);

    if (currentProgress < sueProgressWithConfig.length - 1) {
      setCurrentProgress(nextProgress);
      scrollViewRef?.current?.scrollTo({
        x: device.width * nextProgress,
        y: 0,
        animated: true
      });
    }
  };

  const handlePrevPage = useCallback(() => {
    Keyboard.dismiss();
    if (currentProgress > 0) {
      if (currentProgress === locationStep && isLocationPending()) cancelLocationUpdate();
      const prevProgress = currentProgress - 1;
      void storeReportValues(prevProgress);
      setCurrentProgress(prevProgress);
      scrollViewRef?.current?.scrollTo({
        x: device.width * prevProgress,
        y: 0,
        animated: true
      });
    }
  }, [cancelLocationUpdate, currentProgress, isLocationPending, locationStep, storeReportValues]);

  // Ensure map fullscreen mode is exited when navigating between steps
  useEffect(() => {
    setIsFullscreenMap(false);
  }, [currentProgress]);

  const onSubmit = useCallback(
    async (sueReportData: TValues) => {
      Keyboard.dismiss();

      await storeReportValues();

      if (alertTextGeneratorForMissingData()) {
        return Alert.alert(texts.sue.report.alerts.hint, alertTextGeneratorForMissingData());
      }

      const locationError = getLocationError(sueReportData);
      if (locationError) {
        setCurrentProgress(locationStep);
        scrollViewRef.current?.scrollTo({ x: device.width * locationStep, animated: true });
        return Alert.alert(texts.sue.report.alerts.hint, locationError);
      }

      const position = getConfirmedLocation(sueReportData)?.position;
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
        ...sueReportData,
        addressString,
        lat: position?.latitude,
        long: position?.longitude,
        serviceCode: service?.serviceCode,
        phone: parsePhoneNumber(sueReportData.phone, 'DE')?.formatInternational() || '',
        description: sueReportData.description || '-'
      };

      setIsLoading(true);
      await mutateAsync(formData, {
        onError: () => {
          setIsLoading(false);
          setCurrentProgress(0);

          return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
        },
        onSuccess: async (data) => {
          if (data?.status && data.status !== 200) {
            setIsLoading(false);
            setCurrentProgress(0);

            return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
          }

          const serviceRequestId = Array.isArray(data)
            ? data[0]?.service_request_id
            : data?.service_request_id;

          if (!serviceRequestId) {
            setIsLoading(false);
            setCurrentProgress(0);

            return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
          }

          let parsedImages = [];
          try {
            parsedImages = JSON.parse(formData.images) || [];
          } catch (e) {
            // fallback to empty list if images JSON is invalid
          }

          await storeMyReportsValues({
            address: `${sueReportData.street} ${sueReportData.houseNumber}\r\n ${sueReportData.postalCode} ${sueReportData.city}`,
            id: serviceRequestId,
            media_url: JSON.stringify(
              parsedImages.map((image: any, index: number) => ({
                contentType: 'image',
                id: `local-${index}`,
                url: image.uri,
                visible: true
              }))
            ),
            requestedDatetime: new Date().toISOString(),
            serviceName: service?.serviceName,
            serviceRequestId,
            ...formData,
            ...getInitialSueStatus(showInternalPendingStatus)
          });
          setIsDone(true);
          resetStoredValues();
          setIsLoading(false);
        }
      }).catch(() => undefined); // The mutation's onError callback already shows the failure alert.
    },
    [
      alertTextGeneratorForMissingData,
      getConfirmedLocation,
      getLocationError,
      locationStep,
      service,
      mutateAsync,
      resetStoredValues,
      showInternalPendingStatus,
      storeReportValues
    ]
  );

  useEffect(() => {
    configRefetch();
  }, [configRefetch]);

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
        headerRight: () => (
          <HeaderRight
            {...{
              navigation,
              route
            }}
          />
        )
      });
    }
  }, [navigation, resetStoredValues, route, storedValues]);

  if (!sueProgressWithConfig.length) {
    return null;
  }

  if (areaServiceLoading && !areaServiceData?.postalCodes?.length) {
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
      <DefaultKeyboardAvoidingView>
        <SueReportProgress
          progress={sueProgressWithConfig}
          currentProgress={currentProgress + 1}
          isFullscreenMap={isFullscreenMap}
        />
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
              ref={(view) => {
                scrollViewContentRef.current[index] = view;
              }}
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
                  beginLocationUpdate={beginLocationUpdate}
                  configuration={memoizedConfiguration}
                  content={item.content}
                  control={control}
                  errorMessage={errorMessage}
                  errors={errors}
                  isFullscreenMap={isFullscreenMap}
                  invalidateLocation={invalidateLocation}
                  requiredInputs={item.requiredInputs}
                  resolveManualLocation={resolveManualLocation}
                  selectedPosition={selectedPosition}
                  service={service}
                  storeReportValues={storeReportValues}
                  setIsFullscreenMap={setIsFullscreenMap}
                  setSelectedPosition={setSelectedPosition}
                  setService={setService}
                  setShowCoordinatesFromImageAlert={setShowCoordinatesFromImageAlert}
                  setUpdateRegionFromImage={setUpdateRegionFromImage}
                  setValue={setValue}
                  updateRegionFromImage={updateRegionFromImage}
                />
              )}

              {device.platform === 'android' && !isFullscreenMap && (
                <View style={{ height: normalize(keyboardHeight) * 0.5 }} />
              )}
            </ScrollView>
          ))}
        </ScrollView>

        {!isFullscreenMap && <Divider />}

        {!!service?.serviceName && !!service.description && currentProgress === 0 && (
          <Wrapper style={styles.noPaddingBottom}>
            <BoldText>{service.serviceName}</BoldText>
            <HtmlView big={false} html={service.description} />
          </Wrapper>
        )}

        <Wrapper
          style={[
            styles.buttonContainer,
            currentProgress !== 0 && styles.buttonContainerRow,
            isFullscreenMap && styles.buttonContainerHidden
          ]}
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

const createStyles = () => ({
  buttonContainer: {
    paddingBottom: 0
  },

  buttonContainerHidden: {
    display: 'none'
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
