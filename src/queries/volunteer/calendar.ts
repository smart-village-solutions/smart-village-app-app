import _isNumber from 'lodash/isNumber';

import { colors } from '../../config';
import { formatTime } from '../../helpers/formatHelper';
import { momentFormat } from '../../helpers/momentHelper';
import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';
import { Calendar, PARTICIPANT_TYPE } from '../../types';

export const calendarAll = async (queryVariables?: {
  dateRange?: string[];
  contentContainerId?: number;
}) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  const id = queryVariables?.contentContainerId;

  if (id && _isNumber(id)) {
    return (await fetch(`${volunteerApiV2Url}calendar/container/${id}`, fetchObj)).json();
  }

  return (await fetch(`${volunteerApiV2Url}calendar`, fetchObj)).json();
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

export const calendarDelete = async (entryId: any) => {
  const authToken = await volunteerAuthToken();

  const fetchObj = {
    method: 'DELETE',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    }
  };

  return await fetch(`${volunteerApiV1Url}calendar/entry/${entryId}`, fetchObj);
};
