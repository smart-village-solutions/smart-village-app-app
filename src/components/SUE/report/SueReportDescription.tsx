import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { consts, texts } from '../../../config';
import { Wrapper } from '../../Wrapper';
import { ImageSelector } from '../../consul';
import { Input } from '../../form';

const { IMAGE_SELECTOR_TYPES } = consts;

export const SueReportDescription = ({ control }: { control: any; errors: any }) => (
  <View style={styles.container}>
    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="title"
        label={`${texts.sue.reportScreen.title} *`}
        placeholder={texts.sue.reportScreen.title}
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="description"
        label={`${texts.sue.reportScreen.description} *`}
        placeholder={texts.sue.reportScreen.description}
        multiline
        control={control}
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
              item: {
                name: 'images',
                label: texts.volunteer.images,
                buttonTitle: texts.volunteer.addImage
              }
            }}
          />
        )}
        control={control}
      />
    </Wrapper>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
