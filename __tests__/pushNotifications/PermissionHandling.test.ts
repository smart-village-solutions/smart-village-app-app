import { DeviceEventEmitter } from 'react-native';

import { addToStore, readFromStore } from '../../src/helpers/storageHelper';
import {
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
  setInAppPermission
} from '../../src/pushNotifications/PermissionHandling';
import { handleIncomingToken } from '../../src/pushNotifications/TokenHandling';
import { clearWasteReminderLocalNotifications } from '../../src/pushNotifications/WasteReminderLocalNotifications';

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'project-id'
      }
    }
  }
}));

jest.mock('expo-device', () => ({
  isDevice: true
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 'default', HIGH: 'high' },
  IosAuthorizationStatus: { PROVISIONAL: 'provisional' },
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'push-token' })),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  setNotificationChannelAsync: jest.fn(async () => undefined)
}));

jest.mock('../../src/config', () => ({
  colors: {
    primary: '#107821'
  },
  device: {
    platform: 'ios'
  },
  texts: {
    pushNotifications: {
      abort: 'Abbrechen',
      approve: 'Erlauben',
      permissionMissingBody: 'Fehlende Berechtigung',
      permissionMissingTitle: 'Push-Benachrichtigungen',
      permissionRequiredBody: 'Berechtigung erforderlich',
      settings: 'Einstellungen'
    }
  }
}));

jest.mock('../../src/helpers/colorHelper', () => ({
  parseColorToHex: jest.fn(() => '#107821')
}));

jest.mock('../../src/helpers/storageHelper', () => ({
  addToStore: jest.fn(),
  readFromStore: jest.fn()
}));

jest.mock('../../src/pushNotifications/TokenHandling', () => ({
  PushNotificationStorageKeys: {
    IN_APP_PERMISSION: 'IN_APP_PERMISSION',
    PUSH_TOKEN: 'PUSH_TOKEN'
  },
  getPushTokenFromStorage: jest.fn(async () => 'stored-token'),
  handleIncomingToken: jest.fn()
}));

jest.mock('../../src/pushNotifications/WasteReminderLocalNotifications', () => ({
  clearWasteReminderLocalNotifications: jest.fn(async () => undefined)
}));

describe('setInAppPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('clears local waste reminder notifications before storing a successful push opt-out', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(true);
    (handleIncomingToken as jest.Mock).mockResolvedValue(true);

    await expect(setInAppPermission(false)).resolves.toBe(true);

    expect(handleIncomingToken).toHaveBeenCalledWith(undefined);
    expect(clearWasteReminderLocalNotifications).toHaveBeenCalledTimes(1);
    expect(addToStore).toHaveBeenCalledWith('IN_APP_PERMISSION', false);
  });

  it('keeps local waste reminders when server token removal fails and opt-out is reverted', async () => {
    (readFromStore as jest.Mock).mockResolvedValue(true);
    (handleIncomingToken as jest.Mock).mockResolvedValue(false);

    await expect(setInAppPermission(false)).resolves.toBe(false);

    expect(clearWasteReminderLocalNotifications).not.toHaveBeenCalled();
    expect(addToStore).not.toHaveBeenCalled();
  });

  it('persists push opt-out even if clearing local waste reminders fails', async () => {
    const error = new Error('cleanup failed');
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (readFromStore as jest.Mock).mockResolvedValue(true);
    (handleIncomingToken as jest.Mock).mockResolvedValue(true);
    (clearWasteReminderLocalNotifications as jest.Mock).mockRejectedValue(error);

    await expect(setInAppPermission(false)).resolves.toBe(true);

    expect(clearWasteReminderLocalNotifications).toHaveBeenCalledTimes(1);
    expect(addToStore).toHaveBeenCalledWith('IN_APP_PERMISSION', false);
    expect(warnSpy).toHaveBeenCalledWith(
      'An error occurred while clearing local waste reminder notifications:',
      error
    );
    warnSpy.mockRestore();
  });

  it.each([
    { newValue: true, oldValue: false },
    { newValue: false, oldValue: true }
  ])(
    'persists permission $newValue before emitting its change event',
    async ({ newValue, oldValue }) => {
      let resolveStorageWrite: (() => void) | undefined;
      const storageWrite = new Promise<void>((resolve) => {
        resolveStorageWrite = resolve;
      });
      const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);
      (readFromStore as jest.Mock).mockResolvedValue(oldValue);
      (handleIncomingToken as jest.Mock).mockResolvedValue(true);
      (addToStore as jest.Mock).mockReturnValue(storageWrite);

      const result = setInAppPermission(newValue);

      await new Promise((resolve) => setImmediate(resolve));
      expect(addToStore).toHaveBeenCalledWith('IN_APP_PERMISSION', newValue);
      expect(emitSpy).not.toHaveBeenCalled();

      resolveStorageWrite?.();
      await expect(result).resolves.toBe(true);

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT, newValue);
      emitSpy.mockRestore();
    }
  );

  it('does not persist or emit when token handling fails', async () => {
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);
    (readFromStore as jest.Mock).mockResolvedValue(false);
    (handleIncomingToken as jest.Mock).mockResolvedValue(false);

    await expect(setInAppPermission(true)).resolves.toBe(false);

    expect(addToStore).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
    emitSpy.mockRestore();
  });

  it('does not persist or emit when permission is unchanged', async () => {
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);
    (readFromStore as jest.Mock).mockResolvedValue(true);

    await expect(setInAppPermission(true)).resolves.toBe(true);

    expect(handleIncomingToken).not.toHaveBeenCalled();
    expect(addToStore).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
    emitSpy.mockRestore();
  });
});
