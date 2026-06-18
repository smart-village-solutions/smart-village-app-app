import {
  buildProfileContentListItems,
  buildProfileContentSections,
  buildProfileContentSectionedList
} from '../../src/helpers/profileContentHelper';
import { QUERY_TYPES } from '../../src/queries/types';

describe('buildProfileContentListItems', () => {
  it('combines own news, points of interest and events sorted by newest update', () => {
    const result = buildProfileContentListItems({
      eventRecords: [
        {
          id: '3',
          title: 'Event',
          listDate: '2026-04-01',
          updatedAt: '2026-04-03T08:00:00Z'
        }
      ],
      newsItems: [
        {
          id: '1',
          contentBlocks: [{ title: 'News' }],
          publishedAt: '2026-04-02T08:00:00Z',
          updatedAt: '2026-04-04T08:00:00Z'
        }
      ],
      pointsOfInterest: [
        {
          id: '2',
          name: 'POI',
          updatedAt: '2026-04-01T08:00:00Z'
        }
      ]
    });

    expect(result.map((item) => item.params.query)).toEqual([
      QUERY_TYPES.NEWS_ITEM,
      QUERY_TYPES.EVENT_RECORD,
      QUERY_TYPES.POINT_OF_INTEREST
    ]);
    expect(result.map((item) => item.title)).toEqual(['News', 'Event', 'POI']);
    expect(result.map((item) => item.bottomDivider)).toEqual([true, true, false]);
  });

  it('falls back to created and content dates when updatedAt is missing', () => {
    const result = buildProfileContentListItems({
      eventRecords: [{ id: '1', title: 'Event', listDate: '2026-05-01' }],
      newsItems: [
        {
          id: '2',
          contentBlocks: [{ title: 'News' }],
          publishedAt: '2026-05-03T08:00:00Z'
        }
      ],
      pointsOfInterest: [{ id: '3', name: 'POI', createdAt: '2026-05-02T08:00:00Z' }]
    });

    expect(result.map((item) => item.title)).toEqual(['News', 'POI', 'Event']);
  });

  it('groups own content by content type with sticky section header indices', () => {
    const result = buildProfileContentSectionedList({
      eventRecords: [{ id: '1', title: 'Event', listDate: '2026-05-01' }],
      newsItems: [
        {
          id: '2',
          contentBlocks: [{ title: 'News' }],
          publishedAt: '2026-05-03T08:00:00Z'
        }
      ],
      pointsOfInterest: [{ id: '3', name: 'POI', createdAt: '2026-05-02T08:00:00Z' }]
    });

    expect(result.listItems.map((item) => (typeof item === 'string' ? item : item.title))).toEqual([
      'Termine',
      'Event',
      'Nachrichten',
      'News',
      'Orte',
      'POI'
    ]);
    expect(result.stickyHeaderIndices).toEqual([0, 2, 4]);
  });

  it('builds home-section style content sections', () => {
    const result = buildProfileContentSections({
      eventRecords: [
        {
          id: '1',
          title: 'Event',
          listDate: '2026-05-01',
          date: { timeFrom: '08:30' },
          addresses: [{ addition: 'FOZ Bremen' }]
        }
      ],
      newsItems: [
        {
          id: '2',
          contentBlocks: [{ title: 'News' }],
          publishedAt: '2026-05-03T08:00:00Z'
        }
      ],
      pointsOfInterest: [{ id: '3', name: 'POI', createdAt: '2026-05-02T08:00:00Z' }]
    });

    expect(result.map(({ title }) => title)).toEqual(['Termine', 'Nachrichten', 'Orte']);
    expect(result.map(({ data }) => data.map((item) => item.title))).toEqual([
      ['Event'],
      ['News'],
      ['POI']
    ]);
    expect(result[0].data[0].subtitle).toBe('01.05.2026, 08:30 Uhr | FOZ Bremen');
  });
});
