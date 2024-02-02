import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

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
import { storeProfileAuthToken } from '../../helpers';
import { profileLogIn } from '../../queries/profile';
import { ProfileLogin, ScreenName } from '../../types';

const { a11yLabel } = consts;

const showLoginFailAlert = () =>
  Alert.alert(texts.profile.loginFailedTitle, texts.profile.loginFailedBody);

// eslint-disable-next-line complexity
export const ProfileLoginScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const email = route.params?.email ?? '';
  const password = route.params?.password ?? '';

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

  const { mutate: mutateLogIn, isLoading, reset } = useMutation(profileLogIn);

  const onSubmit = (loginData: ProfileLogin) =>
    mutateLogIn(loginData, {
      onSuccess: (responseData) => {
        if (!responseData?.member?.keycloak_access_token) {
          showLoginFailAlert();
          reset();
          return;
        }

        alert('Login erfolgreich!');

        // wait for saving auth token to global state
        return storeProfileAuthToken(responseData.member.keycloak_access_token);
      }
    });

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperRow center>
            <SectionHeader big center title={texts.profile.loginTitle} />
          </WrapperRow>

          <Wrapper>
            <Input
              name="email"
              placeholder={texts.profile.usernameOrEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{ required: true }}
              errorMessage={
                errors.email && `${texts.profile.usernameOrEmail} muss ausgefüllt werden`
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
              disabled={isLoading}
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

          <LoadingModal loading={isLoading} />
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
