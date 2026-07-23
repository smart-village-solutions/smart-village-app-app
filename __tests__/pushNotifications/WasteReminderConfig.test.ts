import {
  getWasteReminderUiMode,
  normalizePushReminderSlots
} from '../../src/pushNotifications/WasteReminderConfig';

const legacyWasteType = {
  color: '#000',
  icon: 'paper',
  label: 'Paper',
  selected_color: '#111'
};

const flexibleWasteType = {
  ...legacyWasteType,
  reminders: {
    channels: { push: true, email: false, calendar: false },
    push: {
      slots: [
        { id: 'first', max_lead_days: 7, default_lead_days: 1 },
        { id: 'second', max_lead_days: 14, default_lead_days: 7 }
      ]
    }
  }
};

describe('WasteReminderConfig', () => {
  it('uses legacy-global mode when reminders are missing', () => {
    expect(getWasteReminderUiMode({ paper: legacyWasteType })).toBe('legacy-global');
    expect(normalizePushReminderSlots(legacyWasteType)).toEqual({
      isFallback: true,
      slots: [{ id: 'default', maxLeadDays: 1, defaultLeadDays: 1 }]
    });
  });

  it('uses flexible-per-type mode for real push slots', () => {
    expect(getWasteReminderUiMode({ paper: flexibleWasteType })).toBe('flexible-per-type');
    expect(normalizePushReminderSlots(flexibleWasteType)).toEqual({
      isFallback: false,
      slots: [
        { id: 'first', maxLeadDays: 7, defaultLeadDays: 1 },
        { id: 'second', maxLeadDays: 14, defaultLeadDays: 7 }
      ]
    });
  });

  it('hides push slots when the push channel is disabled', () => {
    expect(
      normalizePushReminderSlots({
        ...legacyWasteType,
        reminders: {
          channels: { push: false, email: true, calendar: false },
          push: { slots: [{ id: 'first', max_lead_days: 7, default_lead_days: 1 }] }
        }
      })
    ).toEqual({ isFallback: false, slots: [] });
  });

  it('keeps fallback out of flexible mode when mixed with configured non-push reminders', () => {
    expect(
      getWasteReminderUiMode({
        paper: legacyWasteType,
        organic: {
          ...legacyWasteType,
          reminders: {
            channels: { push: false, email: true, calendar: false },
            email: {
              slots: [{ id: 'email-first', max_lead_days: 10, default_lead_days: 1 }]
            }
          }
        }
      })
    ).toBe('legacy-global');
  });
});
