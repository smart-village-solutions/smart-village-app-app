import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ListItem } from 'react-native-elements';

import { colors, consts, device, normalize, texts } from '../../config';
import { areValidReminderSettings, parseReminderSettings } from '../../jsonValidation';
import {
  deleteReminderSetting,
  getReminderSettings,
  updateReminderSettings
} from '../../pushNotifications';
import { ReminderSettings, WasteTypeData } from '../../types';
import { Button } from '../Button';
import { FeedbackFooter } from '../FeedbackFooter';
import { Radiobutton } from '../Radiobutton';
import { SectionHeader } from '../SectionHeader';
import { Switch } from '../Switch';
import { BoldText, RegularText } from '../Text';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperHorizontal, WrapperRow } from '../Wrapper';

import {
  ReminderSettingsAction,
  ReminderSettingsActionType,
  reminderSettingsReducer
} from './ReminderSettingsReducer';

const showErrorAlert = () => {
  Alert.alert(texts.wasteCalendar.errorOnUpdateTitle, texts.wasteCalendar.errorOnUpdateBody);
};

const showSuccessAlert = () => {
  Alert.alert(texts.wasteCalendar.updateSuccess);
};

const initialReminderTime = new Date();
initialReminderTime.setHours(9);
initialReminderTime.setMinutes(0);

const initialSettings: ReminderSettings = {
  activeTypes: {},
  onDayBefore: true,
  reminderTime: initialReminderTime
};

const formatTime = (time: Date) => {
  const minutes = time.getMinutes();
  const hours = time.getHours();

  let minutesString = minutes.toString();
  if (minutes < 10) minutesString = `0${minutesString}`;

  return `${hours}:${minutesString} Uhr`;
};

const keyExtractor = (item: string, index: number) => `index${index}-item${item}`;

const CategoryEntry = ({
  active,
  categoryKey,
  categoryName,
  dispatch,
  bottomDivider
}: {
  categoryKey: string;
  categoryName: string;
  active: boolean;
  dispatch: React.Dispatch<ReminderSettingsAction>;
  bottomDivider: boolean;
}) => {
  const [switchValue, setSwitchValue] = useState(active);

  const toggleSwitch = useCallback(
    (value) => {
      setSwitchValue(value);
      dispatch({
        type: ReminderSettingsActionType.UPDATE_ACTIVE_TYPE,
        payload: { key: categoryKey, value }
      });
    },
    [categoryKey, dispatch, setSwitchValue]
  );

  const onPress = useCallback(() => {
    toggleSwitch(!switchValue);
  }, [switchValue, toggleSwitch]);

  useEffect(() => {
    setSwitchValue(active);
  }, [active, setSwitchValue]);

  return (
    <ListItem
      bottomDivider={bottomDivider}
      containerStyle={styles.switchContainer}
      onPress={onPress}
      delayPressIn={0}
      Component={Touchable}
      accessibilityLabel={`(${categoryName}) ${consts.a11yLabel.button}`}
    >
      <ListItem.Content>
        <RegularText>{categoryName}</RegularText>
      </ListItem.Content>

      <Switch switchValue={switchValue ?? false} toggleSwitch={toggleSwitch} />
    </ListItem>
  );
};

