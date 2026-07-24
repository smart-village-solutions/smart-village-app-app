import { formatWasteReminderTime } from '../helpers/wasteReminderTimeHelper';
import { WasteReminderSettingsByType } from '../reducers';
import { WasteReminderSettingJson, WasteTypeData } from '../types';

import { normalizePushReminderSlots } from './WasteReminderConfig';
import { WasteReminderServerSyncRegistration } from './WasteReminderLocalStorage';

type ReminderRegistration = WasteReminderServerSyncRegistration & {
  active?: boolean;
};

const buildDisabledReminderSettingsByType = (
  usedTypes: WasteTypeData
): WasteReminderSettingsByType =>
  Object.fromEntries(
    Object.entries(usedTypes).map(([typeKey, wasteType]) => [
      typeKey,
      {
        enabled: false,
        reminders: Object.fromEntries(
          normalizePushReminderSlots(wasteType).slots.map((slot) => [
            slot.id,
            {
              enabled: false,
              leadDays: slot.defaultLeadDays,
              time: '09:00'
            }
          ])
        )
      }
    ])
  );

export const buildReminderSettingsFromRegistrations = (
  usedTypes: WasteTypeData,
  registrations: ReminderRegistration[]
): WasteReminderSettingsByType => {
  const reminderSettingsByType = buildDisabledReminderSettingsByType(usedTypes);

  registrations.forEach((registration) => {
    const typeSetting = reminderSettingsByType[registration.typeKey];
    const slotSetting = typeSetting?.reminders[registration.slotId];

    if (!typeSetting || !slotSetting || registration.active === false) {
      return;
    }

    typeSetting.enabled = true;
    typeSetting.reminders[registration.slotId] = {
      enabled: true,
      leadDays: registration.leadDays,
      storeId: registration.storeId,
      time: registration.time
    };
  });

  return reminderSettingsByType;
};

export const buildReminderSettingsFromServerSettings = (
  usedTypes: WasteTypeData,
  serverSettings: WasteReminderSettingJson[]
): WasteReminderSettingsByType =>
  buildReminderSettingsFromRegistrations(
    usedTypes,
    serverSettings.map((setting) => ({
      active: true,
      leadDays: setting.notify_days_before,
      slotId: setting.reminder_slot_id ?? 'default',
      storeId: setting.id,
      time: formatWasteReminderTime(new Date(setting.notify_at)),
      typeKey: setting.notify_for_waste_type
    }))
  );
