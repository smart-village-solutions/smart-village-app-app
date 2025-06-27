import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useMutation, useQuery } from 'react-query';

import * as appJson from '../../../app.json';
import {
  Button,
  Checkbox,
  DefaultKeyboardAvoidingView,
  DropdownInput,
  Input,
  InputSecureTextIcon,
  LoadingModal,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperHorizontal
} from '../../components';
import { Icon, colors, consts, secrets, texts } from '../../config';
import { usePullToRefetch } from '../../hooks';
import { QUERY_TYPES } from '../../queries';
import { register, userGroups } from '../../queries/volunteer';
import { ScreenName, VolunteerRegistration } from '../../types';

const { EMAIL_REGEX } = consts;
const namespace = appJson.expo.slug as keyof typeof secrets;
const dataPrivacyLink = secrets[namespace]?.volunteer?.dataPrivacyLink;

const showRegistrationFailAlert = () =>
  Alert.alert(texts.volunteer.registrationFailedTitle, texts.volunteer.registrationFailedBody);

const showPrivacyCheckedAlert = () =>
  Alert.alert(texts.volunteer.privacyCheckRequireTitle, texts.volunteer.privacyCheckRequireBody);

// eslint-disable-next-line complexity
export const VolunteerRegistrationScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);
  const [isSecureTextEntryConfirmation, setIsSecureTextEntryConfirmation] = useState(true);
  const [hasAcceptedDataPrivacy, setHasAcceptedDataPrivacy] = useState(false);
  const {
    isLoading: isLoadingUserGroups,
    data: dataUserGroups,
    refetch: refetchUserGroups
  } = useQuery(QUERY_TYPES.VOLUNTEER.USER_GROUPS, userGroups);

  const RefreshControl = usePullToRefetch(refetchUserGroups);

  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm<VolunteerRegistration>({
    defaultValues: {
      username: '',
      email: '',
      group: '',
      firstname: '',
      password: '',
      passwordConfirmation: '',
      dataPrivacyCheck: false
    }
  });
  const password = watch('password');

  const {
    mutate: mutateRegister,
    isLoading,
    isError,
    isSuccess,
    data,
    reset
  } = useMutation(register);

  const onSubmit = (registerData: VolunteerRegistration) => {
    if (!hasAcceptedDataPrivacy) return showPrivacyCheckedAlert();

    mutateRegister(
      { ...registerData, dataPrivacyCheck: hasAcceptedDataPrivacy },
      {
        onSuccess: (responseData) => {
          if (responseData?.code !== 200) {
            return;
          }

          navigation.navigate(ScreenName.VolunteerSignup, {
            email: registerData.email
          });
        }
      }
    );
  };

  if (isError || (isSuccess && data?.code !== 200)) {
    showRegistrationFailAlert();
    reset();
  }

  if (isLoadingUserGroups) {
    return <LoadingSpinner loading />;
  }

  const dataUserGroupsForRegistration =
    dataUserGroups?.results
      ?.filter((group) => group.show_at_registration)
      ?.sort((a, b) => a.sort_order - b.sort_order)
      ?.map((group) => ({
        id: group.id,
        value: group.name
      })) || [];

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView refreshControl={RefreshControl} keyboardShouldPersistTaps="handled">
          <SectionHeader title={texts.volunteer.registrationTitle} big center />
          <Wrapper noPaddingTop>
            <Input
              name="username"
              label={texts.volunteer.username}
              placeholder={texts.volunteer.username}
              textContentType="username"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.volunteer.usernameError,
                minLength: { value: 4, message: texts.volunteer.usernameErrorLengthError }
              }}
              errorMessage={errors.username && errors.username.message}
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Input
              name="email"
              label={texts.volunteer.email}
              placeholder={texts.volunteer.email}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCompleteType="email"
              autoCapitalize="none"
              validate
              rules={{
                required: texts.volunteer.emailError,
                pattern: { value: EMAIL_REGEX, message: texts.volunteer.emailInvalid }
              }}
              errorMessage={errors.email && errors.email.message}
              control={control}
            />
          </Wrapper>

          {!!dataUserGroupsForRegistration?.length && (
            <>
              <Wrapper noPaddingTop>
                <Controller
                  name="group"
                  render={({ field: { name, onChange, value } }) => (
                    <DropdownInput
                      {...{
                        boldLabel: true,
                        control,
                        data: dataUserGroupsForRegistration,
                        errors,
                        label: texts.volunteer.groupRegister,
                        name,
                        onChange,
                        placeholder: texts.volunteer.groupPlaceholder,
                        required: true,
                        showSearch: false,
                        value
                      }}
                    />
                  )}
                  control={control}
                />
              </Wrapper>

              <Wrapper noPaddingTop>
                <Input
                  name="firstname"
                  label={texts.volunteer.groupFirstname}
                  placeholder={texts.volunteer.groupFirstname}
                  textContentType="username"
                  autoCapitalize="none"
                  validate
                  rules={{
                    required: texts.volunteer.groupFirstnameError
                  }}
                  errorMessage={errors.firstname && errors.firstname.message}
                  control={control}
                />
              </Wrapper>
            </>
          )}

          <Wrapper noPaddingTop>
            <Input
              name="password"
              label={texts.volunteer.password}
              placeholder={texts.volunteer.password}
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
                required: texts.volunteer.passwordError,
                minLength: { value: 5, message: texts.volunteer.passwordLengthError }
              }}
              errorMessage={errors.password && errors.password.message}
              control={control}
            />
          </Wrapper>

          <Wrapper noPaddingTop>
            <Input
              name="passwordConfirmation"
              label={texts.volunteer.passwordConfirmation}
              placeholder={texts.volunteer.passwordConfirmation}
              textContentType="password"
              autoCompleteType="password"
              secureTextEntry={isSecureTextEntryConfirmation}
              rightIcon={
                <InputSecureTextIcon
                  isSecureTextEntry={isSecureTextEntryConfirmation}
                  setIsSecureTextEntry={setIsSecureTextEntryConfirmation}
                />
              }
              validate
              rules={{
                required: texts.volunteer.passwordError,
                minLength: { value: 5, message: texts.volunteer.passwordLengthError },
                validate: (value) => value === password || texts.volunteer.passwordDoNotMatch
              }}
              errorMessage={errors.passwordConfirmation && errors.passwordConfirmation.message}
              control={control}
            />
          </Wrapper>

          <WrapperHorizontal>
            <Checkbox
              center={false}
              checked={hasAcceptedDataPrivacy}
              checkedIcon={<Icon.SquareCheckFilled />}
              link={dataPrivacyLink}
              linkDescription={texts.volunteer.privacyCheckLink}
              onPress={() => setHasAcceptedDataPrivacy(!hasAcceptedDataPrivacy)}
              title={texts.volunteer.privacyChecked}
              uncheckedIcon={<Icon.Square color={colors.placeholder} />}
            />
          </WrapperHorizontal>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.volunteer.next}
              disabled={isLoading}
              notFullWidth
            />
            <TouchableOpacity onPress={() => navigation.navigate(ScreenName.VolunteerSignup)}>
              <RegularText small center>
                {texts.volunteer.enterCodeInfo}
              </RegularText>
              <RegularText primary center>
                {texts.volunteer.enterCode}
              </RegularText>
            </TouchableOpacity>
            <RegularText />
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <RegularText primary center>
                {texts.volunteer.abort}
              </RegularText>
            </TouchableOpacity>
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
