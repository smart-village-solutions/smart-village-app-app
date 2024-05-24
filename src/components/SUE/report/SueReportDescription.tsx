import React, { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { consts, normalize, texts } from '../../../config';
import { TService } from '../../../screens';
import { BoldText, RegularText } from '../../Text';
import { Wrapper } from '../../Wrapper';
import { ImageSelector } from '../../consul';
import { Input } from '../../form';

const { IMAGE_SELECTOR_TYPES, IMAGE_SELECTOR_ERROR_TYPES } = consts;

export const SueReportDescription = ({
  control,
  requiredInputs,
  service
}: {
  control: any;
  requiredInputs: string[];
  service: TService;
}) => {
  const titleRef = useRef();
  const descriptionRef = useRef();

  return (
    <View style={styles.container}>
      {!!service?.description && (
        <Wrapper style={styles.noPaddingTop}>
          <BoldText>{service.serviceName}</BoldText>

          {!!service.description && <RegularText smallest>{service.description}</RegularText>}
        </Wrapper>
      )}

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
                control,
                field,
                isMultiImages: true,
                selectorType: IMAGE_SELECTOR_TYPES.SUE,
                errorType: IMAGE_SELECTOR_ERROR_TYPES.SUE,
                item: {
                  name: 'images',
                  infoText: texts.sue.report.imageHint,
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
