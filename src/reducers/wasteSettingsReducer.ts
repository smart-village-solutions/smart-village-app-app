import { WasteReminderSettingJson } from '../types';

export type WasteSettingsState = {
  activeTypes: {
    [key: string]: {
      active: boolean;
      storeId?: number | string;
    };
  };
  typeSettings: {
    [key: string]: boolean;
  };
  selectedTypeKeys: string[];
  notificationSettings: {
    [key: string]: boolean;
  };
  showNotificationSettings: boolean;
  onDayBefore: boolean;
  reminderTime: Date;
  reminderSettingsByType: WasteReminderSettingsByType;
};

export type WasteReminderSlotState = {
  enabled: boolean;
  leadDays: number;
  storeId?: number | string;
  time: string;
};

export type WasteReminderSettingsByType = {
  [typeKey: string]: {
    enabled: boolean;
    reminders: {
      [slotId: string]: WasteReminderSlotState;
    };
  };
};

export enum WasteSettingsActions {
  setActiveType = 'setActiveType',
  resetActiveTypes = 'resetActiveTypes',
  setTypeSetting = 'setTypeSetting',
  setInitialWasteSettings = 'setInitialWasteSettings',
  updateWasteSettings = 'updateWasteSettings',
  setNotificationSetting = 'setNotificationSetting',
  setNotificationsEnabled = 'setNotificationsEnabled',
  toggleNotifications = 'toggleNotifications',
  setOnDayBefore = 'setOnDayBefore',
  setReminderTime = 'setReminderTime',
  setReminderSettingsByType = 'setReminderSettingsByType',
  setReminderSlotEnabled = 'setReminderSlotEnabled',
  setReminderSlotLeadDays = 'setReminderSlotLeadDays',
  setReminderSlotTime = 'setReminderSlotTime'
}

type WasteSettingsAction =
  | { type: WasteSettingsActions.setActiveType; payload: { key: string; value: boolean } }
  | {
      type: WasteSettingsActions.resetActiveTypes;
      payload: {
        [key: string]: {
          active: boolean;
          storeId?: number | string;
        };
      };
    }
  | { type: WasteSettingsActions.setTypeSetting; payload: { key: string; value: boolean } }
  | { type: WasteSettingsActions.setInitialWasteSettings; payload: string[] }
  | {
      type: WasteSettingsActions.updateWasteSettings;
      payload: {
        notificationSettings?: { [key: string]: boolean };
        serverSettings: WasteReminderSettingJson[];
        selectedTypeKeys: string[];
      };
    }
  | { type: WasteSettingsActions.toggleNotifications }
  | {
      type: WasteSettingsActions.setNotificationSetting;
      payload: { key: string; value: boolean };
    }
  | { type: WasteSettingsActions.setNotificationsEnabled; payload: boolean }
  | { type: WasteSettingsActions.setOnDayBefore; payload: boolean }
  | { type: WasteSettingsActions.setReminderTime; payload: Date }
  | {
      type: WasteSettingsActions.setReminderSettingsByType;
      payload: WasteReminderSettingsByType;
    }
  | {
      type: WasteSettingsActions.setReminderSlotEnabled;
      payload: { slotId: string; typeKey: string; value: boolean };
    }
  | {
      type: WasteSettingsActions.setReminderSlotLeadDays;
      payload: { slotId: string; typeKey: string; value: number };
    }
  | {
      type: WasteSettingsActions.setReminderSlotTime;
      payload: { slotId: string; typeKey: string; value: string };
    };

