import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Divider, ListItem } from 'react-native-elements';

import {
  deleteReminderSetting,
  getReminderSettings,
  updateReminderSettings
} from '../../pushNotifications';
import { Switch } from '../Switch';
import { BoldText, RegularText } from '../Text';
import { Title } from '../Title';
import { Touchable } from '../Touchable';
import { Radiobutton } from '../Radiobutton';
import { Wrapper, WrapperRow, WrapperWithOrientation } from '../Wrapper';
import { colors, device, texts } from '../../config';
import { ReminderSettings, WasteTypeData } from '../../types';
import {
  ReminderSettingsAction,
  ReminderSettingsActionType,
  reminderSettingsReducer
} from './ReminderSettingsReducer';
import { Button } from '../Button';
import { areValidReminderSettings, parseReminderSettings } from '../../jsonValidation';

const showErrorAlert = () => {
  Alert.alert(texts.wasteCalendar.errorOnUpdateTitle, texts.wasteCalendar.errorOnUpdateBody);
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

const keyExtractor = (item: string) => item;

const CategoryEntry = ({
  active,
  categoryKey,
  categoryName,
  dispatch
}: {
  categoryKey: string;
  categoryName: string;
  active: boolean;
  dispatch: React.Dispatch<ReminderSettingsAction>;
}) => {
  const [switchValue, setSwitchValue] = useState(active);

  const toggleSwitch = useCallback(
    async (value) => {
      setSwitchValue(value);

      dispatch({
        type: ReminderSettingsActionType.UPDATE_ACTIVE_TYPE,
        payload: { key: categoryKey, value }
      });
    },
    [categoryKey, dispatch, setSwitchValue]
  );

  useEffect(() => {
    setSwitchValue(active);
  }, [active, setSwitchValue]);

  return (
    <ListItem
      title={<RegularText>{categoryName}</RegularText>}
      bottomDivider
      rightIcon={<Switch switchValue={switchValue ?? false} toggleSwitch={toggleSwitch} />}
    />
  );
};

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
      const storedSettings = await getReminderSettings();

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

    Object.keys(state.activeTypes).forEach(async (typeKey) => {
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
          reminderTime: `${state.reminderTime.getHours()}:${state.reminderTime.getMinutes()}`,
          wasteType: typeKey
        });
        // save new id
        newState.activeTypes[typeKey].storeId = id;
        errorOccured ||= id === undefined;
      }
    });

    errorOccured = true;

    if (!errorOccured) {
      // update store state entries
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
      keyboardShouldPersistTaps="always"
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => loadStoredSettings(streetName)}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      <WrapperWithOrientation>
        <Wrapper>
          {error ? (
            <RegularText>{texts.wasteCalendar.unableToLoad}</RegularText>
          ) : (
            <>
              <Title>{texts.wasteCalendar.reminder}</Title>
              <BoldText>{texts.wasteCalendar.whichType}</BoldText>
              <FlatList
                data={Object.keys(types)}
                renderItem={({ item }) => (
                  <CategoryEntry
                    active={state.activeTypes[item]?.active}
                    categoryKey={item}
                    categoryName={types[item].label}
                    dispatch={dispatch}
                  />
                )}
                keyExtractor={keyExtractor}
              />
              <RegularText />
              <BoldText>{texts.wasteCalendar.whichDay}</BoldText>
              <ListItem
                title={
                  <RegularText primary={onDayBefore}>
                    {texts.wasteCalendar.onDayBeforeCollection}
                  </RegularText>
                }
                bottomDivider
                Component={Touchable}
                onPress={onPressDayBefore}
                rightIcon={<Radiobutton onPress={onPressDayBefore} selected={onDayBefore} />}
              />
              <ListItem
                title={
                  <RegularText primary={!onDayBefore}>
                    {texts.wasteCalendar.onDayOfCollection}
                  </RegularText>
                }
                bottomDivider
                Component={Touchable}
                onPress={onPressDayOfCollection}
                rightIcon={<Radiobutton onPress={onPressDayOfCollection} selected={!onDayBefore} />}
              />
              <RegularText />
              <BoldText>{texts.wasteCalendar.reminderTime}</BoldText>
              <Wrapper>
                {(device.platform !== 'ios' || !showDatePicker) && (
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <RegularText center big primary>
                      {formatTime(reminderTime)}
                    </RegularText>
                  </TouchableOpacity>
                )}
                {showDatePicker && (
                  <View>
                    {device.platform === 'ios' && (
                      <View>
                        <Divider />
                        <WrapperRow spaceBetween>
                          <TouchableOpacity onPress={onAbortIOS}>
                            <RegularText primary>{texts.dateTimePicker.cancel}</RegularText>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={onAcceptIOS}>
                            <RegularText primary>{texts.dateTimePicker.ok}</RegularText>
                          </TouchableOpacity>
                        </WrapperRow>
                        <Divider />
                      </View>
                    )}
                    <DateTimePicker
                      display={device.platform === 'ios' ? 'spinner' : 'default'}
                      mode="time"
                      onChange={onDatePickerChange}
                      value={localSelectedTime || new Date()}
                    />
                  </View>
                )}
                <RegularText />
                <Button
                  title={texts.wasteCalendar.updateReminderSettings}
                  onPress={updateSettings}
                />
              </Wrapper>
            </>
          )}
        </Wrapper>
      </WrapperWithOrientation>
    </ScrollView>
  );
};
