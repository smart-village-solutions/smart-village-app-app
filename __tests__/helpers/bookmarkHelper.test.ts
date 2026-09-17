import { getListQueryType } from '../../src/helpers/bookmarkHelper';
import { QUERY_TYPES } from '../../src/queries/types';

describe('bookmarkHelper', () => {
  it('stores volunteer calendar details in the calendar list category', () => {
    expect(getListQueryType(QUERY_TYPES.VOLUNTEER.CALENDAR)).toBe(
      QUERY_TYPES.VOLUNTEER.CALENDAR_ALL
    );
  });
});
