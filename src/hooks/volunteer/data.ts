import _orderBy from 'lodash/orderBy';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import {
  isAttending,
  isUpcomingDate,
  parseListItemsFromQuery,
  volunteerUserData
} from '../../helpers';
import { additionalData, myProfile, myTasks } from '../../helpers/parser/volunteer';
import { getQuery, QUERY_TYPES } from '../../queries';
import { MEMBER_STATUS_TYPES, VolunteerQuery } from '../../types';

/* eslint-disable complexity */
export const useVolunteerData = ({
  query,
  queryVariables,
  queryOptions,
  isCalendar,
  isSectioned,
  onlyUpcoming = true,
  titleDetail,
  bookmarkable
}: {
  query: VolunteerQuery;
  queryVariables?: { dateRange?: string[]; contentContainerId?: number } | number;
  queryOptions?: { refetchInterval?: number; enabled?: boolean };
  isCalendar?: boolean;
  isSectioned?: boolean;
  onlyUpcoming?: boolean;
  titleDetail?: string;
  bookmarkable?: boolean;
}): {
  data: any[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, isRefetching, refetch } = useQuery(
    [query, queryVariables],
    () => getQuery(query)(queryVariables),
    queryOptions
  );

  const [isProcessing, setIsProcessing] = useState(true);
  const [volunteerData, setVolunteerData] = useState<any[]>([]);

  const processVolunteerData = useCallback(async () => {
    const { currentUserId } = await volunteerUserData();
    let processedVolunteerData = data?.results as any[];

    // TODO: remove if all queries exist
    const details = {
      [QUERY_TYPES.VOLUNTEER.PROFILE]: myProfile(),
      [QUERY_TYPES.VOLUNTEER.TASKS]: myTasks(),
      [QUERY_TYPES.VOLUNTEER.ADDITIONAL]: additionalData()
    }[query];

    processedVolunteerData = parseListItemsFromQuery(
      query,
      processedVolunteerData || details,
      titleDetail,
      {
        bookmarkable,
        skipLastDivider: true,
        withDate: query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS || (!isSectioned ?? isCalendar),
        isSectioned: isSectioned ?? isCalendar,
        queryVariables: {
          currentUserId
        }
      }
    );

    setIsProcessing(true);

    if (isCalendar) {
      if (queryVariables?.dateRange?.length) {
        // show only selected day appointments for calendar list view
        processedVolunteerData = processedVolunteerData?.filter(
          (item: { listDate: string }) => item.listDate == queryVariables?.dateRange?.[0]
        );
      } else if (onlyUpcoming) {
        // show only upcoming dates for calendar views
        processedVolunteerData = processedVolunteerData?.filter((item: { listDate: string }) =>
          isUpcomingDate(item.listDate)
        );
      }

      if (query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY) {
        // show only attending dates for current user if on personal calendar view
        processedVolunteerData = processedVolunteerData?.filter(
          (item: { participants?: { attending?: [] } }) =>
            isAttending(currentUserId, item.participants?.attending)
        );
      }
    }

    // ORDERING
    if (query === QUERY_TYPES.VOLUNTEER.GROUPS || query === QUERY_TYPES.VOLUNTEER.GROUPS_MY) {
      processedVolunteerData = _orderBy(processedVolunteerData, 'name', 'asc');
    }

    if (isCalendar) {
      processedVolunteerData = _orderBy(processedVolunteerData, ['start_datetime', 'title'], 'asc');
    }

    if (query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS) {
      processedVolunteerData = _orderBy(processedVolunteerData, 'updated_at', 'desc');
    }

    if (query === QUERY_TYPES.VOLUNTEER.MEMBERS) {
      processedVolunteerData = processedVolunteerData?.filter(
        (member: { status: number }) => member.status === MEMBER_STATUS_TYPES.MEMBER
      );
      processedVolunteerData = _orderBy(processedVolunteerData, 'user.display_name', 'asc');
    }

    if (query === QUERY_TYPES.VOLUNTEER.APPLICANTS) {
      processedVolunteerData = processedVolunteerData?.filter(
        (member: { status: number }) => member.status === MEMBER_STATUS_TYPES.APPLICANT
      );
      processedVolunteerData = _orderBy(processedVolunteerData, 'user.display_name', 'asc');
    }

    if (query === QUERY_TYPES.VOLUNTEER.CALENDAR) {
      processedVolunteerData = _orderBy(data?.participants?.attending, 'display_name', 'asc');
    }

    setVolunteerData(processedVolunteerData);
    setIsProcessing(false);
  }, [query, queryVariables, isCalendar, isSectioned, onlyUpcoming, data, refetch]);

  useEffect(() => {
    processVolunteerData();
  }, [processVolunteerData]);

  return {
    data: volunteerData,
    isLoading: isLoading || isProcessing,
    isRefetching,
    refetch
  };
};
/* eslint-enable complexity */
