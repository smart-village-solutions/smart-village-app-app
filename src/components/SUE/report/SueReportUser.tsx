import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { colors, texts } from '../../../config';
import { Checkbox } from '../../Checkbox';
import { Wrapper } from '../../Wrapper';
import { Input } from '../../form';

export const SueReportUser = ({ control }: { control: any; errors: any }) => (
  <View style={styles.container}>
    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="firstName"
        label={`${texts.sue.reportScreen.firstName}`}
        placeholder={texts.sue.reportScreen.firstName}
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="lastName"
        label={`${texts.sue.reportScreen.lastName}`}
        placeholder={texts.sue.reportScreen.lastName}
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="email"
        label={`${texts.sue.reportScreen.email}`}
        placeholder={texts.sue.reportScreen.email}
        keyboardType="email-address"
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Input
        name="phone"
        label={`${texts.sue.reportScreen.phone}`}
        placeholder={texts.sue.reportScreen.phone}
        keyboardType="phone-pad"
        control={control}
      />
    </Wrapper>

    <Wrapper style={styles.noPaddingTop}>
      <Controller
        name="termsOfService"
        render={({ field: { onChange, value } }) => (
          <Checkbox
            checked={!!value}
            onPress={() => onChange(!value)}
            title={`${texts.defectReport.inputCheckbox} *`}
            checkedColor={colors.accent}
            checkedIcon="check-square-o"
            uncheckedColor={colors.darkText}
            uncheckedIcon="square-o"
            containerStyle={styles.checkboxContainerStyle}
            textStyle={styles.checkboxTextStyle}
          />
        )}
        control={control}
      />
    </Wrapper>
  </View>
);

const styles = StyleSheet.create({
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  checkboxTextStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  },
  container: {
    width: '100%'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
