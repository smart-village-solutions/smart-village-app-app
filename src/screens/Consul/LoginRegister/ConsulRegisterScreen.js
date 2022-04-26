import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import {
  BoldText,
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperHorizontal,
  WrapperWithOrientation
} from '../../../components';
import { colors, consts, Icon, normalize, texts, secrets, namespace } from '../../../config';
import { ScreenName } from '../../../types';
import { CONSUL_REGISTER_USER } from '../../../queries/Consul';
import { ConsulClient } from '../../../ConsulClient';

const { a11yLabel } = consts;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.consul.registrationFailedTitle, texts.consul.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.consul.privacyCheckRequireTitle, texts.consul.privacyCheckRequireBody);

export const ConsulRegisterScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [termsOfService, settermsOfService] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const { control, handleSubmit, watch } = useForm();
  const pwd = watch('password');

  const [userRegister] = useMutation(CONSUL_REGISTER_USER, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    if (!termsOfService) return showPrivacyCheckedAlert();

    setRegistrationLoading(true);
    await userRegister({
      variables: {
        email: val.email,
        username: val.name,
        password: val.password,
        passwordConfirmation: val['password-repeat'],
        termsOfService
      }
    })
      .then(() => {
        setRegistrationLoading(false);
        navigation.navigate(ScreenName.ConsulRegisteredScreen);
      })
      .catch((err) => {
        console.error(err.message);
        setRegistrationLoading(false);
        showRegistrationFailAlert();
      });
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <TitleContainer>
              <Title
                big
                center
                accessibilityLabel={`${texts.consul.registrationTitle} ${a11yLabel.heading}`}
              >
                {texts.consul.registrationTitle}
              </Title>
            </TitleContainer>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="name"
                label={texts.consul.name}
                placeholder={texts.consul.name}
                autoCapitalize="none"
                rules={{ required: texts.consul.usernameError }}
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
                rules={{
                  required: texts.consul.emailError,
                  pattern: { value: EMAIL_REGEX, message: texts.consul.emailInvalid }
                }}
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
                secureTextEntry={secureTextEntry}
                rightIcon={rightIcon(secureTextEntry, setSecureTextEntry)}
                rules={{
                  required: texts.consul.passwordError,
                  minLength: { value: 8, message: texts.consul.passwordLengthError }
                }}
                control={control}
              />
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="password-repeat"
                label={texts.consul.passwordConfirmation}
                placeholder={texts.consul.passwordConfirmation}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={secureTextEntry}
                rightIcon={rightIcon(secureTextEntry, setSecureTextEntry)}
                rules={{
                  required: texts.consul.passwordError,
                  minLength: { value: 8, message: texts.consul.passwordLengthError },
                  validate: (value) => value === pwd || texts.consul.passwordDoNotMatch
                }}
                control={control}
              />
            </Wrapper>

            <WrapperHorizontal>
              <Checkbox
                linkDescription={texts.consul.privacyCheckLink}
                link={`${secrets[namespace]?.consul.serverUrl}${secrets[namespace]?.consul.termsOfService}`}
                title={texts.consul.privacyChecked}
                checkedIcon="check-square-o"
                uncheckedIcon="square-o"
                checked={termsOfService}
                onPress={() => settermsOfService(!termsOfService)}
              />
            </WrapperHorizontal>

            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={texts.consul.next}
                disabled={registrationLoading}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {texts.consul.abort.toUpperCase()}
                </BoldText>
              </Touchable>
            </Wrapper>
          </WrapperWithOrientation>

          <LoadingModal loading={registrationLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const rightIcon = (secureTextEntry, setSecureTextEntry) => {
  return (
    <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
      {secureTextEntry ? (
        <Icon.Visible color={colors.darkText} size={normalize(20)} />
      ) : (
        <Icon.Unvisible color={colors.darkText} size={normalize(20)} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});

ConsulRegisterScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired
};
