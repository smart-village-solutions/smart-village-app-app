import { noop } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { normalize } from 'react-native-elements';

import {
  Button,
  DateTimePicker,
  EncounterList,
  ImageWithBadge,
  Label,
  LoadingSpinner,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { colors, Icon, texts } from '../config';
import { momentFormat } from '../helpers';
import { useEncounterUser, useSelectImage } from '../hooks';

// TODO: accesibility labels
export const EncounterDataScreen = () => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [givenName, setGivenName] = useState<string>();
  const [familyName, setFamilyName] = useState<string>();
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState<string>();

  const { imageUri, selectImage } = useSelectImage();

  const userData = useEncounterUser();

  // TODO: implement
  const updateUserData = noop;

  useEffect(() => {
    if (userData.loading) {
      return;
    }

    try {
      setBirthDate(new Date(userData.birthDate));
    } catch (e) {
      console.warn('error when parsing the birth date of the encounter user');
    }
    setGivenName(userData.firstName);
    setFamilyName(userData.lastName);
    setPhone(userData.phone);
  }, [userData]);

  if (userData.loading) {
    return <LoadingSpinner loading />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView keyboardShouldPersistTaps="handled">
        <SectionHeader title={texts.encounter.dataTitle} />
        <WrapperWithOrientation>
          <Wrapper>
            <Label>{texts.encounter.profilePhoto}</Label>
            <WrapperRow spaceBetween>
              {/* This creates an identically sized view independent of the chosen icon to keep the image centered. */}
              <View style={styles.editIconContainer}>
                <Icon.EditSetting color={colors.transparent} />
              </View>
              <ImageWithBadge
                imageUri={imageUri}
                verified={userData.verified}
                placeholder={userData.imageUri}
              />
              <TouchableOpacity onPress={selectImage} style={styles.editIconContainer}>
                <Icon.EditSetting color={colors.placeholder} />
              </TouchableOpacity>
            </WrapperRow>
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.givenName}</Label>
            <TextInput
              onChangeText={setGivenName}
              placeholder={texts.encounter.givenName}
              style={styles.inputField}
              value={givenName}
            />
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.familyName}</Label>
            <TextInput
              onChangeText={setFamilyName}
              placeholder={texts.encounter.familyName}
              style={styles.inputField}
              value={familyName}
            />
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <Label>{texts.encounter.birthDate}</Label>
            <Pressable
              onPress={() => {
                // without setting it to false first, it sometimes did not properly show
                setIsDatePickerVisible(false);
                setIsDatePickerVisible(true);
              }}
              onStartShouldSetResponderCapture={() => true}
            >
              <TextInput
                editable={false}
                placeholder={texts.encounter.birthDate}
                style={styles.inputField}
                value={momentFormat(birthDate?.toISOString() ?? 0)}
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
            {/* TODO: Add Info */}
            <Label>{texts.encounter.verified}</Label>
            <TextInput
              editable={false}
              style={[styles.inputField, styles.displayField]}
              value={userData.verified ? texts.encounter.verified : texts.encounter.notVerified}
            />
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            {/* TODO: Add Info */}
            <Label>{texts.encounter.id}</Label>
            <TextInput
              editable={false}
              style={[styles.inputField, styles.displayField]}
              value={userData.userId}
            />
          </Wrapper>
          <Wrapper>
            <Button onPress={updateUserData} title={texts.encounter.saveChanges} />
          </Wrapper>
        </WrapperWithOrientation>
        <EncounterList />
        <DateTimePicker
          initialTime={birthDate}
          mode="date"
          onUpdate={setBirthDate}
          setVisible={setIsDatePickerVisible}
          visible={isDatePickerVisible}
        />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  editIconContainer: {
    justifyContent: 'flex-end'
  },
  displayField: {
    backgroundColor: colors.surface,
    borderColor: colors.placeholder,
    borderWidth: 1
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
  }
});
