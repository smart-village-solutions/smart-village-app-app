export type WasteReminderSettingJson = {
  city: string;
  id: number;
  notify_at: string;
  notify_days_before: number;
  notify_for_waste_type: string;
  reminder_slot_id?: string | null;
  street: string;
  zip: string;
};

export type WasteReminderSlotConfig = {
  default_lead_days?: number | null;
  id?: string | null;
  max_lead_days?: number | null;
};

export type WasteReminderChannelSlotsConfig = {
  slots?: WasteReminderSlotConfig[];
};

export type WasteReminderChannelsConfig = {
  calendar?: boolean;
  email?: boolean;
  push?: boolean;
};

export type WasteReminderConfig = {
  channels?: WasteReminderChannelsConfig;
  email?: WasteReminderChannelSlotsConfig;
  push?: WasteReminderChannelSlotsConfig;
};

export type WasteType = {
  color: string;
  icon: string;
  label: string;
  notification_kind?: 'disruption';
  reminders?: WasteReminderConfig;
  selected_color: string;
};

export type WasteTypeData = {
  [key: string]: WasteType;
};
