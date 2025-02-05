import _isObjectLike from 'lodash/isObjectLike';

import { WasteReminderSettingJson } from '../types';

import { isArrayOfType } from './basicTypeValidation';

const isValidReminderSetting = (data: unknown): data is WasteReminderSettingJson => {
  if (!_isObjectLike(data)) {
    return false;
  }

  const { city, id, notify_at, notify_days_before, notify_for_waste_type, street, zip } =
    data as WasteReminderSettingJson;

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

export const areValidReminderSettings = (data: unknown): data is WasteReminderSettingJson[] => {
  return isArrayOfType(data, isValidReminderSetting);
};
