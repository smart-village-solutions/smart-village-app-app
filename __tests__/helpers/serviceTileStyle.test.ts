jest.mock('../../src/config', () => ({
  normalize: (value: number) => value * 2
}));

import { resolveServiceTileStyle } from '../../src/helpers/serviceTileStyle';

describe('serviceTileStyle', () => {
  it('prefers item-level styles and normalizes numeric values', () => {
    const style = resolveServiceTileStyle({
      fallbackStyle: { backgroundColor: '#0000FF' },
      itemStyle: { backgroundColor: '#C44D36', borderColor: '#FFFFFF', borderWidth: 2 }
    });

    expect(style).toEqual({
      backgroundColor: '#C44D36',
      borderColor: '#FFFFFF',
      borderWidth: 4
    });
  });

  it('uses and normalizes the global fallback when no item override exists', () => {
    const style = resolveServiceTileStyle({
      fallbackStyle: { color: '#C44D36', fontSize: 14 }
    });

    expect(style).toEqual({ color: '#C44D36', fontSize: 28 });
  });
});
