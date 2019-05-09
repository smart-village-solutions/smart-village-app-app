import { colors } from '../../src/config';

describe('color', () => {
  it('primary is defined', () => {
    expect(colors.primary).toBeTruthy();
  });

  it('secondary is defined', () => {
    expect(colors.secondary).toBeTruthy();
  });

  it('darkText is defined', () => {
    expect(colors.darkText).toBeTruthy();
  });

  it('lighterText is defined', () => {
    expect(colors.lighterText).toBeTruthy();
  });

  it('lightestText is defined', () => {
    expect(colors.lightestText).toBeTruthy();
  });
});
