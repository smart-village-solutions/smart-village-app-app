import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useMutation } from 'react-query';

import * as appJson from '../../../app.json';
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
} from '../../components';
import { colors, consts, Icon, normalize, secrets, texts } from '../../config';
import { storeVolunteerAuthToken } from '../../helpers';
import { logInMutation } from '../../queries/volunteer';
import { ScreenName } from '../../types';

const { a11yLabel } = consts;
const namespace = appJson.expo.slug as keyof typeof secrets;
const passwordForgottenUrl = secrets[namespace]?.volunteer?.passwordForgottenUrl;

const showInvalidLoginAlert = () =>
  Alert.alert('Fehler beim Login', 'Bitte Eingaben überprüfen und erneut versuchen.');

export const VolunteerLoginScreen = ({ navigation }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { mutate: mutateLogIn, isLoading, isError, isSuccess, data, error, reset } = useMutation(
    logInMutation
  );
  const onSubmit = (loginData: { username: string; password: string }) => mutateLogIn(loginData);

  if (isError || (!isLoading && data && data.code !== 200)) {
    showInvalidLoginAlert();
    reset();
  } else if (isSuccess) {
    // save to global state if there are no errors
    storeVolunteerAuthToken(data.auth_token);

    // refreshUser param causes the home screen to update and no longer show the welcome component
    navigation.navigate(ScreenName.VolunteerHome, { refreshUser: new Date().valueOf() });
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <TitleContainer>
              <Title
                big
                center
                accessibilityLabel={`${texts.volunteer.loginTitle} ${a11yLabel.heading}`}
              >
                {texts.volunteer.loginTitle}
              </Title>
            </TitleContainer>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="username"
                label={texts.volunteer.usernameOrEmail}
                placeholder={texts.volunteer.usernameOrEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                validate
                rules={{ required: true }}
                errorMessage={
                  errors.username && `${texts.volunteer.usernameOrEmail} muss ausgefüllt werden`
                }
                control={control}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="password"
                label={texts.volunteer.password}
                placeholder={texts.volunteer.password}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={secureTextEntry}
                rightIcon={
                  <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
                    {secureTextEntry ? (
                      <Icon.Visible color={colors.darkText} size={normalize(24)} />
                    ) : (
                      <Icon.Unvisible color={colors.darkText} size={normalize(24)} />
                    )}
                  </TouchableOpacity>
                }
                validate
                rules={{ required: true }}
                errorMessage={
                  errors.password && `${texts.volunteer.password} muss ausgefüllt werden`
                }
                control={control}
              />
            </Wrapper>
            <Wrapper>
              <Touchable
                accessibilityLabel={`${texts.volunteer.passwordForgotten} ${a11yLabel.button}`}
                onPress={() =>
                  navigation.navigate(ScreenName.Web, {
                    title: texts.volunteer.passwordForgotten,
                    webUrl: passwordForgottenUrl
                  })
                }
              >
                <RegularText small underline>
                  {texts.volunteer.passwordForgotten}
                </RegularText>
              </Touchable>
            </Wrapper>
            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={texts.volunteer.login}
                disabled={isLoading}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {texts.volunteer.abort.toUpperCase()}
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

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
