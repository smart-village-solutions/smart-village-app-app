import { useCallback, useMemo, useState } from 'react';

import {
  defaultVolunteerCalendarDateRange,
  volunteerCalendarDateRangeForVisibleRange
} from '../../helpers';
import type { VolunteerCalendarDateRange, VolunteerDateRange } from '../../types';

type QueryVariables = {
  dateRange?: VolunteerDateRange;
};

export const useVolunteerCalendarRange = <T extends QueryVariables>(
  queryVariables: T,
  isCalendar: boolean
) => {
  const [calendarDateRange, setCalendarDateRange] = useState<
    VolunteerCalendarDateRange | undefined
  >(() => {
    if (!isCalendar || queryVariables.dateRange?.length === 1) return undefined;
    if (queryVariables.dateRange?.[0] && queryVariables.dateRange?.[1]) {
      return [queryVariables.dateRange[0], queryVariables.dateRange[1]];
    }

    return defaultVolunteerCalendarDateRange();
  });

  const calendarQueryVariables = useMemo(
    () =>
      isCalendar && calendarDateRange
        ? { ...queryVariables, dateRange: calendarDateRange }
        : queryVariables,
    [calendarDateRange, isCalendar, queryVariables]
  );

  const updateCalendarDateRange = useCallback((visibleRange: VolunteerCalendarDateRange) => {
    setCalendarDateRange((currentRange) =>
      volunteerCalendarDateRangeForVisibleRange(
        currentRange || defaultVolunteerCalendarDateRange(),
        visibleRange
      )
    );
  }, []);

  return { calendarQueryVariables, updateCalendarDateRange };
};
