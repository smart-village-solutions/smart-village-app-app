import {
  getParticipationProjectListDatePrefix,
  getParticipationProjectPreviewDate
} from '../../src/helpers/participationProjectHelper';
import { GenericItem, SVA_Date } from '../../src/types';

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEM: 'genericItem'
  }
}));

const buildDate = (overrides: Partial<SVA_Date> = {}): SVA_Date => ({
  id: 'date-1',
  ...overrides
});

const buildParticipationProject = (date: SVA_Date): GenericItem => ({
  categories: [],
  contentBlocks: [],
  dates: [date],
  id: 'participation-project-1',
  mediaContents: [],
  payload: {},
  webUrls: []
});

describe('participation project list dates', () => {
  it('marks a multi-day participation as a period', () => {
    const date = buildDate({
      dateEnd: '2028-06-30',
      dateStart: '2026-01-28'
    });

    expect(getParticipationProjectListDatePrefix(date)).toBe('ab');
    expect(getParticipationProjectPreviewDate(buildParticipationProject(date))).toBe(
      'ab 28.01.2026'
    );
  });

  it('does not mark a single-day participation as a period', () => {
    const date = buildDate({
      dateEnd: '2026-01-28 23:59:59 +0000',
      dateStart: '2026-01-28 00:00:00 +0000'
    });

    expect(getParticipationProjectListDatePrefix(date)).toBeUndefined();
  });

  it('keeps the explicit open-start marker for participations without an end date', () => {
    const date = buildDate({
      dateStart: '2026-01-28',
      timeDescription: ' Ab '
    });

    expect(getParticipationProjectListDatePrefix(date)).toBe('ab');
  });
});
