import { noop } from 'lodash';
import React, { useState } from 'react';
import { useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CheckBox, normalize } from 'react-native-elements';

import {
  BoldText,
  Button,
  CircularView,
  DateTimePicker,
  Image,
  Label,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { colors, device, Icon, texts } from '../config';
import { momentFormat } from '../helpers';
import { useSelectImage } from '../hooks';

// TODO: accesibility labels
export const EncounterRegistrationScreen = () => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState<string>();
  const [isPrivacyChecked, setIsPrivacyChecked] = useState(false);

  const { imageUri, selectImage } = useSelectImage();

  const checkValuesForSubmission = useCallback(() => {
    return !!(firstName && lastName && birthDate && phone && imageUri && isPrivacyChecked);
  }, [firstName, lastName, birthDate, phone, imageUri, isPrivacyChecked]);

  const onPressRegister = useCallback(() => {
    if (!checkValuesForSubmission()) {
      Alert.alert(
        texts.encounter.registrationAllFieldsRequiredTitle,
        texts.encounter.registrationAllFieldsRequiredBody
      );
      return;
    }

    // TODO: implement API call
  }, [checkValuesForSubmission]);

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <SectionHeader title={texts.encounter.registrationTitle} />
        <WrapperWithOrientation>
          <Wrapper>
            <BoldText>{texts.encounter.registrationHint}</BoldText>
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.firstName}</Label>
            <TextInput
              onChangeText={setFirstName}
              placeholder={texts.encounter.firstName}
              style={styles.inputField}
              value={firstName}
            />
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.lastName}</Label>
            <TextInput
              onChangeText={setLastName}
              placeholder={texts.encounter.lastName}
              style={styles.inputField}
              value={lastName}
            />
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.birthDate}</Label>
            <Pressable
              onPress={() => {
                setIsDatePickerVisible(false);
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
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.phone}</Label>
            <TextInput
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder={texts.encounter.phone}
              style={styles.inputField}
              value={phone}
            />
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.profilePhoto}</Label>
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
              <TouchableOpacity onPress={selectImage} style={styles.editIconContainer}>
                <Icon.EditSetting color={colors.shadow} />
              </TouchableOpacity>
            </WrapperRow>
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <WrapperRow style={styles.privacyContainer}>
              <CheckBox
                checked={isPrivacyChecked}
                onPress={() => setIsPrivacyChecked((value) => !value)}
                checkedColor={colors.darkText}
                uncheckedColor={colors.darkText}
              />
              <View style={styles.privacyTextContainer}>
                <RegularText small>{texts.encounter.registrationPrivacyText}</RegularText>
                <Touchable onPress={noop}>
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
              disabled={!isPrivacyChecked}
            />
          </Wrapper>
        </WrapperWithOrientation>
        <DateTimePicker
          initialTime={birthDate}
          mode="date"
          onUpdate={(time) => {
            setBirthDate(time);
          }}
          setVisible={setIsDatePickerVisible}
          visible={isDatePickerVisible}
        />
      </ScrollView>
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
    backgroundColor: colors.backgroundRgba,
    fontFamily: 'regular',
    fontSize: normalize(16),
    color: colors.darkText,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(8)
  },
  noPaddingTop: {
    paddingTop: 0
  },
  privacyContainer: {
    alignItems: 'flex-start'
  },
  privacyTextContainer: {
    flexShrink: 1
  }
});
