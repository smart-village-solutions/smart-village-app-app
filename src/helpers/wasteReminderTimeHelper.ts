export const formatWasteReminderTime = (date: Date) =>
  [date.getHours(), date.getMinutes()].map((value) => String(value).padStart(2, '0')).join(':');
