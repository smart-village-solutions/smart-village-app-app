import { handleSystemPermissions } from '../pushNotifications';
import { WasteReminderSettingJson } from '../types';

export type WasteSettingsState = {
  activeTypes: {
    [key: string]: {
      active: boolean;
      storeId?: number | string;
    };
  };
  activeTypesForOldStreet?: {
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
};

export enum WasteSettingsActions {
  setActiveType = 'setActiveType',
  setActiveTypesForOldStreet = 'setActiveTypesForOldStreet',
  resetActiveTypesWithOldStreetCleanup = 'resetActiveTypesWithOldStreetCleanup',
  setTypeSetting = 'setTypeSetting',
  setInitialWasteSettings = 'setInitialWasteSettings',
  updateWasteSettings = 'updateWasteSettings',
  setNotificationSetting = 'setNotificationSetting',
  toggleNotifications = 'toggleNotifications',
  setOnDayBefore = 'setOnDayBefore',
  setReminderTime = 'setReminderTime'
}

type WasteSettingsAction =
  | { type: WasteSettingsActions.setActiveType; payload: { key: string; value: boolean } }
  | {
      type: WasteSettingsActions.setActiveTypesForOldStreet;
      payload: {
        [key: string]: {
          active: boolean;
          storeId?: number | string;
        };
      };
    }
  | {
      type: WasteSettingsActions.resetActiveTypesWithOldStreetCleanup;
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
        serverSettings: WasteReminderSettingJson[];
        selectedTypeKeys: string[];
      };
    }
  | { type: WasteSettingsActions.toggleNotifications }
  | {
      type: WasteSettingsActions.setNotificationSetting;
      payload: { key: string; value: boolean };
    }
  | { type: WasteSettingsActions.setOnDayBefore; payload: boolean }
  | { type: WasteSettingsActions.setReminderTime; payload: Date };

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
    case WasteSettingsActions.setActiveTypesForOldStreet:
      return { ...state, activeTypesForOldStreet: action.payload };
    case WasteSettingsActions.resetActiveTypesWithOldStreetCleanup:
      return { ...state, activeTypes: action.payload, activeTypesForOldStreet: undefined };
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

      Object.keys(updatedNotificationSettings).forEach((typeKey) => {
        if (updatedTypeSettings[typeKey] === false) {
          updatedNotificationSettings[typeKey] = false;
        }
      });

      return {
        ...state,
        typeSettings: updatedTypeSettings,
        selectedTypeKeys,
        notificationSettings: updatedNotificationSettings
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

      let showNotificationSettings = false;
      handleSystemPermissions().then((permission) => {
        showNotificationSettings = permission;
      });

      return {
        ...state,
        activeTypes,
        typeSettings,
        selectedTypeKeys: usedTypeKeys,
        notificationSettings,
        showNotificationSettings
      };
    }
    case WasteSettingsActions.updateWasteSettings: {
      const { serverSettings, selectedTypeKeys } = action.payload;

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
        return {
          ...state,
          typeSettings,
          selectedTypeKeys,
          notificationSettings: {},
          showNotificationSettings: false
        };
      }

      // Set all notification settings based on the active status of updatedActiveTypes
      const notificationSettings = Object.fromEntries(
        Object.entries(updatedActiveTypes).map(([typeKey, { active }]) => [typeKey, active])
      );

      // Automatically update showNotificationSettings based on active notifications and
      // turn off "all" settings toggle if all notifications are off.
      const hasActiveNotifications = Object.values(notificationSettings).some((active) => !!active);

      let showNotificationSettings = hasActiveNotifications;
      handleSystemPermissions().then((permission) => {
        showNotificationSettings = permission;
      });

      return {
        ...state,
        activeTypes: updatedActiveTypes,
        typeSettings,
        selectedTypeKeys,
        notificationSettings,
        showNotificationSettings,
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

      return {
        ...state,
        notificationSettings: updatedNotificationSettings,
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
    case WasteSettingsActions.setOnDayBefore:
      return { ...state, onDayBefore: action.payload };
    case WasteSettingsActions.setReminderTime:
      return { ...state, reminderTime: action.payload };
    default:
      return state;
  }
};
/* eslint-enable complexity */
