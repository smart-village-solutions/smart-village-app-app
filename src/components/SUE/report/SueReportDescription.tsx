import * as Location from 'expo-location';
import React, { useCallback, useMemo, useRef } from 'react';
import { Controller, UseFormSetValue } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { consts, normalize, texts } from '../../../config';
import { TValues } from '../../../screens';
import { Wrapper } from '../../Wrapper';
import { ImageSelector } from '../../consul';
import { Input } from '../../form';

const { IMAGE_SELECTOR_TYPES, IMAGE_SELECTOR_ERROR_TYPES, INPUT_KEYS } = consts;

const MemoizedImageSelector = React.memo((props) => <ImageSelector {...props} />);

export const SueReportDescription = ({
  areaServiceData,
  configuration,
  control,
  errorMessage,
  requiredInputs,
  selectedPosition,
  setSelectedPosition,
  setShowCoordinatesFromImageAlert,
  setUpdateRegionFromImage,
  setValue
}: {
  areaServiceData?: { postalCodes?: string[] };
  configuration: any;
  control: any;
  errorMessage: string;
  requiredInputs: keyof TValues[];
  selectedPosition?: Location.LocationObjectCoords;
  setSelectedPosition: (position?: Location.LocationObjectCoords) => void;
  setShowCoordinatesFromImageAlert: (value: boolean) => void;
  setUpdateRegionFromImage: (value: boolean) => void;
  setValue: UseFormSetValue<TValues>;
}) => {
  const titleRef = useRef();
  const descriptionRef = useRef();

  const imageSelectorProps = useMemo(
    () => ({
      configuration,
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
      setSelectedPosition,
      setShowCoordinatesFromImageAlert,
      setUpdateRegionFromImage,
      setValue
    ]
  );

  return (
    <View style={styles.container}>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name={INPUT_KEYS.SUE.TITLE}
          label={texts.sue.report.title + ' *'}
          placeholder={texts.sue.report.title}
          control={control}
          ref={titleRef}
          onSubmitEditing={() => descriptionRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name={INPUT_KEYS.SUE.DESCRIPTION}
          label={`${texts.sue.report.description} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.DESCRIPTION) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.description}
          multiline
          control={control}
          ref={descriptionRef}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
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
    paddingTop: normalize(14),
    width: '100%'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
