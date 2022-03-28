import _orderBy from 'lodash/orderBy';
import _sortBy from 'lodash/sortBy';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import {
  isAttending,
  isOwner,
  isUpcomingDate,
  volunteerListDate,
  volunteerUserData
} from '../../helpers';
import { getQuery, QUERY_TYPES } from '../../queries';
import { VolunteerQuery } from '../../types';

export const useVolunteerData = ({
  query,
  queryVariables,
  isCalendar,
  onlyUpcoming = true
}: {
  query: VolunteerQuery;
  queryVariables?: { dateRange?: string[] };
  isCalendar?: boolean;
  onlyUpcoming?: boolean;
}): {
  data: any[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, isRefetching, refetch } = useQuery(query, getQuery(query));
  const [isProcessing, setIsProcessing] = useState(true);
  const [volunteerData, setVolunteerData] = useState<any[]>([]);

  const processVolunteerData = useCallback(async () => {
    let processedVolunteerData = data?.results as any[];

    setIsProcessing(true);

    if (isCalendar) {
      // add `listDate` to appointments for calendar list view
      processedVolunteerData = processedVolunteerData?.map((item: any) => ({
        ...item,
        listDate: volunteerListDate(item)
      }));

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

      processedVolunteerData = _sortBy(processedVolunteerData, 'listDate');

      if (query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY) {
        const { currentUserId } = await volunteerUserData();
        // show only attending dates for current user if on personal calendar view
        processedVolunteerData = processedVolunteerData?.filter(
          (item: { participants?: { attending?: [] } }) =>
            isAttending(currentUserId, item.participants?.attending)
        );
      }
    }

    if (query === QUERY_TYPES.VOLUNTEER.GROUPS_MY) {
      const { currentUserId } = await volunteerUserData();
      // show only attending dates for current user if on personal calendar view
      processedVolunteerData = processedVolunteerData?.filter((item: { owner: { id: number } }) =>
        isOwner(currentUserId, item.owner)
      );
    }

    if (query === QUERY_TYPES.VOLUNTEER.CONVERSATIONS) {
      processedVolunteerData = _orderBy(processedVolunteerData, 'updated_at', 'desc');
    }

    setVolunteerData(processedVolunteerData);
    setIsProcessing(false);
  }, [query, queryVariables, onlyUpcoming, data, refetch]);

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