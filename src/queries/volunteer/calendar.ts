import _isNumber from 'lodash/isNumber';

import { colors } from '../../config';
import { formatTime } from '../../helpers/formatHelper';
import { momentFormat } from '../../helpers/momentHelper';
import { volunteerApiUrl, volunteerAuthToken } from '../../helpers/volunteerHelper';
import { PARTICIPANT_TYPE, VolunteerCalendar } from '../../types';

export const calendarAll = async (
  queryVariables?: { dateRange?: string[]; contentContainerId?: number } | number
) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  const id =
    queryVariables && _isNumber(queryVariables)
      ? queryVariables
      : queryVariables?.contentContainerId;

  if (id && _isNumber(id)) {
    return (await fetch(`${volunteerApiUrl}calendar/container/${id}`, fetchObj)).json();
  }

  return (await fetch(`${volunteerApiUrl}calendar`, fetchObj)).json();
};

export const calendar = async (id: number) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return (await fetch(`${volunteerApiUrl}calendar/entry/${id}`, fetchObj)).json();
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

  return (await fetch(`${volunteerApiUrl}calendar/entry/${id}/respond`, fetchObj)).json();
};

export const calendarNew = async ({
  title,
  description = '',
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
  forceJoin = 1,
  topics,
  contentContainerId
}: VolunteerCalendar) => {
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
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    body: JSON.stringify(formData)
  };

  return (
    await fetch(`${volunteerApiUrl}calendar/container/${contentContainerId}`, fetchObj)
  ).json();
};
