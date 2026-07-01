import { buildReminderServerSyncRegistrations } from '../../src/helpers/wasteReminderRegistrationHelper';

describe('buildReminderServerSyncRegistrations', () => {
  it('keeps reminder registrations active when notification settings are enabled for a selected type', () => {
    const registrations = buildReminderServerSyncRegistrations(
      {
        paper: {
          enabled: false,
          reminders: {
            first: {
              enabled: true,
              leadDays: 2,
              time: '11:30'
            }
          }
        }
      },
      {
        paper: {
          color: '#000000',
          icon: 'paper',
          label: 'Paper',
          reminders: {
            channels: { push: true },
            push: {
              slots: [{ default_lead_days: 1, id: 'first', max_lead_days: 7 }]
            }
          },
          selected_color: '#111111'
        }
      },
      ['paper'],
      { paper: true }
    );

    expect(registrations).toEqual([
      {
        active: true,
        leadDays: 2,
        slotId: 'first',
        storeId: undefined,
        time: '11:30',
        typeKey: 'paper'
      }
    ]);
  });
});
