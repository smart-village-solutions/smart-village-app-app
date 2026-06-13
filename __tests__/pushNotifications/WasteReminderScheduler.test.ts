import { buildWasteReminderSchedule } from '../../src/pushNotifications/WasteReminderScheduler';

const wasteLocationTypes = [
  {
    wasteType: 'paper',
    pickUpTimes: [{ pickupDate: '2026-06-10' }, { pickupDate: '2026-07-10' }]
  },
  {
    wasteType: 'organic',
    pickUpTimes: [{ pickupDate: '2026-06-10' }, { pickupDate: '2026-08-10' }]
  },
  {
    wasteType: 'residual',
    pickUpTimes: [{ pickupDate: '2026-06-11' }]
  }
];

describe('buildWasteReminderSchedule', () => {
  it('builds reminders from multiple active reminder registrations per type', () => {
    const schedule = buildWasteReminderSchedule({
      activeReminderRegistrations: [
        { leadDays: 1, slotId: 'first', time: '09:00', typeKey: 'paper' },
        { leadDays: 7, slotId: 'second', time: '18:00', typeKey: 'paper' },
        { leadDays: 1, slotId: 'first', time: '09:00', typeKey: 'organic' }
      ],
      maxNotifications: 50,
      now: new Date('2026-06-01T08:00:00.000+02:00'),
      wasteLocationTypes
    });

    expect(schedule.reminders[0]).toEqual({
      id: 'waste:2026-06-03T16:00:00.000Z:paper:2026-06-10',
      pickupDates: ['2026-06-10'],
      reminderAt: new Date('2026-06-03T18:00:00.000+02:00'),
      wasteTypes: ['paper']
    });
    expect(schedule.reminders[1]).toEqual({
      id: 'waste:2026-06-09T07:00:00.000Z:organic,paper:2026-06-10',
      pickupDates: ['2026-06-10'],
      reminderAt: new Date('2026-06-09T09:00:00.000+02:00'),
      wasteTypes: ['organic', 'paper']
    });
  });

  it('groups waste types that share the same reminder timestamp', () => {
    const schedule = buildWasteReminderSchedule({
      maxNotifications: 50,
      now: new Date('2026-06-08T08:00:00.000+02:00'),
      onDayBefore: true,
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      selectedTypeKeys: ['organic', 'paper'],
      wasteLocationTypes
    });

    expect(schedule.reminders[0]).toEqual({
      id: 'waste:2026-06-09T07:00:00.000Z:organic,paper:2026-06-10',
      pickupDates: ['2026-06-10'],
      reminderAt: new Date('2026-06-09T09:00:00.000+02:00'),
      wasteTypes: ['organic', 'paper']
    });
  });

  it('skips reminders that are not in the future', () => {
    const schedule = buildWasteReminderSchedule({
      maxNotifications: 50,
      now: new Date('2026-06-09T10:00:00.000+02:00'),
      onDayBefore: true,
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      selectedTypeKeys: ['organic', 'paper'],
      wasteLocationTypes
    });

    expect(schedule.reminders.map((reminder) => reminder.pickupDates)).toEqual([
      ['2026-07-10'],
      ['2026-08-10']
    ]);
  });

  it('limits scheduled reminders and reports coverage from the last planned reminder', () => {
    const manyPickups = Array.from({ length: 60 }, (_, index) => {
      const pickupDate = new Date('2026-07-01T00:00:00.000+02:00');
      pickupDate.setDate(pickupDate.getDate() + index);

      return { pickupDate: pickupDate.toISOString().slice(0, 10) };
    });

    const schedule = buildWasteReminderSchedule({
      maxNotifications: 50,
      now: new Date('2026-06-08T08:00:00.000+02:00'),
      onDayBefore: false,
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      selectedTypeKeys: ['paper'],
      wasteLocationTypes: [{ wasteType: 'paper', pickUpTimes: manyPickups }]
    });

    expect(schedule.reminders).toHaveLength(50);
    expect(schedule.reminders[49].pickupDates).toEqual([manyPickups[49].pickupDate]);
    expect(schedule.localCoverageUntil).toEqual(schedule.reminders[49].reminderAt);
    expect(schedule.hasMoreReminders).toBe(true);
  });

  it('reports when all reminders fit into the local schedule', () => {
    const schedule = buildWasteReminderSchedule({
      maxNotifications: 50,
      now: new Date('2026-06-08T08:00:00.000+02:00'),
      onDayBefore: false,
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      selectedTypeKeys: ['paper'],
      wasteLocationTypes
    });

    expect(schedule.reminders).toHaveLength(2);
    expect(schedule.hasMoreReminders).toBe(false);
  });
});
