import { buildDefectReportCategoryOptions } from '../../src/helpers/defectReportCategoryOptions';

describe('buildDefectReportCategoryOptions', () => {
  it('sorts categories by position and uses name as a tiebreaker', () => {
    const options = buildDefectReportCategoryOptions([
      { id: 3, name: 'Zebra', position: 2 },
      { id: 1, name: 'Alpha', position: 0 },
      { id: 4, name: 'Beta', position: 2 },
      { id: 2, name: 'Gamma', position: 1 }
    ]);

    expect(options).toEqual([
      { id: 1, name: 'Alpha', value: 'Alpha' },
      { id: 2, name: 'Gamma', value: 'Gamma' },
      { id: 4, name: 'Beta', value: 'Beta' },
      { id: 3, name: 'Zebra', value: 'Zebra' }
    ]);
  });

  it('treats missing positions like zero', () => {
    const options = buildDefectReportCategoryOptions([
      { id: 2, name: 'Bravo' },
      { id: 1, name: 'Alpha', position: 0 },
      { id: 3, name: 'Charlie', position: 1 }
    ]);

    expect(options).toEqual([
      { id: 1, name: 'Alpha', value: 'Alpha' },
      { id: 2, name: 'Bravo', value: 'Bravo' },
      { id: 3, name: 'Charlie', value: 'Charlie' }
    ]);
  });
});
