import { ReminderSettings } from '../../types';

export enum ReminderSettingsActionType {
  OVERWRITE,
  UPDATE_ACTIVE_TYPE,
  UPDATE_ON_DAY_BEFORE,
  UPDATE_TIME
}

type OverwriteSettingsAction = {
  type: ReminderSettingsActionType.OVERWRITE;
  payload: ReminderSettings;
};

type UpdateActiveTypesAction = {
  type: ReminderSettingsActionType.UPDATE_ACTIVE_TYPE;
  payload: { key: string; value: boolean };
};

type UpdateOnDayBeforeAction = {
  type: ReminderSettingsActionType.UPDATE_ON_DAY_BEFORE;
  payload: boolean;
};

type UpdateTimeAction = {
  type: ReminderSettingsActionType.UPDATE_TIME;
  payload: Date;
};

export type ReminderSettingsAction =
  | OverwriteSettingsAction
  | UpdateActiveTypesAction
  | UpdateOnDayBeforeAction
  | UpdateTimeAction;

export const reminderSettingsReducer: React.Reducer<ReminderSettings, ReminderSettingsAction> = (
  state: ReminderSettings,
  action: ReminderSettingsAction
) => {
  switch (action.type) {
    case ReminderSettingsActionType.OVERWRITE:
      return action.payload;
    case ReminderSettingsActionType.UPDATE_ACTIVE_TYPE: {
      const { key, value } = action.payload;
      const newState = { ...state };
      newState.activeTypes[key] = { ...newState.activeTypes[key], active: value };
      return newState;
    }
    case ReminderSettingsActionType.UPDATE_ON_DAY_BEFORE:
      return { ...state, onDayBefore: action.payload };
    case ReminderSettingsActionType.UPDATE_TIME:
      return { ...state, reminderTime: action.payload };
    default:
      return state;
  }
};
