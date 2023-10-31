import React from 'react';
import { StyleSheet, View } from 'react-native';

import { texts } from '../../../config';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';

export const SueReportLocation = ({ control }: { control: any; errors: any }) => (
  <View style={styles.container}>
    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="street"
        label={`${texts.sue.reportScreen.street}`}
        placeholder={texts.sue.reportScreen.street}
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="homeNumber"
        label={`${texts.sue.reportScreen.homeNumber}`}
        placeholder={texts.sue.reportScreen.homeNumber}
        keyboardType="numeric"
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="zipCode"
        label={`${texts.sue.reportScreen.zipCode}`}
        placeholder={texts.sue.reportScreen.zipCode}
        keyboardType="numeric"
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="city"
        label={`${texts.sue.reportScreen.city}`}
        placeholder={texts.sue.reportScreen.city}
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
