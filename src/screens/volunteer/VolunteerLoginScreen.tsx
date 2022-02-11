import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { normalize } from 'react-native-elements';

import {
  BoldText,
  Button,
  DefaultKeyboardAvoidingView,
  Label,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  Title,
  TitleContainer,
  Touchable,
  Wrapper,
  WrapperWithOrientation
} from '../../components';
import { colors, consts, texts } from '../../config';
import { createUserAsync } from '../../encounterApi';
import { momentFormat, storeEncounterUserId } from '../../helpers';
import { useSelectImage } from '../../hooks';
import { CreateUserData, ScreenName, User } from '../../types';

const isValidRegistrationData = (
  data: Partial<User> & { isPrivacyChecked: boolean }
): data is CreateUserData & { isPrivacyChecked: boolean } => {
  const { birthDate, firstName, imageUri, isPrivacyChecked, lastName, phone } = data;
  return !!(firstName && lastName && birthDate && phone && imageUri && isPrivacyChecked);
};

const showInvalidRegistrationDataAlert = () =>
  Alert.alert(
    texts.volunteer.registrationAllFieldsRequiredTitle,
    texts.volunteer.registrationAllFieldsRequiredBody
  );

const showRegistrationFailAlert = () =>
  Alert.alert(texts.volunteer.registrationFailedTitle, texts.volunteer.registrationFailedBody);

const a11yLabels = consts.a11yLabel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const VolunteerLoginScreen = ({ navigation }: StackScreenProps<any>) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState<string>('');
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  // globally disable the button, when loading after pressing register
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const { imageUri } = useSelectImage();

  const onPressRegister = useCallback(async () => {
    const registrationData = {
      birthDate: birthDate && momentFormat(birthDate.valueOf(), 'yyyy-MM-DD', 'x'),
      firstName,
      imageUri,
      isPrivacyChecked,
      lastName,
      phone
    };

    // this condition should always be true
    if (isValidRegistrationData(registrationData)) {
      setRegistrationLoading(true);
      const userId = await createUserAsync(registrationData);

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
  }, [birthDate, firstName, imageUri, lastName, navigation, phone, isPrivacyChecked]);

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <WrapperWithOrientation>
            <TitleContainer>
              <Title
                big
                center
                accessibilityLabel={`${texts.volunteer.loginTitle} ${consts.a11yLabel.heading}`}
              >
                {texts.volunteer.loginTitle}
              </Title>
            </TitleContainer>
            <Wrapper style={styles.noPaddingTop}>
              <Label>{texts.volunteer.email}</Label>
              <TextInput
                accessibilityLabel={`${a11yLabels.lastName} ${a11yLabels.textInput}: ${lastName}`}
                onChangeText={setLastName}
                placeholder={texts.volunteer.email}
                style={styles.inputField}
                value={lastName}
              />
            </Wrapper>
            <Wrapper style={styles.noPaddingTop}>
              <Label>{texts.volunteer.password}</Label>
              <TextInput
                accessibilityLabel={`${a11yLabels.lastName} ${a11yLabels.textInput}: ${lastName}`}
                onChangeText={setLastName}
                placeholder={texts.volunteer.password}
                style={styles.inputField}
                value={lastName}
              />
            </Wrapper>
            <Wrapper>
              <Touchable accessibilityLabel={`${a11yLabels.privacy} ${a11yLabels.button}`}>
                <RegularText small underline>
                  {texts.volunteer.passwordForgotten}
                </RegularText>
              </Touchable>
            </Wrapper>
            <Wrapper>
              <Button
                onPress={onPressRegister}
                title={texts.volunteer.login}
                disabled={
                  registrationLoading ||
                  !isValidRegistrationData({
                    birthDate: birthDate && momentFormat(birthDate.valueOf(), 'yyyy-MM-DD', 'x'),
                    firstName,
                    imageUri,
                    isPrivacyChecked,
                    lastName,
                    phone
                  })
                }
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
  inputField: {
    backgroundColor: colors.surface,
    borderColor: colors.placeholder,
    borderWidth: 1,
    fontFamily: 'regular',
    fontSize: normalize(16),
    color: colors.darkText,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8)
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
