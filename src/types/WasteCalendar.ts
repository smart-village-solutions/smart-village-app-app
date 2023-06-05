export type ReminderSettings = {
  activeTypes: { [key: string]: { active: boolean; storeId?: number } };
  onDayBefore: boolean;
  reminderTime: Date;
};

export type ReminderSettingJson = {
  city: string;
  id: number;
  notify_at: string;
  notify_days_before: number;
  notify_for_waste_type: string;
  street: string;
  zip: string;
};

export type WasteTypeData = {
  [key: string]: {
    color: string;
    icon: string;
    label: string;
    selected_color: string;
  };
};
