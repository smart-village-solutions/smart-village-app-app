import { darkColors, lightColors } from '../../src/config/colors';
import {
  createWasteInputStyles,
  createWasteSuggestionStyles
} from '../../src/components/waste/wasteInputStyles';

describe('waste address autocomplete theme', () => {
  it.each([
    ['light', lightColors],
    ['dark', darkColors]
  ])('overrides native autocomplete defaults with the %s palette', (_, colors) => {
    const styles = createWasteInputStyles(colors);

    expect(styles.autoCompleteInput).toMatchObject({
      backgroundColor: colors.background,
      color: colors.text
    });
    expect(styles.autoCompleteInputContainer).toMatchObject({
      backgroundColor: colors.background,
      borderColor: colors.border
    });
    expect(styles.autoCompleteList).toMatchObject({
      backgroundColor: colors.background,
      borderColor: colors.border
    });
    expect(styles.autoCompleteListContainer).toMatchObject({
      backgroundColor: colors.background
    });

    expect(createWasteSuggestionStyles(colors)).toMatchObject({
      divider: { backgroundColor: colors.border },
      row: { backgroundColor: colors.background }
    });
  });
});
