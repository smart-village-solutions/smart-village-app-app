jest.mock('../../src/config', () => ({
  normalize: (value: number) => value
}));

import { resolveServiceTileStyle } from '../../src/helpers/serviceTileStyle';

describe('serviceTileStyle', () => {
  it('converts item-level tile colors in grayscale mode', () => {
    const style = resolveServiceTileStyle({
      fallbackStyle: { backgroundColor: '#0000FF' },
      isGrayscaleEnabled: true,
      itemStyle: { backgroundColor: '#C44D36', borderColor: '#FFFFFF', borderWidth: 2 }
    });

    expect(style).toEqual({
      backgroundColor: expect.stringMatching(/^rgb\((\d+), \1, \1\)$/),
      borderColor: 'rgb(255, 255, 255)',
      borderWidth: 2
    });
  });

  it('uses and converts the global fallback when no item override exists', () => {
    const style = resolveServiceTileStyle({
      fallbackStyle: { color: '#C44D36', fontSize: 14 },
      isGrayscaleEnabled: true
    });

    expect(style.color).toMatch(/^rgb\((\d+), \1, \1\)$/);
    expect(style.fontSize).toBe(14);
  });

  it('preserves configured colors when grayscale mode is disabled', () => {
    expect(
      resolveServiceTileStyle({
        fallbackStyle: { backgroundColor: '#0000FF' },
        isGrayscaleEnabled: false,
        itemStyle: { backgroundColor: '#C44D36' }
      })
    ).toEqual({ backgroundColor: '#C44D36' });
  });
});
