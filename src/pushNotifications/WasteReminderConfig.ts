import { WasteReminderSlotConfig, WasteType, WasteTypeData } from '../types';

export type WasteReminderUiMode = 'legacy-global' | 'flexible-per-type';

export type NormalizedWasteReminderSlot = {
  defaultLeadDays: number;
  id: string;
  maxLeadDays: number;
};

export type NormalizedPushReminderSlots = {
  isFallback: boolean;
  slots: NormalizedWasteReminderSlot[];
};

export const DEFAULT_PUSH_REMINDER_SLOT: NormalizedWasteReminderSlot = {
  defaultLeadDays: 1,
  id: 'default',
  maxLeadDays: 1
};

export const normalizePushReminderSlots = (wasteType?: WasteType): NormalizedPushReminderSlots => {
  if (!wasteType?.reminders) {
    return {
      isFallback: true,
      slots: [DEFAULT_PUSH_REMINDER_SLOT]
    };
  }

  if (wasteType.reminders.channels?.push !== true) {
    return {
      isFallback: false,
      slots: []
    };
  }

  return {
    isFallback: false,
    slots: normalizeSlotConfigs(wasteType.reminders.push?.slots)
  };
};

export const getWasteReminderUiMode = (wasteTypes?: WasteTypeData): WasteReminderUiMode => {
  const hasFlexiblePushSlots = Object.values(wasteTypes ?? {}).some((wasteType) => {
    const normalized = normalizePushReminderSlots(wasteType);

    return !normalized.isFallback && normalized.slots.length > 0;
  });

  return hasFlexiblePushSlots ? 'flexible-per-type' : 'legacy-global';
};

const normalizeSlotConfigs = (
  slots: WasteReminderSlotConfig[] | undefined
): NormalizedWasteReminderSlot[] =>
  (slots ?? [])
    .map((slot, index) => {
      const maxLeadDays = normalizeLeadDays(slot.max_lead_days);
      const defaultLeadDays = Math.min(normalizeLeadDays(slot.default_lead_days), maxLeadDays);
      const id = slot.id || `slot-${index + 1}`;

      return {
        defaultLeadDays,
        id,
        maxLeadDays
      };
    })
    .filter((slot) => !!slot.id);

const normalizeLeadDays = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
};
