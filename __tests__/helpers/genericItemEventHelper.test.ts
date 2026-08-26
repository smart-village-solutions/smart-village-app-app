import moment from 'moment';

import {
  normalizeGenericItemEventStatus,
  parseGenericItemEvents
} from '../../src/helpers/genericItemEventHelper';
import { GenericItemEventSource } from '../../src/types';

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { GENERIC_ITEM: 'genericItem' }
}));
jest.mock('../../src/helpers/genericTypeHelper', () => ({
  getGenericItemDetailTitle: jest.fn(() => 'Beteiligung'),
  getGenericItemRootRouteName: jest.fn(() => 'ParticipationProjects')
}));
jest.mock('../../src/config', () => ({
  consts: { ROOT_ROUTE_NAMES: { PARTICIPATION_PROJECTS: 'ParticipationProjects' } },
  texts: { participationProject: { participationProject: 'Beteiligung' } }
}));

const source: GenericItemEventSource = {
  genericType: 'ParticipationProject',
  filterTypes: [' Veranstaltung '],
  filterStatuses: ['active']
};
const item = (overrides: Record<string, unknown> = {}) => ({
  addresses: [{ city: 'Magdeburg' }],
  categories: [{ name: 'Veranstaltung' }],
  contentBlocks: [{ body: '<p>Beschreibung</p>' }],
  dates: [{ id: 'a', dateStart: '2030-05-03', timeStart: '10:00' }],
  genericType: 'ParticipationProject',
  id: '42',
  mediaContents: [],
  payload: { status: 'Aktiv', type: 'Termin' },
  title: 'Dialog',
  webUrls: [],
  ...overrides
});

describe('parseGenericItemEvents', () => {
  it('matches types from payload or any category and canonical statuses', () => {
    const result = parseGenericItemEvents([item()], source, ['2030-05-03']);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'ParticipationProject:42:a:2030-05-03',
      listDate: '2030-05-03',
      overtitle: '10:00 Uhr',
      routeName: 'Detail',
      params: { query: 'genericItem', queryVariables: { id: '42' } }
    });
    expect(result[0]).not.toHaveProperty('subtitle');
    expect(normalizeGenericItemEventStatus(' Abgeschlossen ')).toBe('completed');
  });

  it('supports empty filters and structured status/color values', () => {
    const record = item({ payload: { color: '', status: { label: 'Aktiv', color: '#123' } } });
    expect(
      parseGenericItemEvents([record], { genericType: 'ParticipationProject' }, ['2030-05-03'])
    ).toEqual(expect.arrayContaining([expect.objectContaining({ color: '#123' })]));
  });

  it('excludes type and status mismatches', () => {
    expect(
      parseGenericItemEvents([item()], { ...source, filterTypes: ['Workshop'] }, ['2030-05-03'])
    ).toEqual([]);
    expect(
      parseGenericItemEvents([item()], { ...source, filterStatuses: ['ended'] }, ['2030-05-03'])
    ).toEqual([]);
  });

  it('creates distinct sorted occurrences and skips invalid dates', () => {
    const dates = [
      { id: 'b', dateStart: '2030-05-04', timeStart: '09:00' },
      { id: 'a', dateFrom: '2030-05-03', timeFrom: '12:00' },
      { id: 'bad', dateStart: 'not-a-date' }
    ];
    const result = parseGenericItemEvents([item({ dates })], source, ['2030-05-03', '2030-05-04']);
    expect(result.map(({ id }) => id)).toEqual([
      'ParticipationProject:42:a:2030-05-03',
      'ParticipationProject:42:b:2030-05-04'
    ]);
  });

  it('uses a stable index fallback and orders equal-day occurrences by time then title', () => {
    const first = item({
      id: 'first',
      title: 'Zulu',
      dates: [{ dateStart: '2030-05-03', timeStart: '12:00' }]
    });
    const second = item({
      id: 'second',
      title: 'Alpha',
      dates: [
        { dateStart: '2030-05-03', timeStart: '09:00' },
        { dateStart: '2030-05-03', timeStart: '12:00' }
      ]
    });
    const result = parseGenericItemEvents([first, second], source, ['2030-05-03']);
    expect(result.map(({ title }) => title)).toEqual(['Alpha', 'Alpha', 'Zulu']);
    expect(result.map(({ id }) => id)).toEqual([
      'ParticipationProject:second:0:2030-05-03',
      'ParticipationProject:second:1:2030-05-03',
      'ParticipationProject:first:0:2030-05-03'
    ]);
  });

  it('builds the complete Generic Item detail navigation contract', () => {
    const record = item();
    expect(parseGenericItemEvents([record], source, ['2030-05-03'])[0].params).toEqual(
      expect.objectContaining({
        details: record,
        query: 'genericItem',
        queryVariables: { id: '42' },
        rootRouteName: 'ParticipationProjects',
        title: 'Beteiligung'
      })
    );
  });

  it('uses inclusive ranges and excludes past dates without a range', () => {
    expect(parseGenericItemEvents([item()], source, ['2030-05-03'])).toHaveLength(1);
    expect(parseGenericItemEvents([item()], source, ['2030-05-04', '2030-05-05'])).toEqual([]);
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    expect(
      parseGenericItemEvents([item({ dates: [{ id: 'past', dateStart: yesterday }] })], source)
    ).toEqual([]);
  });

  it('handles malformed records and configuration safely', () => {
    expect(parseGenericItemEvents(null, source)).toEqual([]);
    expect(parseGenericItemEvents([null, { payload: null }], source)).toEqual([]);
    expect(parseGenericItemEvents([item()], {} as GenericItemEventSource)).toEqual([]);
    expect(
      parseGenericItemEvents(
        [item()],
        {
          genericType: 'ParticipationProject',
          filterTypes: null,
          filterStatuses: null
        } as unknown as GenericItemEventSource,
        ['2030-05-03']
      )
    ).toHaveLength(1);
  });
});
