import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import * as appJson from '../../../../app.json';
import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../../components';
import { colors, consts, Icon, normalize, secrets, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { setConsulAuthToken, setConsulUser } from '../../../helpers';
import { CONSUL_LOGIN_USER } from '../../../queries/Consul';
import { ScreenName } from '../../../types';

const { a11yLabel } = consts;
const namespace = appJson.expo.slug;
const serverUrl = secrets[namespace]?.consul?.serverUrl;
const passwordForgotten = secrets[namespace]?.consul?.passwordForgotten;

const showLoginFailAlert = () =>
  Alert.alert(texts.consul.loginFailedTitle, texts.consul.loginFailedBody);

export const ConsulLoginScreen = ({ navigation }) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const { control, handleSubmit } = useForm();

  const [userLogin] = useMutation(CONSUL_LOGIN_USER, {
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
                accessibilityLabel={`${texts.consul.passwordForgotten} ${a11yLabel.button}`}
                onPress={() =>
                  navigation.navigate(ScreenName.Web, {
                    title: texts.consul.passwordForgotten,
                    webUrl: `${serverUrl}${passwordForgotten}`
                  })
                }
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
