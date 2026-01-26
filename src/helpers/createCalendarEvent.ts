import {
  createEventInCalendarAsync,
  getDefaultCalendarAsync,
  requestCalendarPermissionsAsync
} from 'expo-calendar';
import moment from 'moment';
import { Alert, Linking, Platform } from 'react-native';

import appJson from '../../app.json';
import { texts } from '../config';

/**
 * Detects whether the current iOS runtime is older than the Calendar API change (iOS 17).
 */
const isOlderIOS = (): boolean => {
  if (Platform.OS !== 'ios') return false;

  const versionString = Platform.Version;
  const version = typeof versionString === 'string' ? parseFloat(versionString) : versionString;

  return version < 17;
};

/** Event payload used when exporting items into the OS calendar. */
type Event = {
  allDay: boolean;
  description?: string;
  endDatetime: string;
  location?: string;
  startDatetime: string;
  title: string;
};

/**
 * Creates a native calendar entry for the provided event, requesting permissions on old iOS versions.
 */
export const createCalendarEvent = async (eventDetails: Event) => {
  if (isOlderIOS()) {
    const { status } = await requestCalendarPermissionsAsync();

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
    ? await getDefaultCalendarAsync()
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
    await createEventInCalendarAsync({
      allDay,
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
