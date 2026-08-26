import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';

import {
  handleIncomingToken,
  PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT,
  PushNotificationStorageKeys
} from '../../src/pushNotifications/TokenHandling';

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn()
}));

jest.mock('../../src/config', () => ({
  device: { platform: 'ios' },
  secrets: {
    'smart-village-app': {
      rest: { pushDevicesDelete: '/delete', pushDevicesRegister: '/register' },
      serverUrl: 'https://example.invalid'
    }
  },
  texts: { errors: { errorTitle: 'Error' }, weather: { noData: 'No data' } }
}));

describe('handleIncomingToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 204 })
      .mockResolvedValueOnce({ status: 201 }) as jest.Mock;
    (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key) =>
      key === PushNotificationStorageKeys.PUSH_TOKEN ? 'token-a' : 'access-token'
    );
  });

  it('persists a rotated token before resolving or emitting', async () => {
    let resolveWrite: (() => void) | undefined;
    const write = new Promise<void>((resolve) => {
      resolveWrite = resolve;
    });
    (SecureStore.setItemAsync as jest.Mock).mockReturnValue(write);
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);
    let settled = false;

    const result = handleIncomingToken('token-b').then((value) => {
      settled = true;
      return value;
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(settled).toBe(false);
    expect(emit).not.toHaveBeenCalled();

    resolveWrite?.();
    await expect(result).resolves.toBe(true);
    expect(emit).toHaveBeenCalledWith(PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT, 'rotated');
  });

  it('does not emit or report success when persistence rejects', async () => {
    (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('storage failed'));
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);

    await expect(handleIncomingToken('token-b')).rejects.toThrow('storage failed');
    expect(emit).not.toHaveBeenCalled();
  });

  it('does not write or emit for an equal token', async () => {
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);

    await expect(handleIncomingToken('token-a')).resolves.toBe(true);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('does not persist or emit when removing token A fails before adding token B', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 500 })
      .mockResolvedValueOnce({ status: 201 }) as jest.Mock;
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);

    await expect(handleIncomingToken('token-b')).resolves.toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('does not persist or emit when adding token B fails after removing token A', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 204 })
      .mockResolvedValueOnce({ status: 500 }) as jest.Mock;
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);

    await expect(handleIncomingToken('token-b')).resolves.toBe(false);
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('awaits removal persistence before emitting', async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);

    await expect(handleIncomingToken()).resolves.toBe(true);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      PushNotificationStorageKeys.PUSH_TOKEN
    );
    expect(emit).toHaveBeenCalledWith(PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT, 'removed');
  });

  it('does not emit when delete persistence rejects', async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('storage failed'));
    const emit = jest.spyOn(DeviceEventEmitter, 'emit').mockImplementation(() => undefined);

    await expect(handleIncomingToken()).rejects.toThrow('storage failed');
    expect(emit).not.toHaveBeenCalled();
  });
});
