export type ReminderSettings = {
  activeTypes: { [key: string]: boolean };
  onDayBefore: boolean;
  reminderTime: Date;
};

export type WasteTypeData = {
  [key: string]: {
    color: string;
    icon: string;
    label: string;
    selected_color: string;
  };
};
