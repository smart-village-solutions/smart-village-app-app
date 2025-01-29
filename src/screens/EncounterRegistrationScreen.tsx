import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CheckBox } from 'react-native-elements';

import {
  BoldText,
  Button,
  CircularView,
  DateTimePicker,
  DefaultKeyboardAvoidingView,
  Image,
  Label,
  LoadingModal,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  Wrapper,
  WrapperRow
} from '../components';
import { Icon, colors, consts, device, normalize, texts } from '../config';
import { createUserAsync } from '../encounterApi';
import { momentFormat, storeEncounterUserId } from '../helpers';
import { useSelectImage } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { CreateUserData, ScreenName, User } from '../types';

const isValidRegistrationData = (
  data: Partial<User> & { isPrivacyChecked: boolean }
): data is CreateUserData & { isPrivacyChecked: boolean } => {
  const { birthDate, firstName, imageUri, isPrivacyChecked, lastName, phone } = data;
  return !!(firstName && lastName && birthDate && phone && imageUri && isPrivacyChecked);
};

const showInvalidRegistrationDataAlert = () =>
  Alert.alert(
    texts.encounter.registrationAllFieldsRequiredTitle,
    texts.encounter.registrationAllFieldsRequiredBody
  );

const showRegistrationFailAlert = () =>
  Alert.alert(texts.encounter.registrationFailedTitle, texts.encounter.registrationFailedBody);

const a11yLabels = consts.a11yLabel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterRegistrationScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState<string>('');
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);
  // globally disable the button, when loading after pressing register
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const { imageUri, selectImage } = useSelectImage({});

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

  const onPressInfo = useCallback(() => {
    navigation.navigate(ScreenName.Html, {
      title: texts.screenTitles.encounterHome,
      query: QUERY_TYPES.PUBLIC_HTML_FILE,
      queryVariables: { name: 'encounter-privacy' }
    });
  }, [navigation]);

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView keyboardShouldPersistTaps="handled">
          <SectionHeader title={texts.encounter.registrationTitle} />
          <Wrapper>
            <BoldText>{texts.encounter.registrationHint}</BoldText>
          </Wrapper>
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.firstName}</Label>
            <TextInput
              accessibilityLabel={`${a11yLabels.firstName} ${a11yLabels.textInput}: ${firstName}`}
              onChangeText={setFirstName}
              placeholder={texts.encounter.firstName}
              style={styles.inputField}
              value={firstName}
            />
          </Wrapper>
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.lastName}</Label>
            <TextInput
              accessibilityLabel={`${a11yLabels.lastName} ${a11yLabels.textInput}: ${lastName}`}
              onChangeText={setLastName}
              placeholder={texts.encounter.lastName}
              style={styles.inputField}
              value={lastName}
            />
          </Wrapper>
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.birthDate}</Label>
            <Pressable
              accessibilityLabel={`${a11yLabels.birthDate} ${a11yLabels.textInput}: ${
                birthDate ? momentFormat(birthDate.toISOString()) : ''
              }`}
              accessibilityHint={a11yLabels.birthDateHint}
              onPress={() => {
                Keyboard.dismiss();
                setIsDatePickerVisible(true);
              }}
              onStartShouldSetResponderCapture={() => true}
            >
              <TextInput
                editable={false}
                placeholder={texts.encounter.birthDate}
                style={styles.inputField}
                value={birthDate ? momentFormat(birthDate.toISOString()) : undefined}
              />
            </Pressable>
          </Wrapper>
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.phone}</Label>
            <TextInput
              accessibilityLabel={`${a11yLabels.phoneNumber} ${a11yLabels.textInput}: ${phone}`}
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder={texts.encounter.phone}
              style={styles.inputField}
              value={phone}
            />
          </Wrapper>
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.profilePhoto}</Label>
            <TouchableOpacity
              accessibilityLabel={`${a11yLabels.image} ${a11yLabels.button}`}
              onPress={selectImage}
            >
              <WrapperRow spaceBetween>
                {/* This creates an identically sized view independent of the chosen icon to keep the image centered. */}
                <View style={styles.editIconContainer}>
                  <Icon.EditSetting color={colors.transparent} />
                </View>
                <CircularView size={device.width / 2} style={styles.circle}>
                  {imageUri ? (
                    <Image source={{ uri: imageUri }} resizeMode="contain" />
                  ) : (
                    <>
                      <Wrapper>
                        <Icon.AddImage color={colors.darkText} size={normalize(34)} />
                      </Wrapper>
                      <RegularText small>{texts.encounter.photoPlaceholder.first}</RegularText>
                      <RegularText small>{texts.encounter.photoPlaceholder.second}</RegularText>
                    </>
                  )}
                </CircularView>
                <View style={styles.editIconContainer}>
                  <Icon.EditSetting color={colors.shadow} />
                </View>
              </WrapperRow>
            </TouchableOpacity>
          </Wrapper>
          <Wrapper noPaddingTop>
            <WrapperRow style={styles.privacyContainer}>
              <CheckBox
                accessibilityRole="button"
                checked={isPrivacyChecked}
                onPress={() => setIsPrivacyChecked((value) => !value)}
                checkedColor={colors.darkText}
                checkedIcon="check-square-o"
                uncheckedColor={colors.darkText}
                uncheckedIcon="square-o"
              />
              <View style={styles.privacyTextContainer}>
                <RegularText small>{texts.encounter.registrationPrivacyText}</RegularText>
                <Touchable
                  accessibilityLabel={`${a11yLabels.privacy} ${a11yLabels.button}`}
                  onPress={onPressInfo}
                >
                  <RegularText small underline>
                    {texts.encounter.registrationPrivacyLink}
                  </RegularText>
                </Touchable>
              </View>
            </WrapperRow>
          </Wrapper>
          <Wrapper>
            <Button
              onPress={onPressRegister}
              title={texts.encounter.register}
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
          </Wrapper>
          <DateTimePicker
            initialTime={birthDate}
            mode="date"
            onUpdate={(time) => {
              setBirthDate(time);
            }}
            setVisible={setIsDatePickerVisible}
            visible={isDatePickerVisible}
          />
          <LoadingModal loading={registrationLoading} />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.shadowRgba
  },
  editIconContainer: {
    justifyContent: 'flex-end'
  },
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
  privacyContainer: {
    alignItems: 'flex-start'
  },
  privacyTextContainer: {
    flexShrink: 1
  }
});
