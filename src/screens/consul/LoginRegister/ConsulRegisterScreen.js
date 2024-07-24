import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import {
  BoldText,
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  Wrapper,
  WrapperHorizontal
} from '../../../components';
import { colors, consts, Icon, namespace, secrets, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { CONSUL_REGISTER_USER } from '../../../queries/consul';
import { ScreenName } from '../../../types';

const { EMAIL_REGEX } = consts;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.registrationFailedTitle, texts.consul.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);

export const ConsulRegisterScreen = ({ navigation }) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isSecureTextEntryConfirmation, setIsSecureTextEntryConfirmation] = useState(true);
  const [hasAcceptedTermsOfService, setHasAcceptedTermsOfService] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      passwordConfirmation: ''
    }
  });
  const password = watch('password');

  const [userRegister, { loading: isLoading }] = useMutation(CONSUL_REGISTER_USER, {
    client: ConsulClient
  });

  const onSubmit = async (inputData) => {
    if (!hasAcceptedTermsOfService) return showPrivacyCheckedAlert();

    try {
      await userRegister({
        variables: {
          email: inputData?.email,
          username: inputData?.name,
          password: inputData?.password,
          passwordConfirmation: inputData?.passwordConfirmation,
          termsOfService: hasAcceptedTermsOfService
        }
      });

      navigation.navigate(ScreenName.ConsulRegisteredScreen);
    } catch (error) {
      console.error(error.message);
      showRegistrationFailAlert();
    }
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <SectionHeader title={texts.consul.registrationTitle} big center />
          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="name"
              label={texts.consul.name}
              placeholder={texts.consul.name}
              autoCapitalize="none"
              validate
              rules={{ required: texts.consul.usernameError }}
              errorMessage={errors.name && errors.name.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.consul.email}
              placeholder={texts.consul.email}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.consul.emailError,
                pattern: { value: EMAIL_REGEX, message: texts.consul.emailInvalid }
              }}
              errorMessage={errors.email && errors.email.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="password"
              label={texts.consul.password}
              placeholder={texts.consul.password}
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
                required: texts.consul.passwordError,
                minLength: { value: 8, message: texts.consul.passwordLengthError }
              }}
              errorMessage={errors.password && errors.password.message}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="passwordConfirmation"
              label={texts.consul.passwordConfirmation}
              placeholder={texts.consul.passwordConfirmation}
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
                required: texts.consul.passwordError,
                minLength: { value: 8, message: texts.consul.passwordLengthError },
                validate: (value) => value === password || texts.consul.passwordDoNotMatch
              }}
              errorMessage={errors.passwordConfirmation && errors.passwordConfirmation.message}
              control={control}
            />
          </Wrapper>

          <WrapperHorizontal>
            <Checkbox
              center={false}
              checked={hasAcceptedTermsOfService}
              checkedIcon={<Icon.SquareCheckFilled />}
              link={`${secrets[namespace]?.consul?.serverUrl}${secrets[namespace]?.consul?.termsOfService}`}
              linkDescription={texts.consul.privacyCheckLink}
              onPress={() => setHasAcceptedTermsOfService(!hasAcceptedTermsOfService)}
              title={texts.consul.privacyChecked}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          </WrapperHorizontal>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.consul.next}
              disabled={isLoading}
            />
            <Touchable onPress={() => navigation.goBack()}>
              <BoldText center primary underline>
                {texts.consul.abort.toUpperCase()}
              </BoldText>
            </Touchable>
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});

ConsulRegisterScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
