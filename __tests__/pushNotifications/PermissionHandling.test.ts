import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter } from 'react-native';

import { addToStore, readFromStore } from '../../src/helpers/storageHelper';
import {
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
  handleSystemPermissions,
  setInAppPermission,
  setInAppPermissionForEventReminders,
  syncInAppPushRegistration,
  updatePushToken
} from '../../src/pushNotifications/PermissionHandling';
import {
  getPushTokenFromStorage,
  handleIncomingToken
} from '../../src/pushNotifications/TokenHandling';
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

describe('system notification permission', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads the current iOS permission after returning to a simulator with an existing opt-out', async () => {
    jest.replaceProperty(Device, 'isDevice', false);
    jest.mocked(readFromStore).mockResolvedValue(false);
    (Notifications.getPermissionsAsync as jest.Mock)
      .mockResolvedValueOnce({ granted: false, status: 'denied', canAskAgain: false })
      .mockResolvedValueOnce({ granted: true, status: 'granted' });

    await expect(handleSystemPermissions(false, true)).resolves.toBe(false);
    await expect(handleSystemPermissions(false, true)).resolves.toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('lets an explicit activation request permission even after recording an app opt-out', async () => {
    jest.mocked(readFromStore).mockResolvedValue(false);
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
      status: 'undetermined',
      canAskAgain: true
    });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: true,
      status: 'granted'
    });
    await expect(handleSystemPermissions(false, true)).resolves.toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});

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

  it('waits for permission persistence before emitting', async () => {
    let resolveWrite: (() => void) | undefined;
    (addToStore as jest.Mock).mockReturnValue(
      new Promise<void>((resolve) => {
        resolveWrite = resolve;
      })
    );
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);
    (readFromStore as jest.Mock).mockResolvedValue(false);
    (handleIncomingToken as jest.Mock).mockResolvedValue(true);

    const result = setInAppPermission(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(emitSpy).not.toHaveBeenCalled();

    resolveWrite?.();
    await expect(result).resolves.toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT, true);
    emitSpy.mockRestore();
  });

  it('does not emit when permission persistence fails', async () => {
    const emitSpy = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);
    (readFromStore as jest.Mock).mockResolvedValue(false);
    (handleIncomingToken as jest.Mock).mockResolvedValue(true);
    (addToStore as jest.Mock).mockRejectedValue(new Error('storage failed'));

    await expect(setInAppPermission(true)).rejects.toThrow('storage failed');
    expect(emitSpy).not.toHaveBeenCalled();
    emitSpy.mockRestore();
  });
});

describe('push token refresh and opt-out ordering', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
      status: 'granted'
    });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'push-token' });
    (readFromStore as jest.Mock).mockResolvedValue(true);
    (handleIncomingToken as jest.Mock).mockResolvedValue(true);
  });

  it('uses the native token delivered by the listener without asking for it again', async () => {
    const nativeToken = { data: 'native-secret', type: 'ios' } as Notifications.DevicePushToken;
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockImplementation(async (options) => {
      if (!options.devicePushToken)
        throw new Error('Requesting a native token would re-trigger the listener');
      return { data: 'push-token' };
    });
    await expect(updatePushToken(nativeToken)).resolves.toBe(true);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'project-id',
      devicePushToken: nativeToken
    });
  });

  it('does not turn native registration events into a token refresh loop', async () => {
    const nativeToken = { data: 'native-secret', type: 'ios' } as Notifications.DevicePushToken;
    let permission = false;
    let rotation: Promise<boolean> | undefined;
    (readFromStore as jest.Mock).mockImplementation(async () => permission);
    (addToStore as jest.Mock).mockImplementation(async (_key, value) => {
      permission = value;
    });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockImplementation(async (options) => {
      // Match Expo: requesting a native token emits the native token listener again.
      if (!options.devicePushToken) {
        rotation = updatePushToken(nativeToken);
      }
      return { data: 'push-token' };
    });

    await expect(setInAppPermission(true)).resolves.toBe(true);
    await rotation;
    await new Promise((resolve) => setImmediate(resolve));
    // One explicit registration, followed by one event that reuses its native token.
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenLastCalledWith({
      projectId: 'project-id',
      devicePushToken: nativeToken
    });

    await expect(setInAppPermission(false)).resolves.toBe(true);
    await expect(updatePushToken(nativeToken)).resolves.toBe(false);
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(2);
  });

  it.each([false, null])(
    'skips refresh when stored in-app permission is %p',
    async (permission) => {
      (readFromStore as jest.Mock).mockResolvedValue(permission);
      await expect(updatePushToken({ data: 'native', type: 'ios' })).resolves.toBe(false);
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(handleIncomingToken).not.toHaveBeenCalled();
    }
  );

  it('does not let a native token event overtake a pending opt-out', async () => {
    let permission = true;
    (readFromStore as jest.Mock).mockImplementation(async () => permission);
    (addToStore as jest.Mock).mockImplementation(async (_key, value) => {
      permission = value;
    });
    let finishRemoval: (value: boolean) => void = () => undefined;
    (handleIncomingToken as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        finishRemoval = resolve;
      })
    );
    const optOut = setInAppPermission(false);
    const refresh = updatePushToken({ data: 'native', type: 'ios' });
    await new Promise((resolve) => setImmediate(resolve));
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    finishRemoval(true);
    await expect(optOut).resolves.toBe(true);
    await expect(refresh).resolves.toBe(false);
    expect(handleIncomingToken).toHaveBeenCalledTimes(1);
    expect(permission).toBe(false);
  });

  it('finishes an in-flight refresh before removing the device', async () => {
    let finishRefresh: (value: { data: string }) => void = () => undefined;
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => {
        finishRefresh = resolve;
      })
    );
    const refresh = updatePushToken({ data: 'native', type: 'ios' });
    await new Promise((resolve) => setImmediate(resolve));
    const optOut = setInAppPermission(false);
    expect(handleIncomingToken).not.toHaveBeenCalled();
    finishRefresh({ data: 'new-token' });
    await expect(refresh).resolves.toBe(true);
    await expect(optOut).resolves.toBe(true);
    expect(handleIncomingToken).toHaveBeenNthCalledWith(1, 'new-token');
    expect(handleIncomingToken).toHaveBeenNthCalledWith(2, undefined);
    expect(addToStore).toHaveBeenCalledWith('IN_APP_PERMISSION', false);
  });

  it('continues processing an opt-out after a token refresh rejects', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    await expect(updatePushToken({ data: 'native', type: 'ios' })).rejects.toThrow('offline');
    await expect(setInAppPermission(false)).resolves.toBe(true);
    expect(handleIncomingToken).toHaveBeenCalledWith(undefined);
  });
});

