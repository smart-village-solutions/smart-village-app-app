import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
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
import { useStaticContent } from '../../hooks';
import { postRequests } from '../../queries/SUE';

const Content = (
  content: 'category' | 'description' | 'location' | 'user',
  serviceCode: string,
  setServiceCode: any,
  control: any,
  errors: any,
  selectedPosition: Location.LocationObjectCoords | undefined,
  setSelectedPosition: any
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
  homeNumber: string;
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

export const SueReportScreen = ({ navigation }: { navigation: any }) => {
  const { data, loading } = useStaticContent({
    refreshTimeKey: 'publicJsonFile-sueReportProgress',
    name: 'sueReportProgress',
    type: 'json'
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [serviceCode, setServiceCode] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<Location.LocationObjectCoords>();
  const [isDone, setIsDone] = useState(false);

  const scrollViewRef = useRef(null);

  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      city: '',
      description: '',
      email: '',
      firstName: '',
      homeNumber: '',
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
    if (!sueReportData.termsOfService) {
      return Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.termsOfService);
    }

    if (
      !sueReportData.street ||
      !sueReportData.homeNumber ||
      !sueReportData.zipCode ||
      !sueReportData.city
    ) {
      return Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.address);
    }

    const addressString = `${sueReportData.street}; ${sueReportData.homeNumber}; ${sueReportData.zipCode}; ${sueReportData.city}`;

    const formData = {
      addressString,
      lat: selectedPosition?.latitude,
      long: selectedPosition?.longitude,
      serviceCode,
      ...sueReportData
    };

    setIsLoading(true);
    mutateAsync(formData)
      .then(() => setIsDone(true))
      .catch(() => {
        setIsLoading(false);

        return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
      })
      .finally(() => setIsLoading(false));
  };

  const handleNextPage = () => {
    if (currentPage < data.length - 1) {
      setCurrentPage(currentPage + 1);
      scrollViewRef?.current?.scrollTo({
        x: device.width * (currentPage + 1),
        y: 0,
        animated: true
      });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      scrollViewRef?.current?.scrollTo({
        x: device.width * (currentPage - 1),
        y: 0,
        animated: true
      });
    }
  };

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
      <SueReportProgress progress={data} currentProgress={currentPage + 1} />

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
                setSelectedPosition
              )}
            </ScrollView>
          ))}
        </ScrollView>
      </DefaultKeyboardAvoidingView>

      <WrapperHorizontal>
        <Divider />
      </WrapperHorizontal>

      <Wrapper style={[styles.buttonContainer, currentPage !== 0 && styles.buttonContainerRow]}>
        {currentPage !== 0 && (
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
          notFullWidth={currentPage !== 0}
          onPress={currentPage < data.length - 1 ? handleNextPage : handleSubmit(onSubmit)}
          title={
            currentPage === data.length - 1 ? texts.sue.report.sendReport : texts.sue.report.next
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
