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
import { setConsulAuthToken, setConsulUser } from '../../../helpers';
import { ScreenName } from '../../../types';

const { a11yLabel } = consts;

const showLoginFailAlert = () =>
  Alert.alert(texts.consul.loginFailedTitle, texts.consul.loginFailedBody);
const showResetPasswordFailAlert = () =>
  Alert.alert(texts.consul.resetPasswordFailedTitle, texts.consul.resetPasswordFailedBody);
const showResetPasswordSuccessAlert = () =>
  Alert.alert(texts.consul.resetPasswordSuccessTitle, texts.consul.resetPasswordSuccessBody);
const showResetPasswordEmptyMailAlert = () =>
  Alert.alert(texts.consul.resetPasswordFailedTitle, texts.consul.resetPasswordEmptyEmailBody);

export const ConsulLoginScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const { control, handleSubmit } = useForm();

  const [userLogin] = useMutation(CONSUL_LOGIN_USER, {
    client: ConsulClient
  });
  const [userSendPasswordReset] = useMutation(CONSUL_USER_SEND_PASSWORD_RESET, {
    client: ConsulClient
  });

  const onSubmit = async (val) => {
    setRegistrationLoading(true);
    await userLogin({ variables: { email: val.email, password: val.password } })
      .then(async (val) => {
        await setConsulAuthToken(val.data.userLogin?.credentials);
        await setConsulUser(val.data.userLogin?.authenticatable);

        navigation?.navigate(ScreenName.ConsulHomeScreen, {
          refreshUser: new Date().valueOf()
        });

        setRegistrationLoading(false);
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
              <Title
                big
                center
                accessibilityLabel={`${texts.consul.loginTitle} ${a11yLabel.heading}`}
              >
                {texts.consul.loginTitle}
              </Title>
            </TitleContainer>

            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="email"
                label={texts.consul.usernameOrEmail}
                placeholder={texts.consul.usernameOrEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                rules={{ required: texts.consul.emailError }}
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

            <Wrapper>
              <Touchable
                onPress={() => sendPasswordReset(control._fields.email._f.value)}
                accessibilityLabel={`${a11yLabel.privacy} ${a11yLabel.button}`}
              >
                <RegularText small underline>
                  {texts.consul.passwordForgotten}
                </RegularText>
              </Touchable>
            </Wrapper>

            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={texts.consul.login}
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

ConsulLoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func
  }).isRequired
};
