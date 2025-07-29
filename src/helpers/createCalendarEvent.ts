import * as Calendar from 'expo-calendar';
import { Platform, Alert, Linking } from 'react-native';

import appJson from '../../app.json';
import { texts } from '../config';

const isOlderIOS = (): boolean => {
  if (Platform.OS !== 'ios') return false;

  const versionString = Platform.Version;
  const version = typeof versionString === 'string' ? parseFloat(versionString) : versionString;

  return version < 17;
};

type Event = {
  description?: string;
  endDatetime: string;
  location?: string;
  startDatetime: string;
  title: string;
};

export const createCalendarEvent = async (eventDetails: Event) => {
  if (Platform.OS === 'ios' && isOlderIOS()) {
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

  const defaultCalendarSource =
    Platform.OS === 'ios' && isOlderIOS()
      ? await Calendar.getDefaultCalendarAsync()
      : {
          isLocalAccount: true,
          name: appJson.expo.name
        };

  const { description = '', endDatetime, location = '', startDatetime, title } = eventDetails;

  await Calendar.createEventInCalendarAsync({
    calendarId: defaultCalendarSource.id,
    endDate: new Date(endDatetime).toISOString(),
    location,
    notes: description,
    startDate: new Date(startDatetime).toISOString(),
    title
  });
};
