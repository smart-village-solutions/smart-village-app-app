import React, { useRef } from 'react';
import { Controller, UseFormSetValue } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { consts, normalize, texts } from '../../../config';
import { TValues } from '../../../screens';
import { Wrapper } from '../../Wrapper';
import { ImageSelector } from '../../consul';
import { Input } from '../../form';

const { IMAGE_SELECTOR_TYPES, IMAGE_SELECTOR_ERROR_TYPES } = consts;

export const SueReportDescription = ({
  areaServiceData,
  control,
  errorMessage,
  configuration,
  requiredInputs,
  setValue
}: {
  areaServiceData: { postalCodes: string[] } | undefined;
  control: any;
  errorMessage: string;
  configuration: any;
  requiredInputs: keyof TValues[];
  setValue: UseFormSetValue<TValues>;
}) => {
  const titleRef = useRef();
  const descriptionRef = useRef();

  return (
    <View style={styles.container}>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="title"
          label={`${texts.sue.report.title} ${requiredInputs?.includes('title') ? '*' : ''}`}
          placeholder={texts.sue.report.title}
          control={control}
          ref={titleRef}
          onSubmitEditing={() => descriptionRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="description"
          label={`${texts.sue.report.description} ${
            requiredInputs?.includes('description') ? '*' : ''
          }`}
          placeholder={texts.sue.report.description}
          multiline
          control={control}
          ref={descriptionRef}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name="images"
          render={({ field }) => (
            <ImageSelector
              {...{
                configuration,
                control,
                coordinateCheck: {
                  areaServiceData,
                  errorMessage,
                  setValue
                },
                field,
                isMultiImages: true,
                selectorType: IMAGE_SELECTOR_TYPES.SUE,
                errorType: IMAGE_SELECTOR_ERROR_TYPES.SUE,
                item: {
                  name: 'images',
                  infoText: texts.sue.report.imageHint(
                    configuration?.limitation?.maxFileUploads?.value
                  ),
                  buttonTitle: texts.sue.report.addImage
                }
              }}
            />
          )}
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
