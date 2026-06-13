import { WasteReminderServerSyncRegistration } from '../pushNotifications/WasteReminderLocalStorage';

type WasteGlobalSettings = Record<string, unknown> & {
  waste?: Record<string, unknown>;
};

type SaveWasteReminderSettingsParams = {
  dispatchActiveType: (typeKey: string, value: boolean) => void;
  globalSettings: WasteGlobalSettings;
  notificationSettings: Record<string, boolean>;
  persistGlobalSettings: (settings: WasteGlobalSettings) => Promise<unknown>;
  scheduleLocalReminderSettings: () => Promise<{
    localCoverageUntil?: Date;
    reminderSyncRegistrations?: WasteReminderServerSyncRegistration[];
  }>;
  selectedStreetId?: number;
  selectedTypeKeys: string[];
  setGlobalSettings: (settings: WasteGlobalSettings) => void;
  streetName?: string;
  updateSettings: (
    localCoverageUntil?: Date,
    reminderSyncRegistrations?: WasteReminderServerSyncRegistration[]
  ) => Promise<unknown>;
  waste: Record<string, unknown>;
};

export const saveWasteReminderSettings = async ({
  dispatchActiveType,
  globalSettings,
  notificationSettings,
  persistGlobalSettings,
  scheduleLocalReminderSettings,
  selectedStreetId,
  selectedTypeKeys,
  setGlobalSettings,
  streetName,
  updateSettings,
  waste
}: SaveWasteReminderSettingsParams) => {
  const { reminderSyncRegistrations, localCoverageUntil } = await scheduleLocalReminderSettings();
  const nextGlobalSettings = {
    ...globalSettings,
    waste: {
      ...waste,
      streetName,
      streetId: selectedStreetId,
      selectedTypeKeys
    }
  };

  await persistGlobalSettings(nextGlobalSettings);
  setGlobalSettings(nextGlobalSettings);

  Object.entries(notificationSettings).forEach(([typeKey, typeValue]) =>
    dispatchActiveType(typeKey, typeValue)
  );

  await updateSettings(localCoverageUntil, reminderSyncRegistrations);
};
