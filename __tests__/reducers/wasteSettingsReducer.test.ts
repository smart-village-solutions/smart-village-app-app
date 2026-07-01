import {
  WasteSettingsActions,
  WasteSettingsState,
  wasteSettingsReducer
} from '../../src/reducers/wasteSettingsReducer';

const initialState: WasteSettingsState = {
  activeTypes: { paper: { active: false } },
  notificationSettings: {},
  onDayBefore: true,
  reminderSettingsByType: {},
  reminderTime: new Date('2000-01-01T08:00:00.000Z'),
  selectedTypeKeys: ['paper'],
  showNotificationSettings: false,
  typeSettings: { paper: true }
};

describe('wasteSettingsReducer', () => {
  it('keeps reminder notifications visible when local settings are active without server settings', () => {
    const nextState = wasteSettingsReducer(initialState, {
      type: WasteSettingsActions.updateWasteSettings,
      payload: {
        notificationSettings: { paper: true },
        selectedTypeKeys: ['paper'],
        serverSettings: []
      }
    });

    expect(nextState.notificationSettings).toEqual({ paper: true });
    expect(nextState.showNotificationSettings).toBe(true);
  });
});
