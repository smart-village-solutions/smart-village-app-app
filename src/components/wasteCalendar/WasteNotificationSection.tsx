import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Divider, ListItem } from 'react-native-elements';

import { addToStore, readFromStore } from '../../helpers';
import {
  handleSystemPermissions,
  showSystemPermissionMissingDialog
} from '../../pushNotifications';
import { Switch } from '../Switch';
import { BoldText, RegularText } from '../Text';
import { Title } from '../Title';
import { Touchable } from '../Touchable';
import { Radiobutton } from '../Radiobutton';
import { Wrapper, WrapperRow } from '../Wrapper';
import { device, texts } from '../../config';
import { ReminderSettings, WasteCollectionCalendarData } from '../../types';
import {
  ReminderSettingsAction,
  ReminderSettingsActionType,
  reminderSettingsReducer
} from './ReminderSettingsReducer';
import { Button } from '../Button';

const SETTINGS_STORE_KEY = 'WASTE_COLLECTION_REMINDER_SETTINGS';

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

      if (value) {
        const systemPermission = await handleSystemPermissions();
        if (!systemPermission) {
          setSwitchValue(false);
          showSystemPermissionMissingDialog();
          return;
        }
      }

      dispatch({
        type: ReminderSettingsActionType.UPDATE_ACTIVE_TYPE,
        payload: { key: categoryKey, value }
      });
    },
    [categoryKey, dispatch, setSwitchValue]
  );

  return (
    <ListItem
      title={<RegularText>{categoryName}</RegularText>}
      bottomDivider
      rightIcon={<Switch switchValue={switchValue ?? false} toggleSwitch={toggleSwitch} />}
    />
  );
};

export const WasteNotificationSection = ({ data }: { data: WasteCollectionCalendarData }) => {
  const [state, dispatch] = useReducer(reminderSettingsReducer, initialSettings);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { onDayBefore, reminderTime } = state;

  // this state stores the value of the DateTimePicker
  const [localSelectedTime, setLocalSelectedTime] = useState<Date>(new Date());

  const updateSettings = useCallback(async () => {
    // updateNotifications(updatedSettings, data); // TODO: outsource to backend push notifications
    addToStore(SETTINGS_STORE_KEY, state);
  }, [state]);

  const onAbortIOS = useCallback(() => {
    setShowDatePicker(false);
    setLocalSelectedTime(state.reminderTime);
  }, [state.reminderTime, setLocalSelectedTime, setShowDatePicker]);

  const onAcceptIOS = useCallback(() => {
    setShowDatePicker(false);
    dispatch({ type: ReminderSettingsActionType.UPDATE_TIME, payload: localSelectedTime });
  }, [localSelectedTime, setShowDatePicker, dispatch]);

  const onDatePickerChange = useCallback(
    (_, newTime) => {
      if (device.platform === 'android') {
        setShowDatePicker(false);

        if (newTime) {
          dispatch({ type: ReminderSettingsActionType.UPDATE_TIME, payload: newTime });
        }
      }

      setLocalSelectedTime((time) => newTime || time);
    },
    [setLocalSelectedTime]
  );

  const loadStoredSettings = useCallback(async () => {
    const storedSettings = await readFromStore(SETTINGS_STORE_KEY);
    const newSettings: ReminderSettings = storedSettings ?? initialSettings;

    // constructing a new date is required here,
    // as the value loaded from the store is missing the selector functions
    newSettings.reminderTime = new Date(newSettings.reminderTime);

    dispatch({ type: ReminderSettingsActionType.OVERWRITE, payload: newSettings });

    setLoading(false);
  }, [setLoading, dispatch]);

  useEffect(() => {
    loadStoredSettings();
  }, [loadStoredSettings]);

  if (loading) return null;

  return (
    <View>
      <Title>{texts.wasteCalendar.reminder}</Title>
      <BoldText>{texts.wasteCalendar.whichType}</BoldText>
      <FlatList
        data={Object.keys(data)}
        renderItem={({ item }) => (
          <CategoryEntry
            active={state.activeTypes[item]}
            categoryKey={item}
            categoryName={data[item].name}
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
        onPress={() =>
          dispatch({ type: ReminderSettingsActionType.UPDATE_ON_DAY_BEFORE, payload: true })
        }
        rightIcon={<Radiobutton selected={onDayBefore} />}
      />
      <ListItem
        title={
          <RegularText primary={!onDayBefore}>{texts.wasteCalendar.onDayOfCollection}</RegularText>
        }
        bottomDivider
        Component={Touchable}
        onPress={() =>
          dispatch({ type: ReminderSettingsActionType.UPDATE_ON_DAY_BEFORE, payload: false })
        }
        rightIcon={<Radiobutton selected={!onDayBefore} />}
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
        <Button title={texts.wasteCalendar.updateReminderSettings} onPress={updateSettings} />
      </Wrapper>
    </View>
  );
};
