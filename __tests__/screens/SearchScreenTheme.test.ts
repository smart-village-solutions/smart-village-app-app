import { createSearchStyles } from '../../src/screens/searchStyles';
import { ThemeColorPalette } from '../../src/types/Theme';

describe('SearchScreen theme styles', () => {
  it('uses semantic dark palette tokens for every search bar surface', () => {
    const colors = {
      border: '#54545A',
      surface: '#1E1E1E',
      surfaceElevated: '#2A2A2A',
      text: '#F5F5F5'
    } as ThemeColorPalette;

    const styles = createSearchStyles(colors);

    expect(styles.searchBarContainer).toMatchObject({
      backgroundColor: '#1E1E1E',
      borderBottomColor: '#54545A',
      borderTopColor: '#54545A'
    });
    expect(styles.inputContainerStyle).toMatchObject({
      backgroundColor: '#2A2A2A'
    });
    expect(styles.inputStyle).toMatchObject({
      color: '#F5F5F5'
    });
  });
});
