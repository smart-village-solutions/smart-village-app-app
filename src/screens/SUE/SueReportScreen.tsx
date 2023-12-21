import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackScreenProps } from '@react-navigation/stack';
import * as Location from 'expo-location';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { UseFormSetValue, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  HeaderRight,
  LoadingContainer,
  SafeAreaViewFlex,
  SueReportDescription,
  SueReportDone,
  SueReportLocation,
  SueReportProgress,
  SueReportServices,
  SueReportUser,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { colors, device, texts } from '../../config';
import { addToStore, readFromStore } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { postRequests } from '../../queries/SUE';

const Content = (
  content: 'category' | 'description' | 'location' | 'user',
  serviceCode: string,
  setServiceCode: any,
  control: any,
  errors: any,
  selectedPosition: Location.LocationObjectCoords | undefined,
  setSelectedPosition: any,
  setValue: UseFormSetValue<{
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
  }>
) => {
  switch (content) {
    case 'description':
      return <SueReportDescription control={control} errors={errors} />;
    case 'location':
      return (
        <SueReportLocation
          control={control}
          selectedPosition={selectedPosition}
          setSelectedPosition={setSelectedPosition}
          setValue={setValue}
        />
      );
    case 'user':
      return <SueReportUser control={control} errors={errors} />;
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
  title: string;
  termsOfService: string;
  zipCode: string;
};

type TProgress = {
  title: string;
  content: 'category' | 'description' | 'location' | 'user';
  serviceCode: string;
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

  const [currentProgress, setCurrentProgress] = useState(0);
  const [serviceCode, setServiceCode] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<Location.LocationObjectCoords>();
  const [isDone, setIsDone] = useState(false);
  const [storedValues, setStoredValues] = useState<TReports>();

  const scrollViewRef = useRef(null);

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
    storeReportValues();

    if (!sueReportData.termsOfService) {
      return Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.termsOfService);
    }

    const addressString = `${sueReportData.street}; ${sueReportData.houseNumber}; ${sueReportData.zipCode}; ${sueReportData.city}`;

    const formData = {
      addressString,
      lat: selectedPosition?.latitude,
      long: selectedPosition?.longitude,
      serviceCode,
      ...sueReportData
    };

    setIsLoading(true);
    mutateAsync(formData)
      .then(() => {
        setIsDone(true);
        resetStoredValues();
      })
      .catch(() => {
        setIsLoading(false);

        return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
      })
      .finally(() => setIsLoading(false));
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
          images.map(async ({ size }: { size: number }) => {
            totalSize += size;
          });

          /* the server does not support files more than 30MB in size. */
          if (totalSize >= 31457280) {
            return texts.sue.report.alerts.imagesGreater30MBError;
          }
        }
        break;
      case 2:
        if (!selectedPosition) {
          return texts.sue.report.alerts.location;
        } else if (
          !getValues().street ||
          !getValues().houseNumber ||
          !getValues().zipCode ||
          !getValues().city
        ) {
          return texts.sue.report.alerts.address;
        } else if (getValues().zipCode.length !== 5) {
          return texts.sue.report.alerts.zipCodeLength;
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

  const storeReportValues = async () => {
    await addToStore('sueReportValues', { selectedPosition, serviceCode, ...getValues() });
  };

  const readReportValuesFromStore = async () => {
    const storedValues = await readFromStore('sueReportValues');

    if (storedValues) {
      setStoredValues(storedValues);
      setServiceCode(storedValues.serviceCode);
      setSelectedPosition(storedValues.selectedPosition);
      setValue('city', storedValues.city);
      setValue('description', storedValues.description);
      setValue('email', storedValues.email);
      setValue('firstName', storedValues.firstName);
      setValue('houseNumber', storedValues.houseNumber);
      setValue('images', storedValues.images);
      setValue('lastName', storedValues.lastName);
      setValue('phone', storedValues.phone);
      setValue('street', storedValues.street);
      setValue('termsOfService', storedValues.termsOfService);
      setValue('title', storedValues.title);
      setValue('zipCode', storedValues.zipCode);
    }
  };

  const resetStoredValues = async () => {
    await AsyncStorage.removeItem('sueReportValues');
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
  };

  const handleNextPage = async () => {
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

  if (isDone) {
    return <SueReportDone navigation={navigation} />;
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
            <ScrollView key={index} contentContainerStyle={styles.contentContainer}>
              {Content(
                item.content,
                serviceCode,
                setServiceCode,
                control,
                errors,
                selectedPosition,
                setSelectedPosition,
                setValue
              )}
            </ScrollView>
          ))}
        </ScrollView>
      </DefaultKeyboardAvoidingView>

      <WrapperHorizontal>
        <Divider />
      </WrapperHorizontal>

      <Wrapper style={[styles.buttonContainer, currentProgress !== 0 && styles.buttonContainerRow]}>
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
