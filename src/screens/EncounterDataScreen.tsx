import { StackScreenProps } from '@react-navigation/stack';
import { noop } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Touchable,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { colors, Icon, texts } from '../config';
import { momentFormat } from '../helpers';
import { useEncounterUser, useSelectImage } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

// TODO: accesibility labels
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EncounterDataScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState<string>();
  const [userIdDisplayValue, setUserIdDisplayValue] = useState<string>();

  const { imageUri, selectImage } = useSelectImage();

  const userData = useEncounterUser();

  const onPressInfoVerification = useCallback(() => {
    navigation.navigate(ScreenName.Html, {
      title: texts.screenTitles.encounterHome,
      query: QUERY_TYPES.PUBLIC_HTML_FILE,
      queryVariables: { name: 'encounter-verification' }
    });
  }, [navigation]);

  const onPressInfoId = useCallback(() => {
    navigation.navigate(ScreenName.Html, {
      title: texts.screenTitles.encounterHome,
      query: QUERY_TYPES.PUBLIC_HTML_FILE,
      queryVariables: { name: 'encounter-user-id' }
    });
  }, [navigation]);

  // TODO: implement
  const updateUserData = noop;

  const userIdInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (userData.loading) {
      return;
    }

    try {
      setBirthDate(new Date(userData.birthDate));
    } catch (e) {
      console.warn('error when parsing the birthdate of the encounter user');
    }
    setFirstName(userData.firstName);
    setLastName(userData.lastName);
    setPhone(userData.phone);
    setUserIdDisplayValue(userData.userId);
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
            <WrapperRow style={styles.infoLabelContainer}>
              <Label>{texts.encounter.verified}</Label>
              <Touchable onPress={onPressInfoVerification}>
                <Icon.Info color={colors.darkText} size={normalize(18)} style={styles.icon} />
              </Touchable>
            </WrapperRow>
            <TextInput
              editable={false}
              style={[styles.inputField, styles.displayField]}
              value={userData.verified ? texts.encounter.verified : texts.encounter.notVerified}
            />
          </Wrapper>
          <Wrapper style={styles.noPaddingTop}>
            <WrapperRow style={styles.infoLabelContainer}>
              <Label>{texts.encounter.id}</Label>
              <Touchable onPress={onPressInfoId}>
                <Icon.Info color={colors.darkText} size={normalize(18)} style={styles.icon} />
              </Touchable>
            </WrapperRow>
            <TextInput
              onChangeText={setUserIdDisplayValue}
              onBlur={() => setUserIdDisplayValue(userData.userId)}
              onTouchStart={() => userIdInputRef.current?.focus()}
              ref={userIdInputRef}
              selectTextOnFocus={true}
              style={[styles.inputField, styles.displayField]}
              value={userIdDisplayValue}
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
  icon: { marginLeft: normalize(8) },
  infoLabelContainer: { alignItems: 'center' },
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
