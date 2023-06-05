import _isObjectLike from 'lodash/isObjectLike';

import { ReminderSettingJson, ReminderSettings } from '../types';

import { isArrayOfType } from './basicTypeValidation';

const isValidReminderSetting = (data: unknown): data is ReminderSettingJson => {
  if (!_isObjectLike(data)) {
    return false;
  }

  const {
    city,
    id,
    notify_at,
    notify_days_before,
    notify_for_waste_type,
    street,
    zip
  } = data as ReminderSettingJson;

  return (
    typeof city === 'string' &&
    typeof id === 'number' &&
    typeof notify_at === 'string' &&
    typeof notify_days_before === 'number' &&
    typeof notify_for_waste_type === 'string' &&
    typeof street === 'string' &&
    typeof zip === 'string'
  );
};

export const areValidReminderSettings = (data: unknown): data is ReminderSettingJson[] => {
  return isArrayOfType(data, isValidReminderSetting);
};

export const parseReminderSettings = (
  data: ReminderSettingJson[],
  street: string
): ReminderSettings => {
  const filteredData = data.filter((item) => item.street === street);

  const result: ReminderSettings = {
    activeTypes: {},
    onDayBefore: true,
    reminderTime: new Date('2000-01-01T09:00:00.000+01:00')
  };

  if (filteredData.length) {
    result.onDayBefore = filteredData[0].notify_days_before > 0;
    result.reminderTime = new Date(filteredData[0].notify_at);

    filteredData.forEach((item) => {
      result.activeTypes[item.notify_for_waste_type] = { active: true, storeId: item.id };
    });
  }

  return result;
};
