import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Keyboard, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DefaultKeyboardAvoidingView,
  HtmlView,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperHorizontal,
  WrapperVertical
} from '../../components';
import { colors, consts, normalize, texts } from '../../config';
import { storeProfileAuthToken } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { profileEditMail } from '../../queries/profile';
import { ProfileEditMail, ScreenName } from '../../types';

const { EMAIL_REGEX } = consts;

const showUpdateFailAlert = () =>
  Alert.alert(texts.profile.updateProfileFailedTitle, texts.profile.updateProfileFailedBody);

const showUpdateSuccessAlert = ({ onPress }: { onPress: () => void }) =>
  Alert.alert(
    texts.profile.showUpdateSuccessAlertTitle,
    texts.profile.showUpdateEmailSuccessAlertBody,
    [
      {
        text: texts.profile.ok,
        onPress
      }
    ]
  );

export const ProfileEditMailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm<ProfileEditMail>({
    defaultValues: {
      emailCurrent: route.params?.email || '',
      email: '',
      emailConfirmation: ''
    }
  });
  const email = watch('email');

  const {
    mutate: mutateUpdate,
    isError,
    isLoading,
    isSuccess,
    reset,
    data
  } = useMutation(profileEditMail);

  const { data: dataProfileEditMailScreenTop, refetch: refetchProfileEditMailScreenTop } =
    useStaticContent({
      name: 'profileEditMailScreenTop',
      type: 'html'
    });

  const { data: dataProfileEditMailScreenBottom, refetch: refetchProfileEditMailScreenBottom } =
    useStaticContent({
      name: 'profileEditMailScreenBottom',
      type: 'html'
    });

  const onSubmit = (updateData: ProfileEditMail) => {
    Keyboard.dismiss();

    mutateUpdate(updateData, {
      onSuccess: (responseData) => {
        if (!responseData?.member) {
          return;
        }

        showUpdateSuccessAlert({
          onPress: () => {
            storeProfileAuthToken();
            navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() });
          }
        });
      }
    });
  };

  if (isError || (isSuccess && !data?.member)) {
    showUpdateFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                refetchProfileEditMailScreenTop();
                refetchProfileEditMailScreenBottom();
              }}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        >
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.updateMail} />
          </WrapperVertical>

          {!!dataProfileEditMailScreenTop && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileEditMailScreenTop} />
            </WrapperHorizontal>
          )}

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="emailCurrent"
              label={texts.profile.emailCurrent}
              placeholder={texts.profile.emailCurrent}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              disabled
              rules={{
                required: texts.profile.emailError,
                pattern: { value: EMAIL_REGEX, message: texts.profile.emailInvalid }
              }}
              errorMessage={errors.email && errors.email.message}
              control={control}
              inputContainerStyle={styles.inputContainer}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="email"
              label={texts.profile.emailNew}
              placeholder={texts.profile.emailNew}
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

          <Wrapper style={styles.noPaddingTop}>
            <Input
              name="emailConfirmation"
              label={texts.profile.emailConfirmation}
              placeholder={texts.profile.emailConfirmation}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.profile.emailError,
                pattern: { value: EMAIL_REGEX, message: texts.profile.emailInvalid },
                validate: (value: string) => value === email || texts.profile.emailDoNotMatch
              }}
              errorMessage={errors.emailConfirmation && errors.emailConfirmation.message}
              control={control}
              inputContainerStyle={styles.inputContainer}
            />
          </Wrapper>

          {!!dataProfileEditMailScreenBottom && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileEditMailScreenBottom} />
            </WrapperHorizontal>
          )}

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.updateMail}
              disabled={isLoading}
            />
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  center: {
    alignItems: 'center'
  },
  noPaddingTop: {
    paddingTop: 0
  },
  inputContainer: {
    height: normalize(45)
  }
});
