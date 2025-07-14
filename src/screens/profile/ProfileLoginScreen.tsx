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
  LOGIN_MODAL,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  Wrapper,
  WrapperVertical
} from '../../components';
import { consts, normalize, texts } from '../../config';
import { storeProfileAuthToken, storeProfileUserData } from '../../helpers';
import { addMemberIdToTokenOnServer } from '../../pushNotifications';
import { QUERY_TYPES } from '../../queries';
import { member, profileLogIn } from '../../queries/profile';
import { ProfileLogin, ProfileMember, ScreenName } from '../../types';

const { a11yLabel, EMAIL_REGEX } = consts;

const showLoginFailAlert = () =>
  Alert.alert(texts.profile.loginFailedTitle, texts.profile.loginFailedBody);

/* eslint-disable complexity */
export const ProfileLoginScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const email = route.params?.email ?? '';
  const password = route.params?.password ?? '';
  const dataPrivacyLink = route.params?.webUrl ?? '';
  const from = route.params?.from ?? '';

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ProfileLogin>({
    defaultValues: {
      email,
      password
    }
  });

  const {
    mutate: mutateLogIn,
    isError,
    isLoading,
    isSuccess,
    reset,
    data
  } = useMutation(profileLogIn);

  const { isLoading: isLoadingMember } = useQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    enabled: !isLoading && !!data?.member?.authentication_token,
    onSuccess: (responseData: ProfileMember) => {
      if (!responseData?.member) {
        return;
      }

      // save user data to global state
      storeProfileUserData(responseData);

      if (!Object.keys(responseData.member?.preferences || {}).length) {
        navigation.navigate(ScreenName.ProfileUpdate);
      } else if (from === LOGIN_MODAL) {
        navigation.popToTop();
        return;
      } else if (
        navigation.getState().routes[navigation.getState().index].name === ScreenName.ProfileLogin
      ) {
        // refreshUser param causes the home screen to update and no longer show the welcome component
        navigation.navigate(ScreenName.Profile, {
          refreshUser: data?.member?.authentication_token_created_at
        });
      }
    }
  });

  const onSubmit = (loginData: ProfileLogin) =>
    mutateLogIn(loginData, {
      onSuccess: (responseData: ProfileMember) => {
        if (!responseData?.member?.authentication_token) {
          return;
        }

        // update push notification device token on server with current member id
        addMemberIdToTokenOnServer(responseData.member.id);

        // wait for saving auth token to global state
        return storeProfileAuthToken(responseData.member.authentication_token);
      }
    });

  if (isError || (isSuccess && !data?.success)) {
    showLoginFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.loginTitle} />
          </WrapperVertical>

          <Wrapper noPaddingTop>
            <Input
              name="email"
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

          <Wrapper noPaddingTop>
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
              inputStyle={isSecureTextEntry && styles.passwordInput}
              inputContainerStyle={styles.inputContainer}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
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
              disabled={isLoading || isLoadingMember}
            />

            <RegularText />

            <RegularText primary center>
              {texts.profile.notYetRegistered}
              <RegularText
                primary
                underline
                onPress={() =>
                  navigation.navigate(ScreenName.ProfileRegistration, { webUrl: dataPrivacyLink })
                }
              >
                {texts.profile.register}
              </RegularText>
            </RegularText>
          </Wrapper>

          <LoadingModal loading={isLoading || isLoadingMember} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  },
  lineHeightAdjustment: {
    lineHeight: normalize(15)
  },
  passwordInput: {
    lineHeight: normalize(17)
  },
  inputContainer: {
    height: normalize(45)
  }
});
