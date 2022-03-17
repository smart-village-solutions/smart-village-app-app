import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-apollo';

import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  LoadingModal,
  RegularText,
  Input,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../../components';
import { colors, consts, Icon, normalize, texts } from '../../../config';
import { CONSUL_LOGIN_USER, CONSUL_USER_SEND_PASSWORD_RESET } from '../../../queries/Consul';
import { ConsulClient } from '../../../ConsulClient';

const { a11yLabel } = consts;
const text = texts.consul;

// Alert

const showLoginFailAlert = () => Alert.alert(text.loginFailedTitle, text.loginFailedBody);
const showResetPasswordFailAlert = () =>
  Alert.alert(text.resetPasswordFailedTitle, text.resetPasswordFailedBody);
const showResetPasswordSuccessAlert = () =>
  Alert.alert(text.resetPasswordSuccessTitle, text.resetPasswordSuccessBody);
const showResetPasswordEmptyMailAlert = () =>
  Alert.alert(text.resetPasswordFailedTitle, text.resetPasswordEmptyEmailBody);

export const ConsulLoginScreen = ({ navigation }) => {
  // useState
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // React Hook Form
  const { control, handleSubmit } = useForm();

  // GraphQL
  const [userLogin] = useMutation(CONSUL_LOGIN_USER, {
    client: ConsulClient
  });
  const [userSendPasswordReset] = useMutation(CONSUL_USER_SEND_PASSWORD_RESET, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    setRegistrationLoading(true);
    await userLogin({ variables: { email: val.email, password: val.password } })
      .then(() => {
        setRegistrationLoading(false);
        Alert.alert('Success', 'Success');
      })
      .catch((err) => {
        console.error(err.message);
        setRegistrationLoading(false);
        showLoginFailAlert();
      });
  };

  const sendPasswordReset = async (val) => {
    if (!val) {
      return showResetPasswordEmptyMailAlert();
    }

    await userSendPasswordReset({ variables: { email: val, redirectUrl: 'null' } })
      .then(() => showResetPasswordSuccessAlert())
      .catch(() => showResetPasswordFailAlert());
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <TitleContainer>
              <Title big center accessibilityLabel={`${text.loginTitle} ${a11yLabel.heading}`}>
                {text.loginTitle}
              </Title>
            </TitleContainer>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="email"
                label={text.usernameOrEmail}
                placeholder={text.usernameOrEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                rules={{ required: text.emailError }}
                control={control}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="password"
                label={text.password}
                placeholder={text.password}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={secureTextEntry}
                rightIcon={rightIcon(secureTextEntry, setSecureTextEntry)}
                rules={{
                  required: text.passwordError,
                  minLength: { value: 8, message: text.passwordLengthError }
                }}
                control={control}
              />
            </Wrapper>
            <Wrapper>
              <Touchable
                onPress={() => sendPasswordReset(control._fields.email._f.value)}
                accessibilityLabel={`${a11yLabel.privacy} ${a11yLabel.button}`}
              >
                <RegularText small underline>
                  {text.passwordForgotten}
                </RegularText>
              </Touchable>
            </Wrapper>
            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={text.login}
                disabled={registrationLoading}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {text.abort.toUpperCase()}
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

ConsulLoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired
};
