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

  it('clears stale activeTypes store ids when server settings are empty', () => {
    const nextState = wasteSettingsReducer(
      {
        ...initialState,
        activeTypes: {
          paper: { active: true, storeId: 99 },
          bio: { active: true, storeId: 55 }
        },
        selectedTypeKeys: ['paper', 'bio'],
        typeSettings: { paper: true, bio: true }
      },
      {
        type: WasteSettingsActions.updateWasteSettings,
        payload: {
          notificationSettings: { paper: true },
          selectedTypeKeys: ['paper'],
          serverSettings: []
        }
      }
    );

    expect(nextState.activeTypes).toEqual({
      paper: { active: false },
      bio: { active: false }
    });
  });
});
