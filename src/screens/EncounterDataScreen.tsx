import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useEffect, useState } from 'react';
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

import {
  Button,
  DateTimePicker,
  DefaultKeyboardAvoidingView,
  EncounterList,
  ImageWithBadge,
  Label,
  LoadingSpinner,
  RegularText,
  SafeAreaViewFlex,
  SectionHeader,
  Wrapper,
  WrapperRow
} from '../components';
import { Icon, colors, consts, normalize, texts } from '../config';
import { updateUserAsync } from '../encounterApi';
import { momentFormat } from '../helpers';
import { useEncounterSupportId, useEncounterUser, useSelectImage } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { ScreenName } from '../types';

const INFO_ICON_SIZE = normalize(14);

const a11yLabels = consts.a11yLabel;

const showChangeWarning = (onPressOk: () => void) =>
  Alert.alert(texts.encounter.changeWarningTitle, texts.encounter.changeWarningBody, [
    { style: 'cancel', text: texts.encounter.changeWarningAbort },
    { style: 'destructive', text: texts.encounter.changeWarningOk, onPress: onPressOk }
  ]);

const showChangeErrorAlert = () =>
  Alert.alert(texts.errors.errorTitle, texts.encounter.changeErrorBody);

const showChangeSuccessAlert = () =>
  Alert.alert(texts.encounter.changeSuccessTitle, texts.encounter.changeSuccessBody);

// eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any
export const EncounterDataScreen = ({ navigation }: StackScreenProps<any>) => {
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [birthDate, setBirthDate] = useState<Date>();
  const [phone, setPhone] = useState<string>();

  // only allow to submit changes, if at least one field was changed
  const [hasChanges, setHasChanges] = useState(false);

  // wrapper for the setter functions to trigger an update to "hasChanges" on a change
  const onChange = useCallback(
    <T,>(
        setter: React.Dispatch<React.SetStateAction<T>>
      ): React.Dispatch<React.SetStateAction<T>> =>
      (arg) => {
        setHasChanges(true);
        setter(arg);
      },
    []
  );

  const { imageUri, selectImage } = useSelectImage({ onChange });

  const {
    error: errorSupportId,
    loading: loadingSupportId,
    refresh: refreshSupportId,
    refreshing: refreshingSupportId,
    supportId
  } = useEncounterSupportId();

  const {
    error: errorUser,
    loading: loadingUser,
    refresh: refreshUser,
    refreshing: refreshingUser,
    user,
    userId
  } = useEncounterUser();

  const refreshing = refreshingSupportId || refreshingUser;
  const loading = loadingSupportId || loadingUser;
  const error = errorSupportId || errorUser;

  const refresh = useCallback(() => {
    refreshSupportId();
    refreshUser();
  }, [refreshSupportId, refreshUser]);

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

  const updateUserData = async () => {
    if (!(birthDate && firstName && lastName && phone && userId)) {
      // the button is disabled, if this is the case, and this should never be called.
      console.warn('User update called with insufficient data');
      return;
    }

    const result = await updateUserAsync({
      birthDate: momentFormat(birthDate.valueOf(), 'yyyy-MM-DD', 'x'),
      firstName,
      imageUri,
      lastName,
      phone,
      userId
    });

    if (result === userId) {
      showChangeSuccessAlert();
      setHasChanges(false);
    } else {
      showChangeErrorAlert();
    }
    refresh();
  };

  const onPressUpdate = () => {
    user?.verified ? showChangeWarning(updateUserData) : updateUserData();
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    try {
      setBirthDate(new Date(user.birthDate));
    } catch (e) {
      console.warn('error when parsing the birth date of the encounter user');
    }
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
  }, [user]);

  if (loading) {
    return <LoadingSpinner loading />;
  }

  if (!user || error) {
    return (
      <SafeAreaViewFlex>
        <ScrollView refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}>
          <Wrapper>
            <RegularText center>{texts.encounter.errorLoadingUser}</RegularText>
          </Wrapper>
        </ScrollView>
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <DefaultKeyboardAvoidingView>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} />}
        >
          <SectionHeader title={texts.encounter.dataTitle} />
          <Wrapper>
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
                <ImageWithBadge
                  imageUri={imageUri}
                  verified={user.verified}
                  placeholder={user.imageUri}
                />
                <View style={styles.editIconContainer}>
                  <Icon.EditSetting color={colors.placeholder} />
                </View>
              </WrapperRow>
            </TouchableOpacity>
          </Wrapper>
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.firstName}</Label>
            <TextInput
              accessibilityLabel={`${a11yLabels.firstName} ${a11yLabels.textInput}: ${firstName}`}
              onChangeText={onChange(setFirstName)}
              placeholder={texts.encounter.firstName}
              style={styles.inputField}
              value={firstName}
            />
          </Wrapper>
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.lastName}</Label>
            <TextInput
              accessibilityLabel={`${a11yLabels.lastName} ${a11yLabels.textInput}: ${lastName}`}
              onChangeText={onChange(setLastName)}
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
          <Wrapper noPaddingTop>
            <Label>{texts.encounter.phone}</Label>
            <TextInput
              accessibilityLabel={`${a11yLabels.phoneNumber} ${a11yLabels.textInput}: ${phone}`}
              keyboardType="phone-pad"
              onChangeText={onChange(setPhone)}
              placeholder={texts.encounter.phone}
              style={styles.inputField}
              value={phone}
            />
          </Wrapper>
          <Wrapper noPaddingTop>
            <WrapperRow style={styles.infoLabelContainer}>
              <Label>{texts.encounter.status}</Label>
              <TouchableOpacity
                accessibilityLabel={`${a11yLabels.verifiedInfo} ${a11yLabels.button}`}
                onPress={onPressInfoVerification}
              >
                <Icon.Info color={colors.darkText} size={INFO_ICON_SIZE} style={styles.icon} />
              </TouchableOpacity>
            </WrapperRow>
            <TextInput
              accessibilityLabel={`${a11yLabels.verified} (${
                user.verified ? texts.encounter.verified : texts.encounter.notVerified
              })`}
              editable={false}
              style={styles.inputField}
              value={user.verified ? texts.encounter.verified : texts.encounter.notVerified}
            />
          </Wrapper>
          <Wrapper noPaddingTop>
            <WrapperRow style={styles.infoLabelContainer}>
              <Label>{texts.encounter.supportId}</Label>
              <TouchableOpacity
                accessibilityLabel={`${a11yLabels.encounterIdInfo} ${a11yLabels.button}`}
                onPress={onPressInfoId}
              >
                <Icon.Info color={colors.darkText} size={INFO_ICON_SIZE} style={styles.icon} />
              </TouchableOpacity>
            </WrapperRow>
            <View style={[styles.inputField, styles.supportIdContainer]}>
              <RegularText big selectable>
                {supportId}
              </RegularText>
            </View>
          </Wrapper>
          <Wrapper>
            <Button
              onPress={onPressUpdate}
              title={texts.encounter.saveChanges}
              disabled={!(birthDate && firstName && lastName && phone && userId) || !hasChanges}
            />
          </Wrapper>
          <EncounterList />
          <DateTimePicker
            initialTime={birthDate}
            mode="date"
            onUpdate={onChange(setBirthDate)}
            setVisible={setIsDatePickerVisible}
            visible={isDatePickerVisible}
          />
        </ScrollView>
      </DefaultKeyboardAvoidingView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  editIconContainer: {
    justifyContent: 'flex-end'
  },
  icon: { marginLeft: normalize(8) },
  infoLabelContainer: { alignItems: 'center' },
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
  supportIdContainer: {
    paddingBottom: normalize(7),
    paddingTop: normalize(9)
  }
});
