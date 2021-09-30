import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { normalize } from 'react-native-elements';

import {
  Button,
  DateTimePicker,
  EncounterList,
  ImageWithBadge,
  Label,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Touchable,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { colors, Icon, texts } from '../config';
import { updateUserAsync } from '../encounterApi';
import { momentFormat } from '../helpers';
import { useEncounterUser, useSelectImage } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

const showChangeWarning = (onPressOk: () => void) =>
  Alert.alert(texts.encounter.changeWarningTitle, texts.encounter.changeWarningBody, [
    { style: 'cancel', text: texts.encounter.changeWarningAbort },
    { style: 'destructive', text: texts.encounter.changeWarningOk, onPress: onPressOk }
  ]);

const showChangeErrorAlert = () =>
  Alert.alert(texts.errors.errorTitle, texts.encounter.changeErrorBody);

const showChangeSuccessAlert = () =>
  Alert.alert(texts.encounter.changeSuccessTitle, texts.encounter.changeSuccessBody);

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

  const { error, loading, refresh, refreshing, user, userId } = useEncounterUser();

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
  const updateUserData = async () => {
    if (!(birthDate && firstName && lastName && phone && user && userId)) {
      // the button is disabled, if this is the case, and this should never be called.
      console.warn('User update called with insufficient data');
      return;
    }
    const result = await updateUserAsync({
      birthDate: momentFormat(birthDate.valueOf(), 'yyyy-MM-DD', 'x'),
      firstName,
      imageUri: imageUri ?? user.imageUri,
      lastName,
      phone,
      userId: userId
    });

    if (result === userId) {
      showChangeSuccessAlert();
    } else {
      showChangeErrorAlert();
    }
    refresh();
  };

  const onPressUpdate = () => {
    user?.verified ? showChangeWarning(updateUserData) : updateUserData();
  };

  const userIdInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    try {
      setBirthDate(new Date(user.birthDate));
    } catch (e) {
      console.warn('error when parsing the birthdate of the encounter user');
    }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
    setUserIdDisplayValue(userId);
  }, [user]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!user || error) {
    return (
      <ScrollView refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}>
        <Wrapper>
          <RegularText center>{texts.encounter.errorLoadingUser}</RegularText>
        </Wrapper>
      </ScrollView>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}>
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
                verified={user.verified}
                placeholder={user.imageUri}
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
              value={user.verified ? texts.encounter.verified : texts.encounter.notVerified}
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
              onBlur={() => setUserIdDisplayValue(userId)}
              onTouchStart={() => userIdInputRef.current?.focus()}
              ref={userIdInputRef}
              selectTextOnFocus={true}
              style={[styles.inputField, styles.displayField]}
              value={userIdDisplayValue}
            />
          </Wrapper>
          <Wrapper>
            <Button
              onPress={onPressUpdate}
              title={texts.encounter.saveChanges}
              disabled={!(birthDate && firstName && lastName && phone && user && userId)}
            />
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
