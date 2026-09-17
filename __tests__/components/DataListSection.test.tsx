/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react-native';

import { DataListSection } from '../../src/components/DataListSection';

let mockListProps: Record<string, any>;

jest.mock('../../src/helpers', () => ({
  getTitleForQuery: jest.fn(() => 'Events'),
  parseListItemsFromQuery: jest.fn(() => [])
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    EVENT_RECORDS: 'eventRecords',
    GENERIC_ITEMS: 'genericItems',
    POINTS_OF_INTEREST_AND_TOURS: 'pointsOfInterestAndTours',
    VOLUNTEER: {
      CALENDAR_ALL: 'volunteerCalendarAll',
      CALENDAR_ALL_MY: 'volunteerCalendarAllMy',
      CONVERSATIONS: 'volunteerConversations'
    },
    VOUCHERS: 'vouchers'
  }
}));
jest.mock('../../src/config', () => ({
  consts: { a11yLabel: { button: '(Taste)', heading: '(Überschrift)' } },
  device: { platform: 'ios' },
  Icon: { ArrowRight: () => null },
  normalize: (value: number) => value
}));
jest.mock('../../src/components/ListComponent', () => ({
  ListComponent: (props: Record<string, any>) => {
    mockListProps = props;
    return null;
  }
}));

describe('DataListSection', () => {
  it('renders additional data when the main query has no records', () => {
    const additionalEvent = {
      id: 'generic-event-1',
      listDate: '2030-01-01T10:00:00.000Z',
      title: 'Generic Item Event'
    };

    render(
      <DataListSection
        additionalData={[additionalEvent]}
        navigation={{} as any}
        query="eventRecords"
        sectionData={[]}
      />
    );

    expect(mockListProps.data).toEqual([additionalEvent]);
  });

  it('removes the divider from the last visible mixed-source item', () => {
    const events = [
      { id: 'main', bottomDivider: false, listDate: '2030-01-01', title: 'Main Event' },
      { id: 'generic', listDate: '2030-01-02', title: 'Generic Event' },
      { id: 'later', listDate: '2030-01-03', title: 'Later Event' }
    ];

    render(
      <DataListSection
        additionalData={events}
        limit={2}
        navigation={{} as any}
        query="eventRecords"
        sectionData={[]}
        skipLastDivider
      />
    );

    expect(mockListProps.data).toEqual([
      { ...events[0], bottomDivider: true },
      { ...events[1], bottomDivider: false }
    ]);
  });

  it('sorts mixed event sources by date and time before applying the limit', () => {
    const nativeEvents = [
      { id: 'previous-day', listDate: '2030-01-01', startTime: '10:30', title: 'Previous day' },
      { id: 'native-noon', listDate: '2030-01-02', startTime: '12:00', title: 'Native noon' },
      { id: 'native-afternoon', listDate: '2030-01-02', startTime: '16:00', title: 'Afternoon' }
    ];
    const volunteerEvent = {
      id: 'volunteer-noon',
      listDate: '2030-01-02',
      startTime: '12:00',
      title: 'Volunteer noon'
    };

    const { parseListItemsFromQuery } = jest.requireMock('../../src/helpers');
    parseListItemsFromQuery.mockReturnValueOnce(nativeEvents);

    render(
      <DataListSection
        additionalData={[volunteerEvent]}
        limit={3}
        navigation={{} as any}
        query="eventRecords"
        sectionData={nativeEvents}
      />
    );

    expect(mockListProps.data).toEqual([nativeEvents[0], nativeEvents[1], volunteerEvent]);
  });
});
