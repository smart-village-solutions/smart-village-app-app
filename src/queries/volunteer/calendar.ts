import { colors, secrets } from '../../config';
import * as appJson from '../../../app.json';
import { formatTime, volunteerAuthToken } from '../../helpers';
import { VolunteerCalendar } from '../../types';

const namespace = appJson.expo.slug as keyof typeof secrets;
const serverUrl = secrets[namespace]?.volunteer?.serverUrl + secrets[namespace]?.volunteer?.version;

export const calendarNewMutation = async ({
  containerId,
  title,
  description = '',
  color = colors.primary,
  location = '',
  allDay = 1,
  participationMode = 2,
  maxParticipants = '',
  allowDecline = 1,
  allowMaybe = 1,
  participantInfo = '',
  isPublic = 0,
  startDate = '2019-03-19',
  startTime,
  endDate = '2019-03-31',
  endTime,
  timeZone = 'Europe/Berlin',
  forceJoin = 1,
  topics
}: VolunteerCalendar) => {
  const authToken = await volunteerAuthToken();
  const formData = {
    CalendarEntry: {
      title,
      description,
      color,
      location,
      all_day: allDay ? 1 : 0,
      participation_mode: participationMode,
      max_participants: maxParticipants,
      allow_decline: allowDecline,
      allow_maybe: allowMaybe,
      participant_info: participantInfo
    },
    CalendarEntryForm: {
      is_public: isPublic ? 1 : 0,
      start_date: startDate,
      start_time: startTime && formatTime(startTime),
      end_date: endDate,
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

  return (await fetch(`${serverUrl}calendar/container/${containerId}`, fetchObj)).json();
};
