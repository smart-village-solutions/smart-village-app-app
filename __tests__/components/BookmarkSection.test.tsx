/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render } from '@testing-library/react-native';

import { BookmarkSection } from '../../src/components/bookmarks/BookmarkSection';

const mockGraphqlRequest = jest.fn();
const mockVolunteerQuery = jest.fn();
const capturedQueryFunctions: Record<string, () => Promise<unknown>> = {};
const capturedQueryVariables: Record<string, Record<string, unknown>> = {};
let mockQueryErrors: Record<string, boolean> = {};
let mockDataListProps: Record<string, unknown>;

jest.mock('expo-router/react-navigation', () => ({
  useFocusEffect: jest.fn()
}));
jest.mock('react-query', () => ({
  useQuery: (
    [query, variables]: [string, Record<string, unknown>],
    queryFunction: () => Promise<unknown>
  ) => {
    capturedQueryFunctions[query] = queryFunction;
    capturedQueryVariables[query] = variables;
    return {
      data:
        query === 'calendarAll'
          ? { results: [{ id: 'volunteer-event', listDate: '2030-01-02' }] }
          : { eventRecords: [{ id: 'native-event', listDate: '2030-01-01' }] },
      isError: !!mockQueryErrors[query],
      isLoading: false,
      refetch: jest.fn()
    };
  }
}));
jest.mock('../../src/ReactQueryClient', () => ({
  ReactQueryClient: jest.fn(async () => ({ request: mockGraphqlRequest }))
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn((query: string) =>
    query === 'calendarAll' ? mockVolunteerQuery : 'graphql-document'
  ),
  QUERY_TYPES: {
    EVENT_RECORDS: 'eventRecords',
    GENERIC_ITEMS: 'genericItems',
    VOLUNTEER: { CALENDAR_ALL: 'calendarAll' },
    VOUCHERS: 'vouchers'
  }
}));
jest.mock('../../src/components/DataListSection', () => ({
  DataListSection: (props: Record<string, unknown>) => {
    mockDataListProps = props;
    return null;
  }
}));
jest.mock('../../src/helpers', () => ({
  parseListItemsFromQuery: jest.fn((_query: string, data: unknown[]) => data || [])
}));
jest.mock('../../src/components/Text', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ReactLocal = require('react');

  return {
    RegularText: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement('Text', null, children)
  };
});
jest.mock('../../src/components/Wrapper', () => ({
  WrapperVertical: ({ children }: { children: React.ReactNode }) => children
}));
jest.mock('../../src/config', () => ({
  texts: { bookmarks: { showAll: 'Show all' }, errors: { unexpected: 'Unexpected error' } }
}));

describe('BookmarkSection', () => {
  beforeEach(() => {
    mockQueryErrors = {};
  });

  it('executes the Volunteer REST query instead of passing it to the GraphQL client', async () => {
    render(
      <BookmarkSection
        ids={['42']}
        navigation={{ navigate: jest.fn() } as any}
        query="calendarAll"
        sectionTitle="Volunteer events"
      />
    );

    await capturedQueryFunctions.calendarAll();

    expect(mockVolunteerQuery).toHaveBeenCalledWith({ ids: ['42'] });
    expect(mockGraphqlRequest).not.toHaveBeenCalled();
  });

  it('renders native and Volunteer favorites in one event section', () => {
    render(
      <BookmarkSection
        additionalIds={['volunteer-event']}
        additionalQuery="calendarAll"
        ids={['native-event']}
        navigation={{ navigate: jest.fn() } as any}
        query="eventRecords"
        sectionTitle="Events"
      />
    );

    expect(mockDataListProps).toEqual(
      expect.objectContaining({
        additionalData: [{ id: 'volunteer-event', listDate: '2030-01-02' }],
        sectionData: { eventRecords: [{ id: 'native-event', listDate: '2030-01-01' }] },
        sectionTitle: 'Events'
      })
    );
  });

  it('loads all event favorites before limiting the merged chronological preview', () => {
    render(
      <BookmarkSection
        additionalIds={['volunteer-1', 'volunteer-2', 'volunteer-3', 'volunteer-4']}
        additionalQuery="calendarAll"
        ids={['native-1', 'native-2', 'native-3', 'native-4']}
        navigation={{ navigate: jest.fn() } as any}
        query="eventRecords"
        sectionTitle="Events"
      />
    );

    expect(capturedQueryVariables.eventRecords).toEqual({
      ids: ['native-1', 'native-2', 'native-3', 'native-4'],
      onlyUniqEvents: true
    });
    expect(capturedQueryVariables.calendarAll).toEqual({
      ids: ['volunteer-1', 'volunteer-2', 'volunteer-3', 'volunteer-4']
    });
    expect(mockDataListProps).toEqual(expect.objectContaining({ limit: 3 }));
  });

  it('shows an error instead of a partial list when one event source fails', () => {
    mockQueryErrors = { calendarAll: true };

    const { getByText } = render(
      <BookmarkSection
        additionalIds={['volunteer-event']}
        additionalQuery="calendarAll"
        ids={['native-event']}
        navigation={{ navigate: jest.fn() } as any}
        query="eventRecords"
        sectionTitle="Events"
      />
    );

    expect(getByText('Unexpected error')).toBeTruthy();
  });
});