// TODO: use the new DateTimePicker component
export const WasteReminderSettings = ({
  types,
  locationData
}: {
  types: WasteTypeData;
  locationData: { city: string; street: string; zip: string };
}) => {
  const [state, dispatch] = useReducer(reminderSettingsReducer, initialSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const streetName = locationData.street;

  const { onDayBefore, reminderTime } = state;

  // this state stores the value of the DateTimePicker
  const [localSelectedTime, setLocalSelectedTime] = useState<Date>(new Date());

  const loadStoredSettings = useCallback(
    async (street: string) => {
      setLoading(true);
      setError(false);

      // replace null values with empty strings for city and zip in storedSettings to prevent validation issues
      const storedSettings = (await getReminderSettings()).map((setting: ReminderSettingJson) => ({
        ...setting,
        city: setting.city ?? '',
        zip: setting.zip ?? ''
      }));

      if (!areValidReminderSettings(storedSettings)) {
        setError(true);
        setLoading(false);
      } else {
        const newSettings: ReminderSettings = parseReminderSettings(storedSettings, street);

        // TODO: fix label for stored settings of inactive types ans show them as well
        // initialize uninitialized types with false
        Object.keys(types).forEach((key) => {
          newSettings.activeTypes[key] ??= { active: false };
        });

        dispatch({ type: ReminderSettingsActionType.OVERWRITE, payload: newSettings });
        setLocalSelectedTime(newSettings.reminderTime);

        setLoading(false);
      }
    },
    [dispatch, setError, setLoading, types]
  );

  const onAbortIOS = useCallback(() => {
    setShowDatePicker(false);
    setLocalSelectedTime(state.reminderTime);
  }, [state.reminderTime, setLocalSelectedTime, setShowDatePicker]);

  const onAcceptIOS = useCallback(() => {
    setShowDatePicker(false);
    dispatch({ type: ReminderSettingsActionType.UPDATE_TIME, payload: localSelectedTime });
  }, [localSelectedTime, setShowDatePicker, dispatch]);

  const onDatePickerChange = useCallback(
    (_, newTime?: Date) => {
      if (device.platform === 'android') {
        setShowDatePicker(false);

        if (newTime) {
          newTime.setMilliseconds(0);
          newTime.setSeconds(0);
          dispatch({ type: ReminderSettingsActionType.UPDATE_TIME, payload: newTime });
        }
      }

      setLocalSelectedTime((time) => newTime || time);
    },
    [setLocalSelectedTime]
  );

  const onPressDayBefore = useCallback(
    () => dispatch({ type: ReminderSettingsActionType.UPDATE_ON_DAY_BEFORE, payload: true }),
    [dispatch]
  );

  const onPressDayOfCollection = useCallback(
    () => dispatch({ type: ReminderSettingsActionType.UPDATE_ON_DAY_BEFORE, payload: false }),
    [dispatch]
  );

  const updateSettings = useCallback(async () => {
    const newState = { ...state };
    let errorOccured = false;

    await Promise.all(
      Object.keys(state.activeTypes).map(async (typeKey) => {
        const entry = state.activeTypes[typeKey];
        // delete inactive entries
        if (!entry.active && entry.storeId) {
          const success = await deleteReminderSetting(entry.storeId);

          errorOccured ||= !success;
        }

        if (entry.active) {
          // update setting
          const id = await updateReminderSettings({
            ...locationData,
            onDayBefore: state.onDayBefore,
            reminderTime,
            wasteType: typeKey
          });

          // save new id
          newState.activeTypes[typeKey].storeId = id;
          errorOccured ||= id === undefined;
        }
      })
    );

    if (!errorOccured) {
      // update store state entries
      showSuccessAlert();
      dispatch({ type: ReminderSettingsActionType.OVERWRITE, payload: newState });
    } else {
      // show alert and refetch data to avoid incorrect local state
      showErrorAlert();
      loadStoredSettings(streetName);
    }
  }, [locationData, state]);

  useEffect(() => {
    loadStoredSettings(streetName);
  }, [loadStoredSettings, streetName]);

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => loadStoredSettings(streetName)}
          colors={[colors.refreshControl]}
          tintColor={colors.refreshControl}
        />
      }
    >
      {error ? (
        <Wrapper>
          <RegularText>{texts.wasteCalendar.unableToLoad}</RegularText>
        </Wrapper>
      ) : (
        <>
          <SectionHeader title={texts.wasteCalendar.reminder} />
          <Wrapper>
            <BoldText>{texts.wasteCalendar.whichType}</BoldText>
            <FlatList
              data={Object.keys(types)}
              renderItem={({ item, index }) => (
                <CategoryEntry
                  active={state.activeTypes[item]?.active}
                  categoryKey={item}
                  categoryName={types[item].label}
                  dispatch={dispatch}
                  bottomDivider={index < Object.keys(types).length - 1}
                />
              )}
              keyExtractor={keyExtractor}
            />
            <RegularText />
            <BoldText>{texts.wasteCalendar.whichDay}</BoldText>
            <ListItem
              bottomDivider
              onPress={onPressDayBefore}
              delayPressIn={0}
              Component={Touchable}
            >
              <ListItem.Content>
                <RegularText primary={onDayBefore}>
                  {texts.wasteCalendar.onDayBeforeCollection}
                </RegularText>
              </ListItem.Content>

              <Radiobutton
                onPress={onPressDayBefore}
                selected={onDayBefore}
                containerStyle={styles.radioContainer}
              />
            </ListItem>
            <ListItem onPress={onPressDayOfCollection} delayPressIn={0} Component={Touchable}>
              <ListItem.Content>
                <RegularText primary={!onDayBefore}>
                  {texts.wasteCalendar.onDayOfCollection}
                </RegularText>
              </ListItem.Content>

              <Radiobutton
                onPress={onPressDayOfCollection}
                selected={!onDayBefore}
                containerStyle={styles.radioContainer}
              />
            </ListItem>
            <RegularText />
            <BoldText>{texts.wasteCalendar.reminderTime}</BoldText>
            <Wrapper>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <RegularText center big primary>
                  {formatTime(reminderTime)}
                </RegularText>
              </TouchableOpacity>
              {device.platform === 'ios' && (
                <Modal
                  animationType="none"
                  transparent={true}
                  visible={showDatePicker}
                  supportedOrientations={['landscape', 'portrait']}
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.dateTimePickerContainerIOS}>
                      <SafeAreaView>
                        <WrapperHorizontal style={styles.paddingTop}>
                          <WrapperRow spaceBetween>
                            <TouchableOpacity onPress={onAbortIOS}>
                              <BoldText primary>{texts.dateTimePicker.cancel}</BoldText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onAcceptIOS}>
                              <BoldText primary>{texts.dateTimePicker.ok}</BoldText>
                            </TouchableOpacity>
                          </WrapperRow>
                        </WrapperHorizontal>

                        <DateTimePicker
                          display="spinner"
                          mode="time"
                          onChange={onDatePickerChange}
                          value={localSelectedTime || new Date()}
                          textColor={colors.darkText}
                        />
                      </SafeAreaView>
                    </View>
                  </View>
                </Modal>
              )}
              {device.platform === 'android' && showDatePicker && (
                <DateTimePicker
                  mode="time"
                  onChange={onDatePickerChange}
                  value={localSelectedTime || new Date()}
                />
              )}
              <RegularText />
              <Button title={texts.wasteCalendar.updateReminderSettings} onPress={updateSettings} />
            </Wrapper>
          </Wrapper>
        </>
      )}
      <FeedbackFooter />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    backgroundColor: colors.transparent,
    padding: 0,
    paddingVertical: normalize(12)
  },
  dateTimePickerContainerIOS: {
    backgroundColor: colors.surface
  },
  modalContainer: {
    backgroundColor: colors.overlayRgba,
    flex: 1,
    justifyContent: 'flex-end'
  },
  paddingTop: {
    paddingTop: normalize(14)
  },
  radioContainer: {
    backgroundColor: colors.transparent,
    paddingVertical: device.platform === 'ios' ? normalize(3.125) : normalize(0)
  }
});
