import { LocaleConfig } from 'react-native-calendars';

export const setupLocales = () => {
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
    dayNamesShort: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
    today: 'Heute'
  };
  LocaleConfig.defaultLocale = 'de';
};
