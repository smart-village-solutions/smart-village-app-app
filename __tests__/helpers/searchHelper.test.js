import { DEFAULT_SEARCH_FILTER, pluralizeSearchRecordType } from '../../src/helpers/searchHelper';

describe('global search record types', () => {
  it('includes GenericItems and resolves their list query', () => {
    expect(DEFAULT_SEARCH_FILTER).toContain('generic_item');
    expect(pluralizeSearchRecordType('generic_item')).toBe('genericItems');
    expect(pluralizeSearchRecordType('GenericItem')).toBe('genericItems');
  });
});
