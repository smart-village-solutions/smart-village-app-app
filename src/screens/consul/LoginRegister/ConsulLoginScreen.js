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
import { usePullToRefetch } from '../../../hooks';
import { CONSUL_LOGIN_USER } from '../../../queries/consul';
import { ScreenName } from '../../../types';

const { a11yLabel } = consts;
const namespace = appJson.expo.slug;
const serverUrl = secrets[namespace]?.consul?.serverUrl;
const passwordForgotten = secrets[namespace]?.consul?.passwordForgotten;

const showLoginFailAlert = () =>
  Alert.alert(texts.consul.loginFailedTitle, texts.consul.loginFailedBody);

export const ConsulLoginScreen = ({ navigation }) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const [userLogin] = useMutation(CONSUL_LOGIN_USER, {
    client: ConsulClient
  });

  const onSubmit = async (inputData) => {
    setIsLoading(true);
    try {
      let userData = await userLogin({
        variables: { email: inputData.email, password: inputData.password }
      });
      await setConsulAuthToken(userData.data.userLogin?.credentials);
      await setConsulUser(userData.data.userLogin?.authenticatable);

      navigation?.navigate(ScreenName.ConsulHomeScreen, {
        refreshUser: new Date().valueOf()
      });

      setIsLoading(false);
    } catch (error) {
      console.error(error.message);
      setIsLoading(false);
      showLoginFailAlert();
    }
  };

  const RefreshControl = usePullToRefetch();

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled" refreshControl={RefreshControl}>
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
                validate
                rules={{ required: true }}
                errorMessage={errors.email && `${texts.consul.usernameOrEmailError}`}
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
                rightIcon={rightIcon(isSecureTextEntry, setIsSecureTextEntry)}
                validate
                rules={{
                  required: true,
                  minLength: { value: 8, message: texts.consul.passwordLengthError }
                }}
                errorMessage={errors.password && `${texts.consul.passwordError}`}
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
                disabled={isLoading}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {texts.consul.abort.toUpperCase()}
                </BoldText>
              </Touchable>
            </Wrapper>
          </WrapperWithOrientation>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const rightIcon = (isSecureTextEntry, setIsSecureTextEntry) => {
  return (
    <TouchableOpacity onPress={() => setIsSecureTextEntry(!isSecureTextEntry)}>
      {isSecureTextEntry ? (
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
  navigation: PropTypes.object.isRequired
};
