import {
  buildReminderSettingsFromRegistrations,
  buildReminderSettingsFromServerSettings
} from '../../src/pushNotifications/WasteReminderSettingsMapper';

const usedTypes = {
  paper: {
    color: '#fff',
    label: 'Paper',
    reminders: {
      channels: { push: true },
      push: {
        slots: [
          { default_lead_days: 1, id: 'first', max_lead_days: 7 },
          { default_lead_days: 2, id: 'second', max_lead_days: 7 }
        ]
      }
    },
    selected_color: '#000'
  }
};

describe('WasteReminderSettingsMapper', () => {
  it('enables only registrations explicitly returned by the server and preserves slot ids', () => {
    const result = buildReminderSettingsFromServerSettings(usedTypes, [
      {
        city: 'Berlin',
        id: 123,
        notify_at: '2026-07-23T18:30:00.000Z',
        notify_days_before: 3,
        notify_for_waste_type: 'paper',
        reminder_slot_id: 'second',
        street: 'Main Street',
        zip: '12345'
      }
    ]);

    expect(result.paper.enabled).toBe(true);
    expect(result.paper.reminders.first).toEqual({
      enabled: false,
      leadDays: 1,
      time: '09:00'
    });
    expect(result.paper.reminders.second).toMatchObject({
      enabled: true,
      leadDays: 3,
      storeId: 123
    });
  });

  it('ignores unknown types and slots instead of guessing registrations', () => {
    const result = buildReminderSettingsFromRegistrations(usedTypes, [
      {
        active: true,
        leadDays: 4,
        slotId: 'unknown',
        time: '10:00',
        typeKey: 'paper'
      },
      {
        active: true,
        leadDays: 4,
        slotId: 'first',
        time: '10:00',
        typeKey: 'glass'
      }
    ]);

    expect(result.paper.enabled).toBe(false);
    expect(Object.values(result.paper.reminders).every((setting) => !setting.enabled)).toBe(true);
  });

  it('maps legacy records without a slot id to the default slot only', () => {
    const legacyTypes = {
      paper: {
        ...usedTypes.paper,
        reminders: undefined
      }
    };
    const result = buildReminderSettingsFromServerSettings(legacyTypes, [
      {
        city: 'Berlin',
        id: 456,
        notify_at: '2026-07-23T09:00:00.000Z',
        notify_days_before: 1,
        notify_for_waste_type: 'paper',
        street: 'Main Street',
        zip: '12345'
      }
    ]);

    expect(result.paper.reminders.default).toMatchObject({
      enabled: true,
      leadDays: 1,
      storeId: 456
    });
  });
});
