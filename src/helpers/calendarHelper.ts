import { CalendarProps, LocaleConfig } from 'react-native-calendars';

import { ThemeColorPalette } from '../types/Theme';

export const getCalendarTheme = (colors: ThemeColorPalette): CalendarProps['theme'] => ({
  arrowColor: colors.primary,
  backgroundColor: colors.background,
  calendarBackground: colors.calendarBackground,
  dayTextColor: colors.text,
  disabledArrowColor: colors.placeholder,
  indicatorColor: colors.refreshControl,
  monthTextColor: colors.text,
  selectedDayBackgroundColor: colors.calendarSelected,
  selectedDayTextColor: colors.calendarSelectedDayText,
  selectedDotColor: colors.calendarSelectedDayText,
  textDisabledColor: colors.placeholder,
  textInactiveColor: colors.textMuted,
  textSectionTitleColor: colors.textMuted,
  textSectionTitleDisabledColor: colors.placeholder,
  todayTextColor: colors.calendarTodayText
});

export const setupLocales = () => {
  LocaleConfig.defaultLocale = 'de';
  LocaleConfig.locales['de'] = {
    monthNames: [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember'
    ],
    monthNamesShort: [
      'Jan.',
      'Feb.',
      'Mär.',
      'Apr.',
      'Mai',
      'Jun.',
      'Jul.',
      'Aug.',
      'Sep.',
      'Okt.',
      'Nov.',
      'Dez.'
    ],
    dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
    dayNamesShort: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.']
  };
};
