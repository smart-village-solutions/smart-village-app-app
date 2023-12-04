import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation, useQuery } from 'react-query';

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
  Wrapper,
  WrapperRow
} from '../../components';
import { consts, normalize, texts } from '../../config';
import { storeVolunteerAuthToken, storeVolunteerUserData } from '../../helpers';
import { QUERY_TYPES } from '../../queries';
import { logIn, me } from '../../queries/volunteer';
import { ScreenName, VolunteerLogin } from '../../types';

const { a11yLabel } = consts;

const showLoginFailAlert = () =>
  Alert.alert(texts.profile.loginFailedTitle, texts.profile.loginFailedBody);

// eslint-disable-next-line complexity
export const ProfileLoginScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<VolunteerLogin>({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const { mutate: mutateLogIn, isLoading, isError, isSuccess, data, reset } = useMutation(logIn);
  const {
    isLoading: isLoadingMe,
    isError: isErrorMe,
    isSuccess: isSuccessMe,
    data: dataMe
  } = useQuery(QUERY_TYPES.VOLUNTEER.ME, me, {
    enabled: !!data?.auth_token, // the query will not execute until the auth token exists
    onSuccess: (responseData) => {
      if (!responseData?.account) {
        return;
      }

      // save user data to global state
      storeVolunteerUserData(responseData.account);

      // refreshUser param causes the home screen to update and no longer show the welcome component
      navigation.navigate(ScreenName.VolunteerHome, { refreshUser: new Date().valueOf() });
    }
  });

  const onSubmit = (loginData: VolunteerLogin) =>
    mutateLogIn(loginData, {
      onSuccess: (responseData) => {
        if (!responseData?.auth_token) {
          return;
        }

        // wait for saving auth token to global state
        return storeVolunteerAuthToken(responseData.auth_token);
      }
    });

  if (
    isError ||
    isErrorMe ||
    (isSuccess && data?.code !== 200) ||
    (isSuccessMe && dataMe?.status && dataMe?.status !== 200)
  ) {
    showLoginFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperRow center>
            <SectionHeader big center title={texts.profile.loginTitle} />
          </WrapperRow>

          <Wrapper>
            <Input
              name="username"
              placeholder={texts.profile.usernameOrEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{ required: true }}
              errorMessage={
                errors.username && `${texts.profile.usernameOrEmail} muss ausgefüllt werden`
              }
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="password"
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
              rules={{ required: true }}
              errorMessage={errors.password && `${texts.profile.password} muss ausgefüllt werden`}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Touchable
              accessibilityLabel={`${texts.profile.passwordForgotten} ${a11yLabel.button}`}
              onPress={() => navigation.navigate(ScreenName.ProfileResetPassword)}
            >
              <BoldText primary small right style={styles.lineHeightAdjustment}>
                {texts.profile.passwordForgotten}
              </BoldText>
            </Touchable>
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.login}
              disabled={isLoading || isLoadingMe}
            />

            <RegularText />

            <RegularText primary center>
              {texts.profile.notYetRegistered}
              <RegularText
                primary
                underline
                onPress={() => navigation.navigate(ScreenName.ProfileRegistration)}
              >
                {texts.profile.register}
              </RegularText>
            </RegularText>
          </Wrapper>

          <LoadingModal loading={isLoading || isLoadingMe} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  },
  lineHeightAdjustment: {
    lineHeight: normalize(15)
  }
});
