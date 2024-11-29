import { StackScreenProps } from '@react-navigation/stack';
import moment from 'moment';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  DateTimeInput,
  DefaultKeyboardAvoidingView,
  DropdownInput,
  HtmlView,
  Input,
  LOGIN_MODAL,
  LoadingModal,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperHorizontal,
  WrapperVertical
} from '../../components';
import { colors, texts } from '../../config';
import { storeProfileUserData } from '../../helpers';
import { useStaticContent } from '../../hooks';
import { useProfileContext } from '../../ProfileProvider';
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
  { value: 'Herr', gender: 'herr' },
  { value: 'divers', gender: 'divers' }
];

/* eslint-disable complexity */
export const ProfileUpdateScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { currentUserData } = useProfileContext();
  const member = route.params?.member ?? {};
  const from = route.params?.from ?? '';
  const { preferences = {}, first_name, last_name } = member;
  const { city, street, postal_code, birthday, gender } = preferences;

  const {
    control,
    formState: { errors },
    handleSubmit
  } = useForm<ProfileUpdate>({
    defaultValues: {
      birthday: birthday ? moment(birthday, 'YYYY-MM-DD').toDate() : undefined,
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

  const { data: dataProfileUpdateScreenTop, refetch: refetchProfileUpdateScreenTop } =
    useStaticContent({
      name: 'profileUpdateScreenTop',
      type: 'html'
    });

  const { data: dataProfileUpdateScreenBottom, refetch: refetchProfileUpdateScreenBottom } =
    useStaticContent({
      name: 'profileUpdateScreenBottom',
      type: 'html'
    });

  const onSubmit = (updateData: ProfileUpdate) =>
    mutateUpdate(updateData, {
      onSuccess: (responseData) => {
        if (!responseData?.member) {
          return;
        }

        storeProfileUserData({
          member: {
            ...currentUserData?.member,
            first_name: updateData.firstName,
            last_name: updateData.lastName,
            preferences: {
              gender: updateData.gender,
              birthday: updateData.birthday,
              city: updateData.city,
              street: updateData.street,
              postal_code: updateData.postcode
            }
          }
        });

        showUpdateSuccessAlert({
          onPress: () =>
            from === LOGIN_MODAL
              ? navigation.popToTop()
              : navigation.navigate(ScreenName.Profile, { refreshUser: new Date().valueOf() })
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
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => {
                refetchProfileUpdateScreenTop();
                refetchProfileUpdateScreenBottom();
              }}
              colors={[colors.refreshControl]}
              tintColor={colors.refreshControl}
            />
          }
        >
          <WrapperVertical style={styles.center}>
            <SectionHeader big center title={texts.profile.update} />
          </WrapperVertical>

          {!!dataProfileUpdateScreenTop && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileUpdateScreenTop} />
            </WrapperHorizontal>
          )}

          <Wrapper style={styles.noPaddingTop}>
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
              rules={{ required: true }}
              errorMessage={errors.firstName && `${texts.profile.firstName} muss ausgefüllt werden`}
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
              rules={{ required: true }}
              errorMessage={errors.lastName && `${texts.profile.lastName} muss ausgefüllt werden`}
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
                    maximumDate: moment().subtract(18, 'years').toDate(),
                    mode: 'date',
                    name,
                    onChange,
                    placeholder: texts.profile.birthdayPlaceholder,
                    required: true,
                    rules: {
                      validate: (value: string) => {
                        const date = moment(value).toDate();
                        const now = moment().toDate();

                        // Calculate the user's age, 365.25 is the average number of days in a year,
                        // accounting for leap years (which occur approximately every 4 years).
                        const age = Math.floor(
                          (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                        );

                        if (age < 18) return texts.profile.birthdayInvalid;

                        return true;
                      }
                    },
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

          {!!dataProfileUpdateScreenBottom && (
            <WrapperHorizontal>
              <HtmlView html={dataProfileUpdateScreenBottom} />
            </WrapperHorizontal>
          )}

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
  center: {
    alignItems: 'center'
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
