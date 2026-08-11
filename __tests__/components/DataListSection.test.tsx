/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react-native';

import { DataListSection } from '../../src/components/DataListSection';

let mockListProps: Record<string, any>;

jest.mock('../../src/helpers', () => ({
  getTitleForQuery: jest.fn(() => 'Events'),
  parseListItemsFromQuery: jest.fn(() => [])
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
      { id: 'main', listDate: '2030-01-01', title: 'Main Event' },
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

    expect(mockListProps.data).toEqual([events[0], { ...events[1], bottomDivider: false }]);
  });
});
