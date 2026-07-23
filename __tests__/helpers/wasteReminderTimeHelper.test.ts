import { formatWasteReminderTime } from '../../src/helpers/wasteReminderTimeHelper';

describe('formatWasteReminderTime', () => {
  it('pads single-digit hours and minutes to a stable hh:mm format', () => {
    expect(formatWasteReminderTime(new Date('2000-01-01T09:00:00.000+01:00'))).toBe('09:00');
    expect(formatWasteReminderTime(new Date('2000-01-01T10:01:00.000+01:00'))).toBe('10:01');
  });
});
