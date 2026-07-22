import { darkColors, lightColors } from '../../src/config/colors';
import { createWasteInputStyles } from '../../src/components/waste/wasteInputStyles';

describe('waste address autocomplete theme', () => {
  it.each([
    ['light', lightColors],
    ['dark', darkColors]
  ])('overrides native autocomplete defaults with the %s palette', (_, colors) => {
    const styles = createWasteInputStyles(colors);

    expect(styles.autoCompleteInput).toMatchObject({
      backgroundColor: colors.surface,
      color: colors.text
    });
    expect(styles.autoCompleteInputContainer).toMatchObject({
      backgroundColor: colors.surface,
      borderColor: colors.border
    });
    expect(styles.autoCompleteList).toMatchObject({
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border
    });
    expect(styles.autoCompleteListContainer).toMatchObject({
      backgroundColor: colors.surfaceElevated
    });
  });
});
