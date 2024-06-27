import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperVertical
} from '../../components';
import { Icon, colors, consts, normalize, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { profileRegister } from '../../queries/profile';
import { ProfileRegistration, ScreenName } from '../../types';

const { EMAIL_REGEX } = consts;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.profile.registrationFailedTitle, texts.profile.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.profile.privacyCheckRequireTitle, texts.profile.privacyCheckRequireBody);

const showTermsOfUseCheckedAlert = () =>
  Alert.alert(texts.profile.termsOfUseCheckRequireTitle, texts.profile.termsOfUseCheckRequireBody);

// eslint-disable-next-line complexity
export const ProfileRegistrationScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isSecureTextEntryConfirmation, setIsSecureTextEntryConfirmation] = useState(true);
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);
  const [hasAcceptedTermsOfUse, setHasAcceptedTermsOfUse] = useState(false);
  const dataPrivacyLink = route.params?.webUrl ?? '';
  const from = route.params?.from ?? '';

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm<ProfileRegistration>({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: '',
      dataPrivacyCheck: false
    }
  });
  const password = watch('password');

  const { mutate: mutateRegister, isLoading, reset } = useMutation(profileRegister);

  const onSubmit = (registerData: ProfileRegistration) => {
    if (!hasAcceptedDataPrivacy) return showPrivacyCheckedAlert();
    if (!hasAcceptedTermsOfUse) return showTermsOfUseCheckedAlert();

    mutateRegister(
      { ...registerData, dataPrivacyCheck: hasAcceptedDataPrivacy },
      {
        onSuccess: (responseData) => {
          if (!responseData?.success || responseData?.errorMessage) {
            showRegistrationFailAlert();
            reset();
            return;
          }

          navigation.navigate(ScreenName.ProfileSignup, {
            email: registerData.email,
            from,
            password: registerData.password,
            webUrl: dataPrivacyLink
          });
        }
      }
    );
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.registrationTitle} />
          </WrapperVertical>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.profile.email}
              placeholder={texts.profile.email}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.profile.emailError,
                pattern: { value: EMAIL_REGEX, message: texts.profile.emailInvalid }
              }}
              errorMessage={errors.email && errors.email.message}
              control={control}
              inputContainerStyle={styles.inputContainer}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="password"
              label={texts.profile.password}
              placeholder={texts.profile.password}
              textContentType="password"
              autoCompleteType="password"
              secureTextEntry={isSecureTextEntry}
              rightIcon={
                <InputSecureTextIcon
                  isSecureTextEntry={isSecureTextEntry}
                  setIsSecureTextEntry={setIsSecureTextEntry}
                />
              }
              validate
              rules={{
                required: texts.profile.passwordError,
                minLength: { value: 8, message: texts.profile.passwordLengthError }
              }}
              errorMessage={errors.password && errors.password.message}
              control={control}
              inputStyle={isSecureTextEntry && styles.passwordInput}
              inputContainerStyle={styles.inputContainer}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="passwordConfirmation"
              label={texts.profile.passwordConfirmation}
              placeholder={texts.profile.passwordConfirmation}
              textContentType="password"
              autoCompleteType="password"
              secureTextEntry={isSecureTextEntryConfirmation}
              rightIcon={
                <InputSecureTextIcon
                  isSecureTextEntry={isSecureTextEntryConfirmation}
                  setIsSecureTextEntry={setIsSecureTextEntryConfirmation}
                />
              }
              validate
              rules={{
                required: texts.profile.passwordError,
                minLength: { value: 5, message: texts.profile.passwordLengthError },
                validate: (value: string) => value === password || texts.profile.passwordDoNotMatch
              }}
              errorMessage={errors.passwordConfirmation && errors.passwordConfirmation.message}
              control={control}
              inputStyle={isSecureTextEntryConfirmation && styles.passwordInput}
              inputContainerStyle={styles.inputContainer}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Checkbox
              boldTitle={false}
              center={false}
              checked={hasAcceptedDataPrivacy}
              checkedIcon={<Icon.SquareCheckFilled />}
              navigate={() =>
                navigation.navigate(ScreenName.Html, {
                  title: texts.profile.privacyCheckLink,
                  query: QUERY_TYPES.PUBLIC_HTML_FILE,
                  queryVariables: { name: 'datenschutzProfile' }
                })
              }
              linkDescription={texts.profile.privacyCheckLink}
              onPress={() => setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy)}
              title={texts.profile.privacyChecked}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Checkbox
              boldTitle={false}
              center={false}
              checked={hasAcceptedTermsOfUse}
              checkedIcon={<Icon.SquareCheckFilled />}
              navigate={() =>
                navigation.navigate(ScreenName.Html, {
                  title: texts.profile.termsOfUseLink,
                  query: QUERY_TYPES.PUBLIC_HTML_FILE,
                  queryVariables: { name: 'nutzungsbedingungenProfile' }
                })
              }
              linkDescription={texts.profile.termsOfUseLink}
              onPress={() => setHasAcceptedTermsOfUse(!hasAcceptedTermsOfUse)}
              title={texts.profile.termsOfUseChecked}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.register}
              disabled={isLoading}
            />

            <RegularText />

            <RegularText primary center>
              {texts.profile.alreadyRegistered}
              <RegularText
                primary
                underline
                onPress={() =>
                  navigation.navigate(ScreenName.ProfileLogin, { webUrl: dataPrivacyLink })
                }
              >
                {texts.profile.login}
              </RegularText>
            </RegularText>
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  },
  noPaddingTop: {
    paddingTop: 0
  },
  passwordInput: {
    lineHeight: normalize(17)
  },
  inputContainer: {
    height: normalize(45)
  }
});
