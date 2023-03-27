export type OpeningHour = {
  dateFrom?: string;
  dateTo?: string;
  open: boolean | null;
  timeFrom?: string;
  timeTo?: string;
  weekday?: 'Sonntag' | 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag';
};
