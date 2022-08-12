import _isNumber from 'lodash/isNumber';

import { colors, texts } from '../../config';
import { formatTime } from '../../helpers/formatHelper';
import { momentFormat } from '../../helpers/momentHelper';
import {
  volunteerApiV1Url,
  volunteerApiV2Url,
  volunteerAuthToken
} from '../../helpers/volunteerHelper';
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
    return (await fetch(`${volunteerApiV2Url}calendar/container/${id}`, fetchObj)).json();
  }

  return (await fetch(`${volunteerApiV2Url}calendar`, fetchObj)).json();
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
  organizer = '',
  entranceFee = '',
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
}: VolunteerCalendar) => {
  const authToken = await volunteerAuthToken();

  // add organizer information to the description field if present
  description = organizer?.length
    ? `${description}\n\n\n<strong>${texts.volunteer.organizer}</strong>\n\n${organizer}`
    : description;

  // add entrance fee information to the description field if present
  description = entranceFee?.length
    ? `${description}\n\n\n<strong>${texts.volunteer.entranceFee}</strong>\n\n${entranceFee}`
    : description;

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
    await fetch(`${volunteerApiV1Url}calendar/container/${contentContainerId}`, fetchObj)
  ).json();
};
