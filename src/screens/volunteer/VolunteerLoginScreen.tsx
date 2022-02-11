import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { TouchableOpacity } from 'react-native-gesture-handler';

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
import { colors, consts, Icon, normalize, texts } from '../../config';
import { storeEncounterUserId } from '../../helpers';
import { useSelectImage } from '../../hooks';
import { ScreenName } from '../../types';

const { a11yLabel } = consts;

const showInvalidRegistrationDataAlert = () =>
  Alert.alert(
    texts.volunteer.registrationAllFieldsRequiredTitle,
    texts.volunteer.registrationAllFieldsRequiredBody
  );

const showRegistrationFailAlert = () =>
  Alert.alert(texts.volunteer.registrationFailedTitle, texts.volunteer.registrationFailedBody);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VolunteerLoginScreen = ({ navigation }: StackScreenProps<any>) => {
  const {
    control,
    formState: { errors, isValid },
    handleSubmit
  } = useForm();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  // globally disable the button, when loading after pressing register
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const { imageUri } = useSelectImage();

  const onSubmit = async () => {
    if (isValid) {
      // TODO: new login logics
      setRegistrationLoading(true);
      const userId = '0';

      if (!userId?.length) {
        showRegistrationFailAlert();
        setRegistrationLoading(false);
        return;
      }

      await storeEncounterUserId(userId);

      // if we do not set the loading state to false, the modal "spills over" to the next screen, sometimes not disappearing at all
      setRegistrationLoading(false);

      // refreshUser param causes the home screen to update and no longer show the welcome component
      navigation.navigate(ScreenName.EncounterHome, { refreshUser: new Date().valueOf() });
    } else {
      setRegistrationLoading(false);
      showInvalidRegistrationDataAlert();
    }
  };

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
                name="email"
                label={texts.volunteer.email}
                placeholder={texts.volunteer.email}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCompleteType="email"
                autoCapitalize="none"
                validate
                rules={{ required: true }}
                errorMessage={errors.email && 'E-Mail muss ausgefüllt werden'}
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
                errorMessage={errors.password && 'Passwort muss ausgefüllt werden'}
                control={control}
              />
            </Wrapper>
            <Wrapper>
              <Touchable
                accessibilityLabel={`${texts.volunteer.passwordForgotten} ${a11yLabel.button}`}
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
                disabled={registrationLoading}
              />
              <Touchable onPress={() => navigation.goBack()}>
                <BoldText center primary underline>
                  {texts.volunteer.abort.toUpperCase()}
                </BoldText>
              </Touchable>
            </Wrapper>
          </WrapperWithOrientation>
          <LoadingModal loading={registrationLoading} />
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
