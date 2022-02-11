import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  Input,
  LoadingModal,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import { ScreenName } from '../../types';
import { registerMutation } from '../../queries/volunteer';

const { a11yLabel } = consts;

const showInvalidRegisterAlert = () =>
  Alert.alert('Fehler bei der Registrierung', 'Bitte Eingaben überprüfen und erneut versuchen.');

// eslint-disable-next-line complexity
export const VolunteerRegistrationScreen = ({ navigation }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    watch
  } = useForm({ mode: 'onChange' });
  const password = watch('password');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureTextEntryConfirmation, setSecureTextEntryConfirmation] = useState(true);
  const { mutate: mutateRegister, isLoading, isError, isSuccess, data, reset } = useMutation(
    registerMutation
  );
  const onSubmit = (registerData: {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => mutateRegister(registerData);

  if (isError || (!isLoading && data && data.code !== 200)) {
    // TODO: catch errors
    // showInvalidRegisterAlert();
    // reset();
    // TODO: remove navigation if real registration is working
    navigation.navigate(ScreenName.VolunteerRegistered);
  } else if (isSuccess) {
    navigation.navigate(ScreenName.VolunteerRegistered);
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
                accessibilityLabel={`${texts.volunteer.registrationTitle} ${a11yLabel.heading}`}
              >
                {texts.volunteer.registrationTitle}
              </Title>
            </TitleContainer>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="username"
                label={texts.volunteer.username}
                placeholder={texts.volunteer.username}
                textContentType="username"
                autoCapitalize="none"
                validate
                rules={{ required: true }}
                errorMessage={
                  errors.username && `${texts.volunteer.username} muss ausgefüllt werden`
                }
                control={control}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="email"
                label={texts.volunteer.email}
                placeholder={texts.volunteer.email}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                validate
                rules={{ required: true, validate: (input: string) => /\S+@\S+\.\S+/.test(input) }}
                errorMessage={
                  errors.email && `${texts.volunteer.email} muss korrekt ausgefüllt werden`
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
            <Wrapper style={styles.noPaddingTop}>
              <Input
                name="passwordConfirmation"
                label={texts.volunteer.passwordConfirmation}
                placeholder={texts.volunteer.passwordConfirmation}
                textContentType="password"
                autoCompleteType="password"
                secureTextEntry={secureTextEntryConfirmation}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setSecureTextEntryConfirmation(!secureTextEntryConfirmation)}
                  >
                    {secureTextEntryConfirmation ? (
                      <Icon.Visible color={colors.darkText} size={normalize(24)} />
                    ) : (
                      <Icon.Unvisible color={colors.darkText} size={normalize(24)} />
                    )}
                  </TouchableOpacity>
                }
                validate
                rules={{ required: true, validate: (input: string) => password === input }}
                errorMessage={
                  errors.passwordConfirmation &&
                  `${texts.volunteer.passwordConfirmation} muss ausgefüllt werden ` +
                    `und mit ${texts.volunteer.password} übereinstimmen`
                }
                control={control}
              />
            </Wrapper>
            <Wrapper>
              <Button
                onPress={handleSubmit(onSubmit)}
                title={texts.volunteer.next}
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
