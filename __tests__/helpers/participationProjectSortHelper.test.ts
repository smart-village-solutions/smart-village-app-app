import { compareParticipationProjects } from '../../src/helpers/participationProjectSortHelper';
import type { GenericItem } from '../../src/types/GenericItem';

const project = (id: string, fields: Partial<GenericItem> = {}) =>
  ({ id, ...fields } as GenericItem);
const sortedIds = (items: GenericItem[], order?: string) =>
  [...items].sort((a, b) => compareParticipationProjects(a, b, order)).map(({ id }) => id);

describe('participation project sorting', () => {
  it('keeps numeric payload ordering as the default and supports descending order', () => {
    const items = [
      project('ten', { payload: { itemIndex: '10' } }),
      project('missing'),
      project('two', { payload: { itemIndex: 2 } })
    ];

    expect(sortedIds(items)).toEqual(['two', 'ten', 'missing']);
    expect(sortedIds(items, 'itemIndex_DESC')).toEqual(['ten', 'two', 'missing']);
    expect(items.map(({ id }) => id)).toEqual(['ten', 'missing', 'two']);
  });

  it.each(['publicationDate', 'createdAt', 'updatedAt'])(
    'sorts top-level %s chronologically, accounting for time zones and invalid dates',
    (field) => {
      const items = [
        project('invalid', { [field]: 'invalid' }),
        project('older', { [field]: '2026-09-23T11:00:00+02:00' }),
        project('missing'),
        project('newer', { [field]: '2026-09-23T10:00:00Z' })
      ];

      expect(sortedIds(items, `${field}_DESC`)).toEqual(['newer', 'older', 'invalid', 'missing']);
      expect(sortedIds(items, `${field}_ASC`)).toEqual(['older', 'newer', 'invalid', 'missing']);
    }
  );

  it('supports custom payload fields and preserves ties', () => {
    const items = [
      project('b', { payload: { priority: 'Beta' } }),
      project('a', { payload: { priority: 'Alpha' } }),
      project('a2', { payload: { priority: 'Alpha' } }),
      project('empty', { payload: { priority: ' ' } })
    ];

    expect(sortedIds(items, 'priority')).toEqual(['a', 'a2', 'b', 'empty']);
    expect(sortedIds(items, 'priority_DESC')).toEqual(['b', 'a', 'a2', 'empty']);
    expect(sortedIds(items, 'unknown')).toEqual(['b', 'a', 'a2', 'empty']);
  });
});
