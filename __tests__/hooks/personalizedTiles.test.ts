import { applyPersonalizedTilesSettings } from '../../src/hooks/personalizedTiles';

const createTile = (title: string, routeName = 'RouteName') => ({
  accessibilityLabel: title,
  icon: '',
  image: '',
  routeName,
  title
});

describe('applyPersonalizedTilesSettings', () => {
  it('returns empty array for empty input', () => {
    expect(applyPersonalizedTilesSettings({ data: [] })).toEqual([]);
  });

  it('sorts tiles according to stored sorter mapping', () => {
    const tiles = [createTile('A'), createTile('B'), createTile('C')];
    const result = applyPersonalizedTilesSettings({
      data: tiles,
      settings: {
        sorter: {
          A: 2,
          B: 0,
          C: 1
        }
      }
    });

    expect(result.map((item) => item.title)).toEqual(['B', 'C', 'A']);
    expect(tiles.map((item) => item.title)).toEqual(['A', 'B', 'C']);
  });

  it('filters hidden tiles when not in edit mode', () => {
    const result = applyPersonalizedTilesSettings({
      data: [createTile('A'), createTile('B')],
      isEditMode: false,
      settings: {
        toggles: {
          A: 0,
          B: 1
        }
      }
    });

    expect(result.map((item) => item.title)).toEqual(['B']);
  });

  it('keeps all tiles and marks visibility when in edit mode', () => {
    const result = applyPersonalizedTilesSettings({
      data: [createTile('A'), createTile('B')],
      isEditMode: true,
      settings: {
        toggles: {
          A: 0,
          B: 1
        }
      }
    });

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('A');
    expect(result[0].isVisible).toBe(false);
    expect(result[1].title).toBe('B');
    expect(result[1].isVisible).toBe(true);
  });

  it('treats missing toggle entries as visible', () => {
    const result = applyPersonalizedTilesSettings({
      data: [createTile('A'), createTile('B')],
      settings: {
        toggles: {
          A: 0
        }
      }
    });

    expect(result.map((item) => item.title)).toEqual(['B']);
  });

  it('supports umlaut ids used by draggable/sorter keys', () => {
    const result = applyPersonalizedTilesSettings({
      data: [createTile('Müll'), createTile('Zebra')],
      settings: {
        sorter: {
          Muell: 1,
          Zebra: 0
        },
        toggles: {
          Muell: 1,
          Zebra: 1
        }
      }
    });

    expect(result.map((item) => item.title)).toEqual(['Zebra', 'Müll']);
  });
});
