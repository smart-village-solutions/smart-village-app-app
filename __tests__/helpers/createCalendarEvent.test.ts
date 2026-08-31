import * as Calendar from 'expo-calendar/legacy';
import { Alert, Platform } from 'react-native';

import { createCalendarEvent } from '../../src/helpers/createCalendarEvent';

jest.mock('expo-calendar/legacy', () => ({
  createEventInCalendarAsync: jest.fn(),
  getDefaultCalendarAsync: jest.fn(),
  requestCalendarPermissionsAsync: jest.fn()
}));
jest.mock('../../src/config', () => ({
  texts: {
    calendarExport: {
      abort: 'Abbrechen',
      body: 'Kalenderzugriff erforderlich',
      errorBody: 'Kalendereintrag konnte nicht exportiert werden',
      errorTitle: 'Fehler',
      settings: 'Einstellungen',
      title: 'Kalenderzugriff'
    }
  }
}));

describe('createCalendarEvent', () => {
  const originalPlatformOS = Platform.OS;
  const originalPlatformVersion = Platform.Version;
  const event = {
    allDay: false,
    description: 'Beschreibung',
    endDatetime: '2026-08-14T11:00:00.000Z',
    location: 'Alter Markt 6, Magdeburg',
    startDatetime: '2026-08-14T10:00:00.000Z',
    title: 'Beteiligung'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    Object.defineProperty(Platform, 'Version', { configurable: true, value: '17.0' });
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    (Calendar.createEventInCalendarAsync as jest.Mock).mockResolvedValue({ action: 'saved' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalPlatformOS
    });
    Object.defineProperty(Platform, 'Version', {
      configurable: true,
      value: originalPlatformVersion
    });
  });

  it('opens the legacy system event form on iOS 17 and later', async () => {
    await createCalendarEvent(event);

    expect(Calendar.requestCalendarPermissionsAsync).not.toHaveBeenCalled();
    expect(Calendar.getDefaultCalendarAsync).not.toHaveBeenCalled();
    expect(Calendar.createEventInCalendarAsync).toHaveBeenCalledWith({
      allDay: false,
      calendarId: undefined,
      endDate: '2026-08-14T11:00:00.000Z',
      location: 'Alter Markt 6, Magdeburg',
      notes: 'Beschreibung',
      startDate: '2026-08-14T10:00:00.000Z',
      title: 'Beteiligung'
    });
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('uses the permitted default calendar on older iOS versions', async () => {
    Object.defineProperty(Platform, 'Version', { configurable: true, value: '16.4' });
    (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted'
    });
    (Calendar.getDefaultCalendarAsync as jest.Mock).mockResolvedValue({ id: 'default-calendar' });

    await createCalendarEvent(event);

    expect(Calendar.createEventInCalendarAsync).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: 'default-calendar' })
    );
  });

  it('shows the existing error alert when the system form cannot be opened', async () => {
    (Calendar.createEventInCalendarAsync as jest.Mock).mockRejectedValue(new Error('failed'));

    await createCalendarEvent(event);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Fehler',
      'Kalendereintrag konnte nicht exportiert werden'
    );
  });
});
