import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DateTimeInput,
  DefaultKeyboardAvoidingView,
  DropdownInput,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow
} from '../../components';
import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import { profileUpdate } from '../../queries/profile';
import { ProfileUpdate, ScreenName } from '../../types';

const showUpdateFailAlert = () =>
  Alert.alert(texts.profile.updateProfileFailedTitle, texts.profile.updateProfileFailedBody);

const showUpdateSuccessAlert = ({ onPress }: { onPress: () => void }) =>
  Alert.alert(texts.profile.showUpdateSuccessAlertTitle, texts.profile.showUpdateSuccessAlertBody, [
    {
      text: texts.profile.ok,
      onPress
    }
  ]);

const genderData = [
  { value: 'Frau', gender: 'frau' },
  { value: 'Mann', gender: 'mann' },
  { value: 'divers', gender: 'divers' }
];

/* eslint-disable complexity */
export const ProfileUpdateScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const member = route.params?.member ?? {};
  const { preferences = {}, first_name, last_name } = member;
  const { city, street, postal_code, birthday, gender } = preferences;

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ProfileUpdate>({
    defaultValues: {
      birthday: birthday ? new Date(momentFormat(birthday, 'YYYY-MM-DD')) : undefined,
      city: city || '',
      firstName: first_name || '',
      gender: gender || '',
      lastName: last_name || '',
      postcode: postal_code || '',
      street: street || ''
    }
  });

  const {
    mutate: mutateUpdate,
    isError,
    isLoading,
    isSuccess,
    reset,
    data
  } = useMutation(profileUpdate);

  const onSubmit = (updateData: ProfileUpdate) =>
    mutateUpdate(updateData, {
      onSuccess: (responseData) => {
        if (!responseData?.member) {
          return;
        }

        showUpdateSuccessAlert({
          onPress: () =>
            navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() })
        });
      }
    });

  if (isError || (isSuccess && !data?.member)) {
    showUpdateFailAlert();
    reset();
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperRow center>
            <SectionHeader big center title={texts.profile.update} />
          </WrapperRow>

          <Wrapper>
            <Controller
              name="gender"
              render={({ field: { name, onChange, value } }) => (
                <DropdownInput
                  {...{
                    boldLabel: true,
                    control,
                    data: genderData,
                    errors,
                    label: texts.profile.gender,
                    name,
                    onChange,
                    showSearch: false,
                    value,
                    valueKey: 'gender'
                  }}
                />
              )}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.firstName}
              name="firstName"
              placeholder={texts.profile.firstName}
              validate
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.lastName}
              name="lastName"
              placeholder={texts.profile.lastName}
              validate
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Controller
              name="birthday"
              render={({ field: { name, onChange, value } }) => (
                <DateTimeInput
                  {...{
                    boldLabel: true,
                    control,
                    errors,
                    label: texts.profile.birthday,
                    mode: 'date',
                    name,
                    onChange,
                    placeholder: texts.profile.birthday,
                    value
                  }}
                />
              )}
              control={control}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.streetAndHouseNumber}
              name="street"
              placeholder={texts.profile.streetAndHouseNumber}
              validate
              rules={{ required: true }}
              errorMessage={
                errors.street && `${texts.profile.streetAndHouseNumber} muss ausgefüllt werden`
              }
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.postcode}
              maxLength={5}
              name="postcode"
              keyboardType="numeric"
              placeholder={texts.profile.postcode}
              validate
              rules={{
                required: `${texts.profile.postcode} muss ausgefüllt werden`,
                minLength: { value: 5, message: texts.profile.postcodeMinLength }
              }}
              errorMessage={errors.postcode && errors.postcode.message}
            />
          </Wrapper>

          <Wrapper style={styles.noPaddingTop}>
            <Input
              autoCapitalize="none"
              control={control}
              label={texts.profile.city}
              name="city"
              placeholder={texts.profile.city}
              validate
              rules={{ required: true }}
              errorMessage={errors.city && `${texts.profile.city} muss ausgefüllt werden`}
            />
          </Wrapper>

          <Wrapper>
            <Button
              onPress={handleSubmit(onSubmit)}
              title={texts.profile.update}
              disabled={isLoading}
            />
          </Wrapper>

          <LoadingModal loading={isLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
