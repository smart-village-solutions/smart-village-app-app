import { resolveListType } from '../../src/helpers/listTypeSettings';

describe('resolveListType', () => {
  const storedTypes = { eventRecords: 'textList', pointsOfInterestAndTours: 'cardList' };

  it('uses a remote setting ahead of an older device preference', () => {
    expect(
      resolveListType(
        'eventRecords',
        { sections: { listTypes: { eventRecords: 'imageTextList' } } },
        storedTypes
      )
    ).toBe('imageTextList');
  });

  it('allows points of interest and tours to be configured separately', () => {
    const settings = { sections: { listTypes: { tours: 'textList' } } };

    expect(resolveListType('tours', settings, storedTypes)).toBe('textList');
    expect(resolveListType('pointsOfInterest', settings, storedTypes)).toBe('cardList');
  });

  it('keeps existing settings when a remote value is missing or invalid', () => {
    expect(resolveListType('eventRecords', { sections: {} }, storedTypes)).toBe('textList');
    expect(
      resolveListType(
        'eventRecords',
        { sections: { listTypes: { eventRecords: 'unsupported' } } },
        storedTypes
      )
    ).toBe('textList');
  });
});
