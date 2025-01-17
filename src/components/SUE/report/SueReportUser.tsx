import React, { useContext, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { ConfigurationsContext } from '../../../ConfigurationsProvider';
import { colors, consts, normalize, texts } from '../../../config';
import { useOpenWebScreen } from '../../../hooks';
import { TValues } from '../../../screens';
import { Checkbox } from '../../Checkbox';
import { RegularText } from '../../Text';
import { Wrapper, WrapperHorizontal } from '../../Wrapper';
import { Input } from '../../form';

const { a11yLabel, EMAIL_REGEX, PHONE_NUMBER_REGEX, INPUT_KEYS } = consts;

/* eslint-disable complexity */
export const SueReportUser = ({
  configuration,
  control,
  errors,
  requiredInputs
}: {
  configuration: any;
  control: any;
  errors: any;
  requiredInputs: keyof TValues[];
}) => {
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();

  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const { sueReportScreen = {} } = sueConfig;
  const { reportTerms = {} } = sueReportScreen;
  const { termsOfService = {}, termsOfUse = {} } = reportTerms;
  const { link: linkTermsOfService, injectedJavaScript: injectedJavaScriptTermsOfService } =
    termsOfService;
  const { link: linkTermsOfUse, injectedJavaScript: injectedJavaScriptTermsOfUse } = termsOfUse;

  const openWebScreenTermsOfService = useOpenWebScreen(
    `${texts.sue.report.termsInputCheckbox} *`,
    configuration?.limitation?.privacyPolicy?.value || linkTermsOfService,
    '',
    undefined,
    injectedJavaScriptTermsOfService
  );

  const openWebScreenTermsOfUse = useOpenWebScreen(
    `${texts.sue.report.termsInputCheckbox} *`,
    linkTermsOfUse,
    '',
    undefined,
    injectedJavaScriptTermsOfUse
  );

  return (
    <View style={styles.container}>
      <Wrapper style={styles.noPaddingTop}>
        <Input
          accessibilityLabel={`${texts.sue.report.firstName} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.FIRST_NAME) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.FIRST_NAME}
          label={`${texts.sue.report.firstName} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.FIRST_NAME) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.firstName}
          textContentType="givenName"
          control={control}
          ref={firstNameRef}
          onSubmitEditing={() => lastNameRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          accessibilityLabel={`${texts.sue.report.lastName} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.LAST_NAME) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.LAST_NAME}
          label={`${texts.sue.report.lastName} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.LAST_NAME) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.lastName}
          textContentType="familyName"
          control={control}
          ref={lastNameRef}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          accessibilityLabel={`${texts.sue.report.email} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.EMAIL) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.EMAIL}
          label={`${texts.sue.report.email} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.EMAIL) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.email}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          control={control}
          ref={emailRef}
          rules={{
            required: false,
            pattern: {
              value: EMAIL_REGEX,
              message: texts.sue.report.alerts.invalidMail
            }
          }}
          errorMessage={errors.email && errors.email.message}
          onSubmitEditing={() => phoneRef.current?.focus()}
        />

        <RegularText small>{texts.sue.report.emailHint}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          accessibilityLabel={`${texts.sue.report.phone} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.PHONE) ? a11yLabel.required : ''
          }`}
          name={INPUT_KEYS.SUE.PHONE}
          label={`${texts.sue.report.phone} ${
            requiredInputs?.includes(INPUT_KEYS.SUE.PHONE) ? ' *' : ''
          }`}
          placeholder={texts.sue.report.phone}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          control={control}
          ref={phoneRef}
          rules={{
            required: false,
            pattern: {
              value: PHONE_NUMBER_REGEX,
              message: texts.sue.report.alerts.invalidPhone
            }
          }}
          errorMessage={errors.phone && errors.phone.message}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Controller
          name={INPUT_KEYS.SUE.TERMS_OF_SERVICE}
          render={({ field: { onChange, value } }) => (
            <>
              <Checkbox
                checked={!!value}
                onPress={() => onChange(!value)}
                title={`${texts.sue.report.termsInputCheckbox}`}
                checkedColor={colors.accent}
                checkedIcon="check-square-o"
                uncheckedColor={colors.darkText}
                uncheckedIcon="square-o"
                containerStyle={styles.checkboxContainerStyle}
              />
              <WrapperHorizontal>
                <WrapperHorizontal>
                  <WrapperHorizontal>
                    <RegularText underline primary onPress={openWebScreenTermsOfService}>
                      - {texts.sue.report.termsOfService} *
                    </RegularText>
                    {!!linkTermsOfUse && (
                      <RegularText underline primary onPress={openWebScreenTermsOfUse}>
                        - {texts.sue.report.termsOfUse} *
                      </RegularText>
                    )}
                  </WrapperHorizontal>
                </WrapperHorizontal>
              </WrapperHorizontal>
            </>
          )}
          control={control}
        />
      </Wrapper>
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  checkboxContainerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  container: {
    paddingTop: normalize(14),
    width: '100%'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
