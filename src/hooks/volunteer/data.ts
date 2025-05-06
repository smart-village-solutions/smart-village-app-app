import _orderBy from 'lodash/orderBy';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import {
  isAttending,
  isUpcomingDate,
  parseListItemsFromQuery,
  volunteerUserData
} from '../../helpers';
import { QUERY_TYPES, getQuery } from '../../queries';
import { MEMBER_STATUS_TYPES, VolunteerQuery } from '../../types';

export const VOLUNTEER_FILTER_BY = {
  ARCHIVED: 'archived',
  FOLLOW: 'follow',
  MEMBER: 'member',
  NONE: 'none'
};

export const VOLUNTEER_SORT_BY = {
  ALPHABETICAL: 'name asc',
  CREATED_AT_LATEST_FIRST: 'id desc',
  CREATED_AT_OLDEST_FIRST: 'id asc'
};

/* eslint-disable complexity */
export const useVolunteerData = ({
  bookmarkable,
  filterVariables,
  isCalendar,
  isSectioned,
  onlyUpcoming = true,
  query,
  queryOptions,
  queryVariables,
  titleDetail
}: {
  bookmarkable?: boolean;
  filterVariables?: { search?: string; sortBy?: string; status?: string };
  isCalendar?: boolean;
  isSectioned?: boolean;
  onlyUpcoming?: boolean;
  query: VolunteerQuery;
  queryOptions?: { refetchInterval?: number; enabled?: boolean };
  queryVariables?: { dateRange?: string[]; contentContainerId?: number; id?: number };
  titleDetail?: string;
}): {
  data: any[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
  userGuid?: string | null;
} => {
  const { data, isLoading, isRefetching, refetch } = useQuery(
    [query, queryVariables],
    () => getQuery(query)(queryVariables),
    queryOptions
  );

  const [isProcessing, setIsProcessing] = useState(true);
  const [userGuid, setUserGuid] = useState<string | null>();
  const [volunteerData, setVolunteerData] = useState<any[]>([]);

  const processVolunteerData = useCallback(async () => {
    const { currentUserId, currentUserGuid } = await volunteerUserData();
    setUserGuid(currentUserGuid);
    let processedVolunteerData = data?.results as any[];

    if (query === QUERY_TYPES.VOLUNTEER.CALENDAR) {
      processedVolunteerData = data?.participants?.attending as any[];
    }

    if (filterVariables?.search?.length) {
      processedVolunteerData = processedVolunteerData?.filter(
        (item: { description?: string; name?: string; tags?: string[] }) =>
          item.description?.toLowerCase().includes(filterVariables.search.toLowerCase()) ||
          item.name?.toLowerCase().includes(filterVariables.search.toLowerCase()) ||
          item.tags?.map((tag) => tag.toLowerCase())?.includes(filterVariables.search.toLowerCase())
      );
    }

    if (filterVariables?.status?.length) {
      switch (filterVariables?.status) {
        case VOLUNTEER_FILTER_BY.ARCHIVED:
          processedVolunteerData = processedVolunteerData?.filter(
            (item: { status?: number; userIsMember?: boolean; userIsFollower?: boolean }) =>
              item.status === 2
          );
          break;

        case VOLUNTEER_FILTER_BY.FOLLOW:
          processedVolunteerData = processedVolunteerData?.filter(
            (item: { status?: number; userIsMember?: boolean; userIsFollower?: boolean }) =>
              item.userIsFollower === true
          );
          break;

        case VOLUNTEER_FILTER_BY.MEMBER:
          processedVolunteerData = processedVolunteerData?.filter(
            (item: { status?: number; userIsMember?: boolean; userIsFollower?: boolean }) =>
              item.userIsMember === true
          );
          break;
        case VOLUNTEER_FILTER_BY.NONE:
          processedVolunteerData = processedVolunteerData?.filter(
            (item: { status?: number; userIsMember?: boolean; userIsFollower?: boolean }) =>
              item.userIsMember === false && item.userIsFollower === false
          );
          break;
        default:
          break;
      }
    }

    processedVolunteerData = parseListItemsFromQuery(query, processedVolunteerData, titleDetail, {
      bookmarkable,
      withDate: query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS || (!isSectioned ?? !isCalendar),
      isSectioned: isSectioned ?? isCalendar,
      queryVariables: {
        currentUserId
      }
    });

    setIsProcessing(true);

    if (isCalendar) {
      if (queryVariables?.dateRange?.length) {
        // show only selected day appointments for calendar list view
        processedVolunteerData = processedVolunteerData?.filter(
          (item: { listDate: string }) => item.listDate == queryVariables.dateRange?.[0]
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
      const sortBy = filterVariables?.sortBy || VOLUNTEER_SORT_BY.ALPHABETICAL;

      const [sortField, sortOrder] = sortBy.split(' ');
      processedVolunteerData = _orderBy(
        processedVolunteerData,
        sortBy === VOLUNTEER_SORT_BY.ALPHABETICAL
          ? [(item) => item[sortField]?.toString().toLowerCase()]
          : sortField,
        sortOrder as 'asc' | 'desc'
      );
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
      processedVolunteerData = _orderBy(processedVolunteerData, 'display_name', 'asc');
    }

    setVolunteerData(processedVolunteerData);
    setIsProcessing(false);
  }, [
    query,
    queryVariables,
    isCalendar,
    isSectioned,
    onlyUpcoming,
    data,
    filterVariables,
    titleDetail,
    bookmarkable
  ]);

  useEffect(() => {
    processVolunteerData();
  }, [processVolunteerData]);

  return {
    data: volunteerData,
    isLoading: isLoading || isProcessing,
    isRefetching,
    refetch,
    userGuid
  };
};
/* eslint-enable complexity */
