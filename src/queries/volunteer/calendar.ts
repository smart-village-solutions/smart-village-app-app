import _isNumber from 'lodash/isNumber';
import moment from 'moment';

import { colors } from '../../config';
import { formatTime } from '../../helpers/formatHelper';
import { momentFormat } from '../../helpers/momentHelper';
import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';
import { Calendar, PARTICIPANT_TYPE } from '../../types';
import type { VolunteerDateRange } from '../../types';

const MAX_CONCURRENT_PAGE_REQUESTS_PER_ENDPOINT = 3;

export const calendarAll = async (queryVariables?: {
  dateRange?: VolunteerDateRange;
  contentContainerId?: number;
  ids?: string[];
}) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  if (queryVariables?.ids?.length) {
    const results = await Promise.all(
      queryVariables.ids.map(async (id) => {
        const response = await fetch(`${volunteerApiV2Url}calendar/entry/${id}`, fetchObj);

        if (response.ok === false) {
          if (response.status === 404) return undefined;

          throw new Error(`Volunteer calendar request failed with status ${response.status}`);
        }

        return response.json();
      })
    );

    return { results: results.filter(Boolean) };
  }

  const id = queryVariables?.contentContainerId;
  const baseUrl =
    id && _isNumber(id)
      ? `${volunteerApiV2Url}calendar/container/${id}`
      : `${volunteerApiV2Url}calendar`;
  const requestedStart =
    queryVariables?.dateRange?.[0] || momentFormat(Date.now(), 'YYYY-MM-DD', 'x');
  const requestedEnd =
    queryVariables?.dateRange?.[1] ||
    queryVariables?.dateRange?.[0] ||
    moment(requestedStart).add(365, 'days').format('YYYY-MM-DD');
  const baseSearchParams = new URLSearchParams({
    start_date: requestedStart,
    end_date: requestedEnd,
    pagination: '1',
    limit: '100'
  });

  const fetchPage = async (url: string, page?: number) => {
    const searchParams = new URLSearchParams(baseSearchParams.toString());

    if (page && page > 1) {
      searchParams.set('page', String(page));
    }

    const response = await fetch(`${url}?${searchParams.toString()}`, fetchObj);

    if (response.ok === false) {
      if (response.status === 404 && url.endsWith('/recurring')) {
        const error = await response.json();

        if (error?.message?.startsWith('No recurring events are present')) {
          return { pages: 1, results: [] };
        }
      }

      throw new Error(`Volunteer calendar request failed with status ${response.status}`);
    }

    const data = await response.json();

    return Array.isArray(data) ? { pages: 1, results: data } : data;
  };

  const fetchAllPages = async (url: string) => {
    const firstPage = await fetchPage(url);
    const totalPages = Number(firstPage?.pages) || 1;

    if (totalPages <= 1) {
      return firstPage?.results || [];
    }

    const additionalPages = [];

    for (let page = 2; page <= totalPages; page += MAX_CONCURRENT_PAGE_REQUESTS_PER_ENDPOINT) {
      const pageBatch = Array.from(
        {
          length: Math.min(MAX_CONCURRENT_PAGE_REQUESTS_PER_ENDPOINT, totalPages - page + 1)
        },
        (_, index) => fetchPage(url, page + index)
      );

      additionalPages.push(...(await Promise.all(pageBatch)));
    }

    return [
      ...(firstPage?.results || []),
      ...additionalPages.flatMap((page) => page?.results || [])
    ];
  };

  const [regularEvents, recurringEvents] = await Promise.all([
    fetchAllPages(baseUrl),
    fetchAllPages(`${baseUrl}/recurring`)
  ]);
  const eventsByOccurrence = new Map();

  [...regularEvents, ...recurringEvents].forEach((event) => {
    const occurrenceKey = [
      event.id,
      event.start_datetime,
      event.end_datetime,
      event.time_zone
    ].join('|');

    eventsByOccurrence.set(occurrenceKey, event);
  });

  return {
    results: Array.from(eventsByOccurrence.values())
  };
};

export const calendar = async ({ id }: { id: number }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiV2Url}calendar/entry/${id}`, fetchObj)).json();
};

export const calendarAttend = async ({ id, type }: { id: number; type: PARTICIPANT_TYPE }) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify({ type })
  };

  return (await fetch(`${volunteerApiV1Url}calendar/entry/${id}/respond`, fetchObj)).json();
};

// eslint-disable-next-line complexity
export const calendarNew = async ({
  title,
  description = '',
  calendarId,
  color = colors.primary.startsWith('#') ? colors.primary : colors.darkText,
  location = '',
  participationMode = 2,
  maxParticipants = '',
  allowDecline = 1,
  allowMaybe = 1,
  participantInfo = '',
  isPublic = 0,
  startDate,
  startTime,
  endDate,
  endTime,
  timeZone = 'Europe/Berlin',
  forceJoin = 0,
  topics,
  contentContainerId
}: Calendar) => {
  const authToken = await volunteerAuthToken();

  const formData = {
    CalendarEntry: {
      title,
      description,
      color,
      location,
      all_day: !startTime && !endTime ? 1 : 0,
      participation_mode: participationMode,
      max_participants: maxParticipants,
      allow_decline: allowDecline,
      allow_maybe: allowMaybe,
      participant_info: participantInfo
    },
    CalendarEntryForm: {
      is_public: isPublic ? 1 : 0,
      start_date: startDate && momentFormat(startDate, 'YYYY-MM-DD'),
      start_time: startTime && formatTime(startTime),
      end_date: endDate && momentFormat(endDate, 'YYYY-MM-DD'),
      end_time: endTime && formatTime(endTime),
      timeZone,
      forceJoin,
      topics
    }
  };

  const fetchObj = {
    method: calendarId ? 'PUT' : 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  if (calendarId) {
    return (await fetch(`${volunteerApiV1Url}calendar/entry/${calendarId}`, fetchObj)).json();
  }

  return (
    await fetch(`${volunteerApiV1Url}calendar/container/${contentContainerId}`, fetchObj)
  ).json();
};

export const calendarDelete = async (entryId: number | string) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(`${volunteerApiV1Url}calendar/entry/${entryId}`, fetchObj);
};
