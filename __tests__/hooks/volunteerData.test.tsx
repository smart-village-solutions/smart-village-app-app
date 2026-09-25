import React from 'react';
import { act, render } from '@testing-library/react-native';

const mockUseQuery = jest.fn();
const mockVolunteerUserData = jest.fn();

jest.mock('react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args)
}));
jest.mock('../../src/helpers', () => ({
  isAttending: jest.fn(() => false),
  parseListItemsFromQuery: jest.fn((_query, data) => data || []),
  volunteerEventIsUpcoming: jest.fn(() => true),
  volunteerEventOverlapsDate: jest.fn(() => true),
  volunteerUserData: (...args: unknown[]) => mockVolunteerUserData(...args)
}));
jest.mock('../../src/queries', () => ({
  getQuery: jest.fn(() => jest.fn()),
  QUERY_TYPES: {
    VOLUNTEER: {
      APPLICANTS: 'volunteerApplicants',
      CALENDAR: 'volunteerCalendarEntry',
      CALENDAR_ALL: 'volunteerCalendar',
      CALENDAR_ALL_MY: 'volunteerCalendarMy',
      CONVERSATIONS: 'volunteerConversations',
      GROUPS: 'volunteerGroups',
      GROUPS_MY: 'volunteerGroupsMy',
      MEMBERS: 'volunteerMembers'
    }
  }
}));
jest.mock('../../src/types', () => ({
  MEMBER_STATUS_TYPES: { APPLICANT: 1, MEMBER: 2 }
}));

import { useVolunteerData } from '../../src/hooks/volunteer/data';

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
};

describe('useVolunteerData', () => {
  it('does not publish an older processing result after the range changes', async () => {
    const firstUserData = deferred<{
      currentUserId: string;
      currentUserGuid: string;
      currentUserContentContainerId: string;
    }>();
    const secondUserData = deferred<{
      currentUserId: string;
      currentUserGuid: string;
      currentUserContentContainerId: string;
    }>();
    let queryData = { results: [{ id: 'old' }] };
    let latestData: unknown[] = [];
    mockUseQuery.mockImplementation(() => ({
      data: queryData,
      isLoading: false,
      isRefetching: false,
      refetch: jest.fn()
    }));
    mockVolunteerUserData
      .mockReturnValueOnce(firstUserData.promise)
      .mockReturnValueOnce(secondUserData.promise);

    const Harness = ({ dateRange }: { dateRange: [string, string] }) => {
      const queryVariables = React.useMemo(() => ({ dateRange }), [dateRange]);
      const { data } = useVolunteerData({
        isCalendar: true,
        onlyUpcoming: false,
        query: 'volunteerCalendar' as never,
        queryVariables
      });
      latestData = data;

      return null;
    };

    const view = render(<Harness dateRange={['2026-06-01', '2026-06-30']} />);
    queryData = { results: [{ id: 'new' }] };
    view.rerender(<Harness dateRange={['2026-07-01', '2026-07-31']} />);

    await act(async () => {
      secondUserData.resolve({
        currentUserId: '2',
        currentUserGuid: 'new-user',
        currentUserContentContainerId: '2'
      });
      await secondUserData.promise;
    });
    expect(latestData).toEqual([{ id: 'new' }]);

    await act(async () => {
      firstUserData.resolve({
        currentUserId: '1',
        currentUserGuid: 'old-user',
        currentUserContentContainerId: '1'
      });
      await firstUserData.promise;
    });
    expect(latestData).toEqual([{ id: 'new' }]);
  });
});
