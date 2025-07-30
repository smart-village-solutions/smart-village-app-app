import * as Calendar from 'expo-calendar';
import moment from 'moment';
import { Alert, Linking, Platform } from 'react-native';

import appJson from '../../app.json';
import { texts } from '../config';

const isOlderIOS = (): boolean => {
  if (Platform.OS !== 'ios') return false;

  const versionString = Platform.Version;
  const version = typeof versionString === 'string' ? parseFloat(versionString) : versionString;

  return version < 17;
};

type Event = {
  allDay?: number;
  description?: string;
  endDatetime: string;
  location?: string;
  startDatetime: string;
  title: string;
};

export const createCalendarEvent = async (eventDetails: Event) => {
  if (isOlderIOS()) {
    const { status } = await Calendar.requestCalendarPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(texts.calendarExport.title, texts.calendarExport.body, [
        {
          text: texts.calendarExport.abort,
          style: 'cancel'
        },
        {
          text: texts.calendarExport.settings,
          onPress: () => Linking.openSettings()
        }
      ]);

      return;
    }
  }

  const defaultCalendarSource = isOlderIOS()
    ? await Calendar.getDefaultCalendarAsync()
    : {
        id: undefined,
        isLocalAccount: true,
        name: appJson.expo.name
      };

  const {
    allDay,
    description = '',
    endDatetime,
    location = '',
    startDatetime,
    title
  } = eventDetails;

  try {
    await Calendar.createEventInCalendarAsync({
      allDay: !!allDay,
      calendarId: defaultCalendarSource.id,
      endDate: moment(endDatetime).toISOString(),
      location,
      notes: description,
      startDate: moment(startDatetime).toISOString(),
      title
    });
  } catch (error) {
    Alert.alert(texts.calendarExport.errorTitle, texts.calendarExport.errorBody);
    return;
  }
};
