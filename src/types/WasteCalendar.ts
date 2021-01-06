export type ReminderSettings = {
  activeTypes: { [key: string]: boolean };
  onDayBefore: boolean;
  reminderTime: Date;
};

export type WasteCollectionCalendarData = {
  [key: string]: {
    dates: string[];
    dot: { key: string; color: string; selectedColor: string };
    name: string;
  };
};