describe('push preferences with local event reminders', () => {
  let permission: boolean;

  beforeEach(() => {
    jest.resetAllMocks();
    permission = false;
    jest.mocked(readFromStore).mockImplementation(async () => permission);
    jest.mocked(addToStore).mockImplementation(async (_key, value) => {
      permission = value;
    });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
      status: 'granted'
    });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'push-token' });
    jest.mocked(getPushTokenFromStorage).mockResolvedValue(null);
    jest.mocked(handleIncomingToken).mockResolvedValue(true);
  });

  it('persists and emits consent before a remote failure and retries registration', async () => {
    let finishRegistration: ((success: boolean) => void) | undefined;
    jest.mocked(handleIncomingToken).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishRegistration = resolve;
        })
    );
    const emit = jest.spyOn(DeviceEventEmitter, 'emit');

    await expect(setInAppPermissionForEventReminders(true, true)).resolves.toBe(true);
    expect(permission).toBe(true);
    expect(emit).toHaveBeenCalledWith(PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT, true);
    await new Promise((resolve) => setImmediate(resolve));
    expect(finishRegistration).toBeDefined();
    finishRegistration?.(false);
    await expect(syncInAppPushRegistration()).resolves.toBe(true);
    expect(handleIncomingToken).toHaveBeenCalledTimes(2);
    expect(handleIncomingToken).toHaveBeenLastCalledWith('push-token', false);
    expect(permission).toBe(true);
    emit.mockRestore();
  });

  it('keeps opt-out in effect while remote unregistration is retried', async () => {
    permission = true;
    jest.mocked(getPushTokenFromStorage).mockResolvedValue('stored-token');
    jest.mocked(handleIncomingToken).mockResolvedValueOnce(false);

    await expect(setInAppPermissionForEventReminders(false, true)).resolves.toBe(true);
    expect(permission).toBe(false);
    await expect(syncInAppPushRegistration()).resolves.toBe(true);
    expect(handleIncomingToken).toHaveBeenCalledTimes(2);
    expect(handleIncomingToken).toHaveBeenLastCalledWith(undefined, false);
    expect(await updatePushToken()).toBe(false);
    expect(permission).toBe(false);
  });

  it('does not register a token received after local consent was revoked', async () => {
    let finishToken: ((value: { data: string }) => void) | undefined;
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishToken = resolve;
        })
    );

    await expect(setInAppPermissionForEventReminders(true, true)).resolves.toBe(true);
    await new Promise((resolve) => setImmediate(resolve));
    expect(finishToken).toBeDefined();
    await expect(setInAppPermissionForEventReminders(false, true)).resolves.toBe(true);
    finishToken?.({ data: 'push-token' });
    await expect(syncInAppPushRegistration()).resolves.toBe(true);
    expect(handleIncomingToken).not.toHaveBeenCalled();
    expect(permission).toBe(false);
  });
});
