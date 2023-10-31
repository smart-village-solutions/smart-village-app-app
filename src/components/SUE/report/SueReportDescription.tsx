import React from 'react';
import { StyleSheet, View } from 'react-native';

import { texts } from '../../../config';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';

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
