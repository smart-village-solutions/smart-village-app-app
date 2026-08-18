import { darkColors, lightColors } from '../../src/config/colors';
import { getCalendarTheme } from '../../src/helpers/calendarHelper';

describe('getCalendarTheme', () => {
  it.each([
    ['light', lightColors],
    ['dark', darkColors]
  ])('maps every visible calendar state to the %s palette', (_, colors) => {
    expect(getCalendarTheme(colors)).toMatchObject({
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
  });
});
