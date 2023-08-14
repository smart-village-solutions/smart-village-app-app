export type OpeningHour = {
  dateFrom?: string;
  dateTo?: string;
  open: boolean | null;
  timeFrom?: string;
  timeTo?: string;
  useYear: boolean | null;
  weekday?: 'Sonntag' | 'Montag' | 'Dienstag' | 'Mittwoch' | 'Donnerstag' | 'Freitag' | 'Samstag';
};
