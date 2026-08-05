import {
  getParticipationProjectStatus,
  getParticipationProjectStatusColor,
  getParticipationProjectStatusCounts,
  getParticipationProjectStatusLabel,
  getParticipationProjectListDatePrefix,
  getParticipationProjectPreviewDate,
  isParticipationProjectActive,
  isParticipationProjectCurrent,
  isParticipationProjectMapEligible,
  normalizeParticipationProjectStatus,
  ParticipationProject
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

const buildParticipationProjectWithStatus = (
  status?: ParticipationProject['payload']['status'],
  withGeoLocation = false,
  color?: string
): ParticipationProject =>
  ({
    categories: [],
    contentBlocks: [],
    dates: [],
    id: `participation-project-${typeof status === 'string' ? status : 'status-object'}`,
    locations: withGeoLocation ? [{ geoLocation: { latitude: 52.1, longitude: 11.6 } }] : [],
    mediaContents: [],
    payload: { color, status },
    webUrls: []
  } as unknown as ParticipationProject);

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

describe('participation project statuses', () => {
  it('normalizes supported status values', () => {
    expect(normalizeParticipationProjectStatus(' ACTIVE ')).toBe('active');
    expect(normalizeParticipationProjectStatus('Aktiv')).toBe('active');
    expect(normalizeParticipationProjectStatus('ANNOUNCED')).toBe('announced');
    expect(normalizeParticipationProjectStatus('Abgeschlossen')).toBe('completed');
    expect(normalizeParticipationProjectStatus('Beendet')).toBe('ended');
    expect(normalizeParticipationProjectStatus('Kürzlich beendet')).toBe('recently_ended');
    expect(normalizeParticipationProjectStatus('Kürzlich abgeschlossen')).toBe('recently_ended');
    expect(normalizeParticipationProjectStatus()).toBe('empty');
    expect(normalizeParticipationProjectStatus('')).toBe('empty');
  });

  it('normalizes gray and structured status data for filtering and display', () => {
    const recentlyEnded = buildParticipationProjectWithStatus({
      color: 'gray',
      label: 'Kürzlich beendet'
    });
    const grayWithoutTerminalStatus = buildParticipationProjectWithStatus(
      'unexpected-status',
      false,
      'gray'
    );

    expect(getParticipationProjectStatus(recentlyEnded)).toBe('recently_ended');
    expect(getParticipationProjectStatusLabel(recentlyEnded)).toBe('Kürzlich beendet');
    expect(getParticipationProjectStatusColor(recentlyEnded)).toBe('gray');
    expect(getParticipationProjectStatus(grayWithoutTerminalStatus)).toBe('completed');
  });

  it('counts all supported statuses, including ended and empty values', () => {
    expect(
      getParticipationProjectStatusCounts([
        buildParticipationProjectWithStatus('active'),
        buildParticipationProjectWithStatus('Aktiv'),
        buildParticipationProjectWithStatus('announced'),
        buildParticipationProjectWithStatus('Kürzlich beendet', false, 'gray'),
        buildParticipationProjectWithStatus('Beendet', false, 'gray'),
        buildParticipationProjectWithStatus('completed'),
        buildParticipationProjectWithStatus()
      ])
    ).toEqual([
      { count: 2, label: 'Aktiv', status: 'active' },
      { count: 1, label: 'Angekündigt', status: 'announced' },
      { count: 1, label: 'Kürzlich beendet', status: 'recently_ended' },
      { count: 1, label: 'Beendet', status: 'ended' },
      { count: 1, label: 'Abgeschlossen', status: 'completed' },
      { count: 1, label: 'Ohne Status', status: 'empty' }
    ]);
  });

  it('treats active and announced projects as current and requires coordinates for the map', () => {
    expect(isParticipationProjectActive(buildParticipationProjectWithStatus('active'))).toBe(true);
    expect(isParticipationProjectCurrent(buildParticipationProjectWithStatus('announced'))).toBe(
      true
    );
    expect(
      isParticipationProjectMapEligible(buildParticipationProjectWithStatus('active', true))
    ).toBe(true);
    expect(
      isParticipationProjectMapEligible(buildParticipationProjectWithStatus('announced', true))
    ).toBe(true);
    expect(
      isParticipationProjectMapEligible(buildParticipationProjectWithStatus('completed', true))
    ).toBe(true);
    expect(isParticipationProjectMapEligible(buildParticipationProjectWithStatus('active'))).toBe(
      false
    );
  });
});
