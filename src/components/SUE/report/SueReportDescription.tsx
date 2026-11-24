import React, { memo, useMemo, useRef } from 'react';
import { Controller, UseFormSetValue } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { consts, normalize, texts } from '../../../config';
import { SueCoordinates, SueLocationRequest } from '../../../hooks/useSueReportLocation';
import { TValues } from '../../../screens';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

const { a11yLabel, IMAGE_SELECTOR_TYPES, IMAGE_SELECTOR_ERROR_TYPES, INPUT_KEYS } = consts;

const MemoizedImageSelector = memo((props) => <MultiImageSelector {...props} />);

export const SueReportDescription = ({
  areaServiceData,
  beginLocationUpdate,
  configuration,
  control,
  errorMessage,
  requiredInputs,
  selectedPosition,
  storeReportValues,
  setSelectedPosition,
  setShowCoordinatesFromImageAlert,
  setUpdateRegionFromImage,
  setValue
}: {
  areaServiceData?: { postalCodes?: string[] };
  beginLocationUpdate: () => SueLocationRequest;
  configuration: any;
  control: any;
  errorMessage: string;
  requiredInputs?: (keyof TValues)[];
  selectedPosition?: SueCoordinates;
  storeReportValues: () => Promise<void>;
  setSelectedPosition: (position?: SueCoordinates) => void;
  setShowCoordinatesFromImageAlert: (value: boolean) => void;
  setUpdateRegionFromImage: (value: boolean) => void;
  setValue: UseFormSetValue<TValues>;
}) => {
  const titleRef = useRef();
  const descriptionRef = useRef();

  const imageSelectorProps = useMemo(
    () => ({
      configuration: {
        ...configuration,
        limitation: {
          ...configuration.limitation,
          maxCount: configuration?.limitation?.maxFileUploads?.value
        }
      },
      control,
      coordinateCheck: {
        areaServiceData,
        beginLocationUpdate,
        errorMessage,
        requirements: configuration.geoMap,
        selectedPosition,
        setSelectedPosition,
        setShowCoordinatesFromImageAlert,
        setUpdateRegionFromImage,
        setValue
      },
      onBeforeNativeImagePicker: storeReportValues,
      isMultiImages: true,
      selectorType: IMAGE_SELECTOR_TYPES.SUE,
      errorType: IMAGE_SELECTOR_ERROR_TYPES.SUE,
      item: {
        name: INPUT_KEYS.SUE.IMAGES,
        infoText: texts.sue.report.imageHint(configuration?.limitation?.maxFileUploads?.value),
        buttonTitle: texts.sue.report.addImage
      }
    }),
    [
      configuration,
      control,
      areaServiceData,
      beginLocationUpdate,
      errorMessage,
      selectedPosition,
      storeReportValues,
      setSelectedPosition,
      setShowCoordinatesFromImageAlert,
      setUpdateRegionFromImage,
      setValue
    ]
  );

  return (
    <View style={styles.container}>
      <Wrapper noPaddingTop>
        <Input
          accessibilityLabel={`${texts.sue.report.title} ${a11yLabel.required}`}
          name={INPUT_KEYS.SUE.TITLE}
          label={texts.sue.report.title + ' *'}
          placeholder={texts.sue.report.titlePlaceholder}
          control={control}
          ref={titleRef}
          onSubmitEditing={() => descriptionRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Input
          accessibilityLabel={`${texts.sue.report.description} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.DESCRIPTION) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.DESCRIPTION}
          label={`${texts.sue.report.description} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.DESCRIPTION) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.descriptionPlaceholder}
          multiline
          control={control}
          ref={descriptionRef}
        />
      </Wrapper>

      <Wrapper noPaddingTop>
        <Controller
          name={INPUT_KEYS.SUE.IMAGES}
          render={({ field }) => <MemoizedImageSelector {...imageSelectorProps} field={field} />}
          control={control}
        />
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: normalize(16),
    width: '100%'
  }
});
