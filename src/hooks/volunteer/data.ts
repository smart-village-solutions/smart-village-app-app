import _sortBy from 'lodash/sortBy';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { isAttending, isUpcomingDate, volunteerListDate, volunteerUserData } from '../../helpers';
import { getQuery, QUERY_TYPES } from '../../queries';

export const useVolunteerData = ({
  query,
  queryVariables,
  onlyUpcoming = true
}: {
  query: string;
  queryVariables?: { dateRange?: string[] };
  onlyUpcoming?: boolean;
}): {
  data: any[];
  isLoading: boolean;
  isRefetching: boolean;
  refetch: () => void;
} => {
  const { data, isLoading, isRefetching, refetch } = useQuery(query, getQuery(query));
  const [isProcessing, setIsProcessing] = useState(false);
  const [volunteerData, setVolunteerData] = useState<any[]>([]);

  const processVolunteerData = useCallback(async () => {
    const isCalendar =
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL ||
      query === QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY;

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

    setVolunteerData(processedVolunteerData);
    setIsProcessing(false);
  }, [query, queryVariables, onlyUpcoming, data]);

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
