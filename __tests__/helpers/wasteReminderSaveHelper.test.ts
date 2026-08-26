import { saveWasteReminderSettings } from '../../src/helpers/wasteReminderSaveHelper';

const baseParams = {
  dispatchActiveType: jest.fn(),
  globalSettings: {
    navigation: 'tab',
    waste: { streetId: 1, streetName: 'Old Street', selectedTypeKeys: ['paper'] }
  },
  notificationSettings: { paper: true },
  persistGlobalSettings: jest.fn(async () => undefined),
  scheduleLocalReminderSettings: jest.fn(async () => ({
    localCoverageUntil: new Date('2026-06-09T07:00:00.000Z'),
    reminderSyncRegistrations: []
  })),
  selectedStreetId: 2,
  selectedTypeKeys: ['paper'],
  setGlobalSettings: jest.fn(),
  streetName: 'New Street',
  updateSettings: jest.fn(async () => undefined),
  waste: { streetId: 1, streetName: 'Old Street', selectedTypeKeys: ['paper'] }
};

describe('saveWasteReminderSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not persist global waste settings when local scheduling fails', async () => {
    const scheduleError = new Error('schedule failed');
    const scheduleLocalReminderSettings = jest.fn(async () => {
      throw scheduleError;
    });

    await expect(
      saveWasteReminderSettings({
        ...baseParams,
        scheduleLocalReminderSettings
      })
    ).rejects.toThrow('schedule failed');

    expect(baseParams.persistGlobalSettings).not.toHaveBeenCalled();
    expect(baseParams.setGlobalSettings).not.toHaveBeenCalled();
    expect(baseParams.updateSettings).not.toHaveBeenCalled();
  });

  it('persists settings only after local scheduling succeeded', async () => {
    const order: string[] = [];
    const scheduleLocalReminderSettings = jest.fn(async () => {
      order.push('schedule');

      return {
        localCoverageUntil: new Date('2026-06-09T07:00:00.000Z'),
        reminderSyncRegistrations: [
          { active: true, leadDays: 1, slotId: 'first', time: '09:00', typeKey: 'paper' }
        ]
      };
    });
    const persistGlobalSettings = jest.fn(async () => {
      order.push('persist');
    });
    const updateSettings = jest.fn(async () => {
      order.push('sync');
    });

    await saveWasteReminderSettings({
      ...baseParams,
      persistGlobalSettings,
      scheduleLocalReminderSettings,
      updateSettings
    });

    expect(order).toEqual(['schedule', 'persist', 'sync']);
    expect(persistGlobalSettings).toHaveBeenCalledWith({
      navigation: 'tab',
      waste: {
        streetId: 2,
        streetName: 'New Street',
        selectedTypeKeys: ['paper']
      }
    });
  });
});
