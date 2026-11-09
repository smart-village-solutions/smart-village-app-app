import * as Location from 'expo-location';
import React, { memo, useMemo, useRef } from 'react';
import { Controller, useWatch, UseFormSetValue } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { consts, normalize, texts } from '../../../config';
import { getSueReportTextLimits } from '../../../helpers/sueHelper';
import { TValues } from '../../../screens';
import { RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';
import { MultiImageSelector } from '../../selectors';

const { a11yLabel, IMAGE_SELECTOR_TYPES, IMAGE_SELECTOR_ERROR_TYPES, INPUT_KEYS } = consts;

const MemoizedImageSelector = memo((props) => <MultiImageSelector {...props} />);

export const SueReportDescription = ({
  areaServiceData,
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
  configuration: any;
  control: any;
  errorMessage: string;
  requiredInputs?: keyof TValues[];
  selectedPosition?: Location.LocationObjectCoords;
  storeReportValues: () => Promise<void>;
  setSelectedPosition: (position?: Location.LocationObjectCoords) => void;
  setShowCoordinatesFromImageAlert: (value: boolean) => void;
  setUpdateRegionFromImage: (value: boolean) => void;
  setValue: UseFormSetValue<TValues>;
}) => {
  const titleRef = useRef();
  const descriptionRef = useRef();
  const limits = getSueReportTextLimits(configuration?.limitation);
  const [title, description] = useWatch({
    control,
    name: [INPUT_KEYS.SUE.TITLE, INPUT_KEYS.SUE.DESCRIPTION]
  });
  const titleLength = title?.length ?? 0;
  const descriptionLength = description?.length ?? 0;
  const titleTooLong = limits.title !== undefined && titleLength > limits.title;
  const descriptionTooLong =
    limits.description !== undefined && descriptionLength > limits.description;

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
        errorMessage,
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
          errorMessage={titleTooLong ? texts.sue.report.characterLimitExceeded : undefined}
          renderErrorMessage={limits.title === undefined}
          ref={titleRef}
          onSubmitEditing={() => descriptionRef.current?.focus()}
        />
        {limits.title !== undefined && (
          <RegularText small style={styles.characterCount} error={titleTooLong}>
            {texts.sue.report.characterCount(titleLength, limits.title)}
          </RegularText>
        )}
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
          errorMessage={descriptionTooLong ? texts.sue.report.characterLimitExceeded : undefined}
          renderErrorMessage={limits.description === undefined}
          ref={descriptionRef}
        />
        {limits.description !== undefined && (
          <RegularText small style={styles.characterCount} error={descriptionTooLong}>
            {texts.sue.report.characterCount(descriptionLength, limits.description)}
          </RegularText>
        )}
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
  characterCount: {
    marginTop: normalize(2)
  },
  container: {
    paddingTop: normalize(16),
    width: '100%'
  }
});
