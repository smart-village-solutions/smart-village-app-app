import { normalizePushReminderSlots } from '../pushNotifications';
import { WasteReminderServerSyncRegistration } from '../pushNotifications/WasteReminderLocalStorage';
import { WasteReminderSettingsByType } from '../reducers';
import { WasteTypeData } from '../types';

export const buildDefaultReminderSettingsByType = (
  usedTypes: WasteTypeData
): WasteReminderSettingsByType =>
  Object.fromEntries(
    Object.entries(usedTypes).map(([typeKey, wasteType]) => {
      const normalizedSlots = normalizePushReminderSlots(wasteType);

      return [
        typeKey,
        {
          enabled: normalizedSlots.slots.length > 0,
          reminders: Object.fromEntries(
            normalizedSlots.slots.map((slot) => [
              slot.id,
              {
                enabled: true,
                leadDays: slot.defaultLeadDays,
                time: '09:00'
              }
            ])
          )
        }
      ];
    })
  );

export const mergeReminderSettingsWithDefaults = (
  defaultSettings: WasteReminderSettingsByType,
  reminderSettingsByType: WasteReminderSettingsByType
): WasteReminderSettingsByType =>
  Object.fromEntries(
    Object.entries(defaultSettings).map(([typeKey, defaultTypeSetting]) => {
      const typeSetting = reminderSettingsByType[typeKey];

      return [
        typeKey,
        {
          ...defaultTypeSetting,
          ...typeSetting,
          reminders: Object.fromEntries(
            Object.entries(defaultTypeSetting.reminders).map(([slotId, defaultSlotSetting]) => [
              slotId,
              {
                ...defaultSlotSetting,
                ...typeSetting?.reminders[slotId]
              }
            ])
          )
        }
      ];
    })
  );

export const buildReminderServerSyncRegistrations = (
  reminderSettingsByType: WasteReminderSettingsByType,
  usedTypes: WasteTypeData,
  selectedTypeKeys: string[],
  notificationSettings: { [key: string]: boolean }
): WasteReminderServerSyncRegistration[] => {
  const selectedTypes = new Set(selectedTypeKeys);
  const completeReminderSettingsByType = mergeReminderSettingsWithDefaults(
    buildDefaultReminderSettingsByType(usedTypes),
    reminderSettingsByType
  );

  return Object.entries(completeReminderSettingsByType).flatMap(([typeKey, typeSetting]) => {
    if (!selectedTypes.has(typeKey)) {
      return [];
    }

    const isTypeActive = !!notificationSettings[typeKey];

    return Object.entries(typeSetting.reminders).map(([slotId, slotSetting]) => ({
      active: isTypeActive && slotSetting.enabled,
      leadDays: slotSetting.leadDays,
      slotId,
      storeId: slotSetting.storeId,
      time: slotSetting.time,
      typeKey
    }));
  });
};
