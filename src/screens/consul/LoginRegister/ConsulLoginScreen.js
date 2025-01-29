import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView } from 'react-native';

import * as appJson from '../../../../app.json';
import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  Wrapper
} from '../../../components';
import { consts, secrets, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { setConsulAuthToken, setConsulUser } from '../../../helpers';
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

  const [userLogin, { loading: isLoading }] = useMutation(CONSUL_LOGIN_USER, {
    client: ConsulClient
  });

  const onSubmit = async (inputData) => {
    try {
      const userData = await userLogin({
        variables: { email: inputData?.email, password: inputData?.password }
      });
      await setConsulAuthToken(userData?.data?.userLogin?.credentials);
      await setConsulUser(userData?.data?.userLogin?.authenticatable?.id);

      navigation.navigate(ScreenName.ConsulHomeScreen, { refreshUser: new Date().valueOf() });
    } catch (error) {
      console.error(error.message);
      showLoginFailAlert();
    }
  };

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <SectionHeader title={texts.consul.loginTitle} big center />
          <Wrapper noPaddingTop>
            <Input
              name="email"
              label={texts.consul.usernameOrEmail}
              placeholder={texts.consul.usernameOrEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{ required: texts.consul.usernameOrEmailError }}
              errorMessage={errors.email && errors.email.message}
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
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

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

ConsulLoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
