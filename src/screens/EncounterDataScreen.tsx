import { noop } from 'lodash';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { normalize } from 'react-native-elements';

import {
  Button,
  DateTimePicker,
  EncounterList,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { ImageWithBadge } from '../components/encounter/ImageWithBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { colors, Icon, texts } from '../config';
import { momentFormat } from '../helpers';
import { useEncounterUser } from '../hooks';

const Label = ({ value }: { value: string }) => <RegularText small>{value}</RegularText>;

// TODO: accesibility labels
export const EncounterDataScreen = () => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [givenName, setGivenName] = useState<string>();
  const [familyName, setFamilyName] = useState<string>();
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState<string>();

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
      console.warn('error when parsing the birthdate of the encounter user');
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
      <ScrollView>
        <SectionHeader title={texts.encounter.dataTitle} />
        <WrapperWithOrientation>
          <Wrapper>
            <Label value={texts.encounter.profilePhoto} />
            <WrapperRow spaceBetween>
              {/* This creates an identically sized view independent of the chosen icon to keep the image centered. */}
              <View style={styles.editIconContainer}>
                <Icon.EditSetting color={colors.transparent} />
              </View>
              <ImageWithBadge imageUri={userData.imageUri} verified={userData.verified} />
              <View style={styles.editIconContainer}>
                <Icon.EditSetting color={colors.placeholder} />
              </View>
            </WrapperRow>
          </Wrapper>
          <Wrapper>
            <Label value={texts.encounter.givenName} />
            <TextInput
              onChangeText={setGivenName}
              placeholder={texts.encounter.givenName}
              style={styles.inputField}
              value={givenName}
            />
          </Wrapper>
          <Wrapper>
            <Label value={texts.encounter.familyName} />
            <TextInput
              onChangeText={setFamilyName}
              placeholder={texts.encounter.familyName}
              style={styles.inputField}
              value={familyName}
            />
          </Wrapper>
          <Wrapper>
            <Label value={texts.encounter.birthDate} />
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
                value={momentFormat(birthDate?.valueOf() ?? 0, undefined, 'x')}
              />
            </Pressable>
          </Wrapper>
          <Wrapper>
            <Label value={texts.encounter.phone} />
            <TextInput
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder={texts.encounter.phone}
              style={styles.inputField}
              value={phone}
            />
          </Wrapper>
          <Wrapper>
            {/* TODO: Add Info */}
            <Label value={texts.encounter.verified} />
            <TextInput
              editable={false}
              style={[styles.inputField, styles.displayField]}
              value={userData.verified ? texts.encounter.verified : texts.encounter.notVerified}
            />
          </Wrapper>
          <Wrapper>
            {/* TODO: Add Info */}
            <Label value={texts.encounter.id} />
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
  }
});