/* eslint-disable complexity */
export const wasteSettingsReducer = (
  state: WasteSettingsState,
  action: WasteSettingsAction
): WasteSettingsState => {
  switch (action.type) {
    case WasteSettingsActions.setActiveType: {
      const { key, value } = action.payload;

      return {
        ...state,
        activeTypes: {
          ...state.activeTypes,
          [key]: {
            ...state.activeTypes[key],
            active: value
          }
        }
      };
    }
    case WasteSettingsActions.resetActiveTypes:
      return { ...state, activeTypes: action.payload };
    case WasteSettingsActions.setTypeSetting: {
      const { key, value } = action.payload;

      const updatedTypeSettings = {
        ...state.typeSettings,
        [key]: value
      };

      // Automatically update selectedTypeKeys based on active types
      const selectedTypeKeys = Object.keys(updatedTypeSettings).filter(
        (typeKey) => updatedTypeSettings[typeKey]
      );

      // Update notificationSettings: If a type is deactivated, also deactivate its notifications
      const updatedNotificationSettings = { ...state.notificationSettings };
      const updatedReminderSettingsByType = { ...state.reminderSettingsByType };

      Object.keys(updatedNotificationSettings).forEach((typeKey) => {
        if (updatedTypeSettings[typeKey] === false) {
          updatedNotificationSettings[typeKey] = false;
        }
      });

      if (updatedReminderSettingsByType[key]) {
        updatedReminderSettingsByType[key] = {
          ...updatedReminderSettingsByType[key],
          enabled: value
        };
      }

      return {
        ...state,
        typeSettings: updatedTypeSettings,
        selectedTypeKeys,
        notificationSettings: updatedNotificationSettings,
        reminderSettingsByType: updatedReminderSettingsByType
      };
    }
    case WasteSettingsActions.setInitialWasteSettings: {
      // Set initial values for all other objects based on the used type keys
      const usedTypeKeys = action.payload;

      // Set all active types to false, as there are no settings stored on the server yet
      const activeTypes = usedTypeKeys.reduce((acc, typeKey) => ({ ...acc, [typeKey]: false }), {});

      // Set all type settings to true, as all types should be active by default
      const typeSettings = usedTypeKeys.reduce((acc, typeKey) => ({ ...acc, [typeKey]: true }), {});

      // Set all notification settings to true, as all types should be active by default
      const notificationSettings = usedTypeKeys.reduce(
        (acc, typeKey) => ({ ...acc, [typeKey]: true }),
        {}
      );

      return {
        ...state,
        activeTypes,
        typeSettings,
        selectedTypeKeys: usedTypeKeys,
        notificationSettings,
        reminderSettingsByType: {},
        showNotificationSettings: false
      };
    }
    case WasteSettingsActions.updateWasteSettings: {
      const { notificationSettings: storedNotificationSettings, serverSettings, selectedTypeKeys } =
        action.payload;

      const updatedActiveTypes = serverSettings.reduce(
        (acc: { [key: string]: { active: boolean; storeId?: number | string } }, item) => {
          acc[item.notify_for_waste_type] = { active: true, storeId: item.id };
          return acc;
        },
        {}
      );

      // Ensure that types missing in `filteredData` are set to inactive
      Object.keys(state.activeTypes).forEach((typeKey) => {
        if (!updatedActiveTypes[typeKey]) {
          updatedActiveTypes[typeKey] = { active: false };
        }
      });

      // Set all type settings based on the active status of updatedActiveTypes and if the type is selected
      const typeSettings = Object.fromEntries(
        Object.entries(updatedActiveTypes).map(([typeKey]) => [
          typeKey,
          !!selectedTypeKeys.includes(typeKey)
        ])
      );

      if (!serverSettings.length) {
        const hasStoredActiveNotifications = Object.values(storedNotificationSettings ?? {}).some(
          (active) => !!active
        );

        return {
          ...state,
          typeSettings,
          selectedTypeKeys,
          notificationSettings: storedNotificationSettings ?? {},
          showNotificationSettings: hasStoredActiveNotifications
        };
      }

      // Set all notification settings based on the active status of updatedActiveTypes
      const notificationSettings =
        storedNotificationSettings ??
        Object.fromEntries(
          Object.entries(updatedActiveTypes).map(([typeKey, { active }]) => [typeKey, active])
        );

      // Automatically update showNotificationSettings based on active notifications and
      // turn off "all" settings toggle if all notifications are off.
      const hasActiveNotifications = Object.values(notificationSettings).some((active) => !!active);

      return {
        ...state,
        activeTypes: updatedActiveTypes,
        typeSettings,
        selectedTypeKeys,
        notificationSettings,
        showNotificationSettings: hasActiveNotifications,
        onDayBefore: serverSettings[0].notify_days_before > 0,
        reminderTime: new Date(serverSettings[0].notify_at)
      };
    }
    case WasteSettingsActions.toggleNotifications: {
      const updatedShowNotificationSettings = !state.showNotificationSettings;
      const updatedNotificationSettings = Object.keys(state.typeSettings).reduce(
        (acc: { [key: string]: boolean }, typeKey) => {
          acc[typeKey] = updatedShowNotificationSettings;
          return acc;
        },
        {}
      );
      const updatedReminderSettingsByType = Object.fromEntries(
        Object.entries(state.reminderSettingsByType).map(([typeKey, setting]) => [
          typeKey,
          {
            ...setting,
            enabled: updatedShowNotificationSettings
          }
        ])
      );

      return {
        ...state,
        notificationSettings: updatedNotificationSettings,
        reminderSettingsByType: updatedReminderSettingsByType,
        showNotificationSettings: updatedShowNotificationSettings
      };
    }
    case WasteSettingsActions.setNotificationSetting: {
      const { key, value } = action.payload;

      const updatedNotificationSettings = {
        ...state.notificationSettings,
        [key]: value
      };

      // Automatically update showNotificationSettings based on active notifications and
      // turn off "all" settings toggle if all notifications are off.
      const hasActiveNotifications = Object.values(updatedNotificationSettings).some(
        (active) => !!active
      );

      return {
        ...state,
        notificationSettings: updatedNotificationSettings,
        showNotificationSettings: hasActiveNotifications
      };
    }
    case WasteSettingsActions.setNotificationsEnabled: {
      const updatedNotificationSettings = Object.keys(state.typeSettings).reduce(
        (acc: { [key: string]: boolean }, typeKey) => {
          acc[typeKey] = action.payload;
          return acc;
        },
        {}
      );
      const updatedReminderSettingsByType = Object.fromEntries(
        Object.entries(state.reminderSettingsByType).map(([typeKey, setting]) => [
          typeKey,
          {
            ...setting,
            enabled: action.payload
          }
        ])
      );

      return {
        ...state,
        notificationSettings: updatedNotificationSettings,
        reminderSettingsByType: updatedReminderSettingsByType,
        showNotificationSettings: action.payload
      };
    }
    case WasteSettingsActions.setOnDayBefore:
      return { ...state, onDayBefore: action.payload };
    case WasteSettingsActions.setReminderTime:
      return { ...state, reminderTime: action.payload };
    case WasteSettingsActions.setReminderSettingsByType:
      return { ...state, reminderSettingsByType: action.payload };
    case WasteSettingsActions.setReminderSlotEnabled:
      return updateReminderSlotState(state, action.payload.typeKey, action.payload.slotId, {
        enabled: action.payload.value
      });
    case WasteSettingsActions.setReminderSlotLeadDays:
      return updateReminderSlotState(state, action.payload.typeKey, action.payload.slotId, {
        leadDays: action.payload.value
      });
    case WasteSettingsActions.setReminderSlotTime:
      return updateReminderSlotState(state, action.payload.typeKey, action.payload.slotId, {
        time: action.payload.value
      });
    default:
      return state;
  }
};
/* eslint-enable complexity */

const updateReminderSlotState = (
  state: WasteSettingsState,
  typeKey: string,
  slotId: string,
  slotUpdate: Partial<WasteReminderSlotState>
): WasteSettingsState => {
  const typeSetting = state.reminderSettingsByType[typeKey];
  const slotSetting = typeSetting?.reminders[slotId];

  if (!typeSetting || !slotSetting) {
    return state;
  }

  return {
    ...state,
    reminderSettingsByType: {
      ...state.reminderSettingsByType,
      [typeKey]: {
        ...typeSetting,
        reminders: {
          ...typeSetting.reminders,
          [slotId]: {
            ...slotSetting,
            ...slotUpdate
          }
        }
      }
    }
  };
};
