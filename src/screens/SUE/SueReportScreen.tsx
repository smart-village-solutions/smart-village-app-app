/* eslint-disable complexity */
import * as Location from 'expo-location';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  LoadingContainer,
  SueReportDescription,
  SueReportLocation,
  SueReportProgress,
  SueReportServices,
  SueReportUser,
  Wrapper
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
    case 'category':
      return <SueReportServices serviceCode={serviceCode} setServiceCode={setServiceCode} />;
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

  const scrollViewRef = useRef(null);

  const {
    control,
    formState: { errors },
    handleSubmit
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
      return Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.termsOfService);
    }

    if (
      !sueReportData.street ||
      !sueReportData.homeNumber ||
      !sueReportData.zipCode ||
      !sueReportData.city
    ) {
      Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);

      setIsLoading(false);
      return;
    }

    const addressString = `${sueReportData.street}; ${sueReportData.homeNumber}; ${sueReportData.zipCode}; ${sueReportData.city}`;

    const formData = {
      addressString,
      lat: selectedPosition?.latitude,
      long: selectedPosition?.longitude,
      serviceCode,
      ...sueReportData
    };

    mutateAsync(formData)
      .then(() => {
        navigation.goBack();
        Alert.alert(
          texts.defectReport.successScreen.header,
          texts.defectReport.successScreen.entry
        );
      })
      .catch(() => {
        setIsLoading(false);

        Alert.alert(texts.defectReport.alerts.hint, texts.defectReport.alerts.error);
        return;
      });
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

  return (
    <>
      <SueReportProgress progress={data} currentProgress={currentPage + 1} />
      <ScrollView>
        <ScrollView
          horizontal
          pagingEnabled
          ref={scrollViewRef}
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          {data?.map((item: TProgress, index: number) => (
            <View key={index} style={styles.contentContainer}>
              {Content(
                item.content,
                serviceCode,
                setServiceCode,
                control,
                errors,
                selectedPosition,
                setSelectedPosition
              )}
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      <Wrapper>
        {currentPage !== 0 && (
          <Button onPress={handlePrevPage} title={texts.sue.reportScreen.back} invert />
        )}

        <Button
          disabled={isLoading}
          onPress={currentPage < data.length - 1 ? handleNextPage : handleSubmit(onSubmit)}
          title={
            currentPage === data.length - 1
              ? texts.sue.reportScreen.sendReport
              : texts.sue.reportScreen.next
          }
        />
      </Wrapper>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
    width: device.width
  }
});
