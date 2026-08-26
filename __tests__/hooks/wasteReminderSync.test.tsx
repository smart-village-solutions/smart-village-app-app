import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { AppState, DeviceEventEmitter } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import {
  migrateWasteReminderLocalStateToCurrentOwner,
  getInAppPermission,
  getReminderSettings,
  markWasteReminderServerSyncSynced,
  readWasteReminderLocalState,
  rescheduleWasteReminderNotificationsFromLocalState,
  retryPendingWasteReminderNotificationCancellations,
  syncWasteReminderSettingsWithServer,
  verifyWasteReminderNotificationsFromLocalState,
  writeWasteReminderLocalState
} from '../../src/pushNotifications';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { useWasteReminderSync } from '../../src/hooks/wasteReminderSync';
import { migrateWasteReminderLocalStateToCurrentOwner as migrateWasteReminderLocalStateToCurrentOwnerActual } from '../../src/pushNotifications/WasteReminderLocalNotifications';
import {
  getWasteReminderOwnerKey,
  markWasteReminderServerSyncSynced as markWasteReminderServerSyncSyncedActual,
  readWasteReminderLocalState as readWasteReminderLocalStateActual,
  writeWasteReminderLocalState as writeWasteReminderLocalStateActual
} from '../../src/pushNotifications/WasteReminderLocalStorage';
import {
  handleIncomingToken,
  PushNotificationStorageKeys
} from '../../src/pushNotifications/TokenHandling';

const mockStreetData = {
  wasteAddresses: [
    {
      city: 'Berlin',
      street: 'Test Street',
      wasteLocationTypes: [{ pickUpTimes: [{ pickupDate: '2026-06-10' }], wasteType: 'paper' }],
      zip: '12345'
    }
  ]
};
const mockUsedTypes = {
  paper: { color: '#000', icon: 'paper', label: 'Papier', selected_color: '#111' }
};
let appStateListener: ((state: string) => void) | undefined;
let permissionChangeListener: ((isEnabled: boolean) => void) | undefined;
let manualRetryListener: (() => void) | undefined;
let tokenChangeListener: (() => void) | undefined;
const listenerRemovers = new Map<string, jest.Mock>();

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-secure-store', () => ({
  deleteItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn()
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 'default' },
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' }
}));

jest.mock('../../src/pushNotifications', () => ({
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT: 'pushNotificationPermissionChanged',
  PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT: 'pushNotificationTokenChanged',
  migrateWasteReminderLocalStateToCurrentOwner: jest.fn(async () => 'unchanged'),
  getInAppPermission: jest.fn(async () => true),
  getReminderSettings: jest.fn(async () => ({ settings: [], status: 'ok' })),
  getWasteReminderOwnerKey: jest.fn(async () => 'push:current'),
  markWasteReminderServerSyncSynced: jest.fn(async () => undefined),
  readWasteReminderLocalState: jest.fn(async () => ({
    localCoverageUntil: '2026-06-09T07:00:00.000Z',
    serverSyncPayload: {
      activeTypes: { paper: { active: true } },
      notificationSettings: { paper: true },
      reminderTime: '2000-01-01T08:00:00.000Z',
      usedTypeKeys: ['paper']
    },
    serverSyncStatus: 'pending'
  })),
  reportWasteReminderMaintenanceSync: jest.fn(),
  rescheduleWasteReminderNotificationsFromLocalState: jest.fn(async () => undefined),
  retryPendingWasteReminderNotificationCancellations: jest.fn(async () => undefined),
  syncWasteReminderSettingsWithServer: jest.fn(async () => ({
    serverSyncPayload: {
      activeTypes: { paper: { active: true, storeId: 123 } },
      notificationSettings: { paper: true },
      reminderTime: '2000-01-01T08:00:00.000Z',
      usedTypeKeys: ['paper']
    },
    success: true
  })),
  updateWasteReminderSchedulingState: jest.fn(async () => undefined),
  verifyWasteReminderNotificationsFromLocalState: jest.fn(async () => ({
    checked: false,
    status: 'scheduled'
  })),
  writeWasteReminderLocalState: jest.fn(async () => undefined)
}));

jest.mock('../../src/screens', () => ({
  getLocationData: (streetData: typeof mockStreetData) => ({
    city: streetData.wasteAddresses[0].city,
    street: streetData.wasteAddresses[0].street,
    zip: streetData.wasteAddresses[0].zip
  })
}));

jest.mock('../../src/hooks/waste', () => ({
  useStreetString: () => ({
    getStreetString: ({ street }: { street?: string }) => street || ''
  }),
  useWasteStreet: () => ({ data: mockStreetData, loading: false }),
  useWasteTypes: () => ({ data: mockUsedTypes, loading: false }),
  useWasteUsedTypes: () => mockUsedTypes
}));

const TestWasteReminderSync = () => {
  useWasteReminderSync();

  return null;
};

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const renderHook = async () => {
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(
      <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
        <SettingsContext.Provider
          value={{
            ...initialContext,
            globalSettings: {
              ...initialContext.globalSettings,
              waste: { streetId: 12 }
            }
          }}
        >
          <TestWasteReminderSync />
        </SettingsContext.Provider>
      </NetworkContext.Provider>
    );
  });

  return tree;
};

describe('useWasteReminderSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mockResolvedValue('unchanged');
    (readWasteReminderLocalState as jest.Mock).mockResolvedValue({
      localCoverageUntil: '2026-06-09T07:00:00.000Z',
      serverSyncPayload: {
        activeTypes: { paper: { active: true } },
        notificationSettings: { paper: true },
        reminderTime: '2000-01-01T08:00:00.000Z',
        usedTypeKeys: ['paper']
      },
      serverSyncStatus: 'pending'
    });
    appStateListener = undefined;
    permissionChangeListener = undefined;
    manualRetryListener = undefined;
    tokenChangeListener = undefined;
    listenerRemovers.clear();
    (getInAppPermission as jest.Mock).mockResolvedValue(true);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      appStateListener = listener as (state: string) => void;

      return { remove: jest.fn() };
    });
    jest.spyOn(DeviceEventEmitter, 'addListener').mockImplementation((event, listener) => {
      if (event === 'wasteReminderManualRetry') {
        manualRetryListener = listener as () => void;
      } else if (event === 'pushNotificationTokenChanged') {
        tokenChangeListener = listener as () => void;
      } else {
        permissionChangeListener = listener as (isEnabled: boolean) => void;
      }

      const remove = jest.fn();
      listenerRemovers.set(event, remove);
      return { remove };
    });
  });

  it('serializes owner cleanup, pending server sync, and local replan when app becomes active', async () => {
    const callOrder: string[] = [];

    (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mockImplementation(async () => {
      callOrder.push('cleanup');
      return 'unchanged';
    });
    (syncWasteReminderSettingsWithServer as jest.Mock).mockImplementation(async () => {
      callOrder.push('sync');
      return { serverSyncPayload: {}, success: true };
    });
    (markWasteReminderServerSyncSynced as jest.Mock).mockImplementation(async () => {
      callOrder.push('mark-synced');
    });
    (rescheduleWasteReminderNotificationsFromLocalState as jest.Mock).mockImplementation(
      async () => {
        callOrder.push('replan');
      }
    );

    await renderHook();
    callOrder.length = 0;

    await act(async () => {
      appStateListener?.('active');
    });

    expect(callOrder).toEqual(['cleanup', 'sync', 'mark-synced', 'replan']);
  });

  it('continues maintenance after owner migration without reconstructing from the server', async () => {
    (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mockResolvedValue('migrated');

    await renderHook();
    jest.clearAllMocks();
    (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mockResolvedValue('migrated');

    await act(async () => {
      appStateListener?.('active');
    });

    expect(rescheduleWasteReminderNotificationsFromLocalState).toHaveBeenCalled();
    expect(getReminderSettings).not.toHaveBeenCalled();
  });

  it('reconstructs only current-street records from a mixed owner response', async () => {
    (readWasteReminderLocalState as jest.Mock).mockResolvedValue({
      scheduledNotificationIds: [],
      scheduledReminderKeys: [],
      scheduling: {
        attemptCount: 0,
        expectedCount: 0,
        lastAttemptAt: '2026-07-23T10:00:00.000Z',
        status: 'waiting-for-data'
      }
    });
    (getReminderSettings as jest.Mock).mockResolvedValue({
      settings: [
        {
          city: 'Berlin',
          id: 1,
          notify_at: '2026-07-23T09:00:00.000Z',
          notify_days_before: 1,
          notify_for_waste_type: 'paper',
          street: 'Test Street',
          zip: '12345'
        },
        {
          city: 'Berlin',
          id: 2,
          notify_at: '2026-07-23T18:00:00.000Z',
          notify_days_before: 2,
          notify_for_waste_type: 'paper',
          street: 'Other Street',
          zip: '12345'
        }
      ],
      status: 'ok'
    });

    await renderHook();
    await flushPromises();

    expect(writeWasteReminderLocalState).toHaveBeenCalledWith(
      expect.objectContaining({
        serverSyncPayload: expect.objectContaining({
          activeReminderRegistrations: [
            expect.objectContaining({
              storeId: 1,
              typeKey: 'paper'
            })
          ],
          locationData: {
            city: 'Berlin',
            street: 'Test Street',
            zip: '12345'
          }
        })
      })
    );
    expect(writeWasteReminderLocalState).not.toHaveBeenCalledWith(
      expect.objectContaining({
        serverSyncPayload: expect.objectContaining({
          activeReminderRegistrations: expect.arrayContaining([
            expect.objectContaining({ storeId: 2 })
          ])
        })
      })
    );
  });

  it('skips pending sync and local replan while in-app push notifications are disabled', async () => {
    (getInAppPermission as jest.Mock).mockResolvedValue(false);

    await renderHook();
    await flushPromises();

    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();
    expect(migrateWasteReminderLocalStateToCurrentOwner).not.toHaveBeenCalled();

    jest.clearAllMocks();
    (getInAppPermission as jest.Mock).mockResolvedValue(false);

    await act(async () => {
      appStateListener?.('active');
    });
    await flushPromises();

    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();
    expect(migrateWasteReminderLocalStateToCurrentOwner).not.toHaveBeenCalled();
  });

  it('stops maintenance when owner migration is deferred without a token', async () => {
    (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mockResolvedValue(
      'deferred-no-token'
    );

    await renderHook();
    await flushPromises();

    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();
  });

  it('keeps failed server sync pending and does not mark it synced', async () => {
    (syncWasteReminderSettingsWithServer as jest.Mock).mockResolvedValue({
      serverSyncPayload: {},
      success: false
    });

    await renderHook();
    await flushPromises();

    expect(markWasteReminderServerSyncSynced).not.toHaveBeenCalled();
    expect(rescheduleWasteReminderNotificationsFromLocalState).toHaveBeenCalled();
  });

  it('syncs and replans stored waste reminders when in-app push notifications are enabled', async () => {
    const callOrder: string[] = [];

    (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mockImplementation(async () => {
      callOrder.push('cleanup');
      return 'unchanged';
    });
    (syncWasteReminderSettingsWithServer as jest.Mock).mockImplementation(async () => {
      callOrder.push('sync');
      return { serverSyncPayload: {}, success: true };
    });
    (markWasteReminderServerSyncSynced as jest.Mock).mockImplementation(async () => {
      callOrder.push('mark-synced');
    });
    (rescheduleWasteReminderNotificationsFromLocalState as jest.Mock).mockImplementation(
      async () => {
        callOrder.push('replan');
      }
    );

    await renderHook();
    callOrder.length = 0;

    await act(async () => {
      permissionChangeListener?.(true);
    });
    await flushPromises();

    expect(callOrder).toEqual(['cleanup', 'sync', 'mark-synced', 'replan']);
  });

  it('honors failed-state backoff on foreground but manual retry bypasses it', async () => {
    (readWasteReminderLocalState as jest.Mock).mockResolvedValue({
      nextRetryAt: undefined,
      scheduling: {
        attemptCount: 1,
        expectedCount: 1,
        lastAttemptAt: '2026-07-23T10:00:00.000Z',
        nextRetryAt: '2999-07-23T10:01:00.000Z',
        status: 'failed'
      },
      serverSyncPayload: {},
      serverSyncStatus: 'synced'
    });

    await renderHook();
    jest.clearAllMocks();

    await act(async () => appStateListener?.('active'));
    expect(retryPendingWasteReminderNotificationCancellations).toHaveBeenCalledTimes(1);
    expect(migrateWasteReminderLocalStateToCurrentOwner).toHaveBeenCalledTimes(1);
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();

    await act(async () => {
      manualRetryListener?.();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(rescheduleWasteReminderNotificationsFromLocalState).toHaveBeenCalledTimes(1);
  });

  it('runs token-change maintenance once and bypasses failed-state backoff', async () => {
    (readWasteReminderLocalState as jest.Mock).mockResolvedValue({
      scheduling: {
        attemptCount: 1,
        expectedCount: 1,
        lastAttemptAt: '2026-07-23T10:00:00.000Z',
        nextRetryAt: '2999-07-23T10:01:00.000Z',
        status: 'failed'
      },
      serverSyncPayload: {},
      serverSyncStatus: 'synced'
    });

    await renderHook();
    jest.clearAllMocks();

    await act(async () => {
      tokenChangeListener?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(migrateWasteReminderLocalStateToCurrentOwner).toHaveBeenCalledTimes(1);
    expect(rescheduleWasteReminderNotificationsFromLocalState).toHaveBeenCalledTimes(1);
  });

  it('self-heals one token rotation from opt-out through failed and successful sync', async () => {
    let inAppPermission = false;
    let syncAttempt = 0;
    const secureValues = new Map<string, string>([
      [PushNotificationStorageKeys.ACCESS_TOKEN, 'access-token'],
      [PushNotificationStorageKeys.PUSH_TOKEN, 'token-a']
    ]);
    (SecureStore.getItemAsync as jest.Mock).mockImplementation(async (key: string) =>
      secureValues.get(key)
    );
    (SecureStore.setItemAsync as jest.Mock).mockImplementation(
      async (key: string, value: string) => {
        secureValues.set(key, value);
      }
    );
    (SecureStore.deleteItemAsync as jest.Mock).mockImplementation(async (key: string) => {
      secureValues.delete(key);
    });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ status: 204 })
      .mockResolvedValueOnce({ status: 201 }) as jest.Mock;
    await AsyncStorage.clear();
    await writeWasteReminderLocalStateActual({
      ownerKey: await getWasteReminderOwnerKey(),
      scheduledNotificationIds: [],
      scheduledReminderKeys: [],
      serverSyncPayload: {
        activeReminderRegistrations: [{ active: true, storeId: 31, typeKey: 'paper' }],
        activeTypes: { paper: { active: true, storeId: 21 } },
        notificationSettings: { paper: true },
        reminderTime: '2000-01-01T08:00:00.000Z',
        usedTypeKeys: ['paper']
      },
      serverSyncStatus: 'pending'
    });

    (getInAppPermission as jest.Mock).mockImplementation(async () => inAppPermission);
    (readWasteReminderLocalState as jest.Mock).mockImplementation(
      readWasteReminderLocalStateActual
    );
    (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mockImplementation(
      migrateWasteReminderLocalStateToCurrentOwnerActual
    );
    (syncWasteReminderSettingsWithServer as jest.Mock).mockImplementation(async () => {
      syncAttempt += 1;
      const state = await readWasteReminderLocalStateActual();
      return {
        serverSyncPayload: {
          ...state?.serverSyncPayload,
          activeTypes: { paper: { active: true, storeId: 41 } },
          activeReminderRegistrations: [{ active: true, storeId: 51, typeKey: 'paper' }]
        },
        success: syncAttempt > 1
      };
    });
    (markWasteReminderServerSyncSynced as jest.Mock).mockImplementation(
      markWasteReminderServerSyncSyncedActual
    );
    (rescheduleWasteReminderNotificationsFromLocalState as jest.Mock).mockImplementation(
      async () => {
        const state = await readWasteReminderLocalStateActual();
        if (state) {
          await writeWasteReminderLocalStateActual({
            ...state,
            scheduledNotificationIds: ['local-reminder'],
            scheduledReminderKeys: ['waste:paper']
          });
        }
      }
    );

    const tree = await renderHook();
    await flushPromises();
    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();

    await act(async () => {
      await handleIncomingToken();
      await handleIncomingToken('token-b');
    });
    expect(secureValues.get(PushNotificationStorageKeys.PUSH_TOKEN)).toBe('token-b');

    inAppPermission = true;
    await act(async () => {
      permissionChangeListener?.(true);
      await Promise.resolve();
      await Promise.resolve();
    });

    let rotationState = await readWasteReminderLocalStateActual();
    expect(rotationState?.ownerKey).toBe(await getWasteReminderOwnerKey());
    expect(rotationState?.serverSyncPayload?.activeTypes.paper).toEqual({ active: true });
    expect(rotationState?.serverSyncPayload?.activeReminderRegistrations?.[0]).not.toHaveProperty(
      'storeId'
    );
    expect(rotationState?.serverSyncStatus).toBe('pending');
    expect(rotationState?.scheduledNotificationIds).toEqual(['local-reminder']);

    await act(async () => {
      tokenChangeListener?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    rotationState = await readWasteReminderLocalStateActual();
    expect(rotationState?.serverSyncStatus).toBe('synced');
    expect(rotationState?.serverSyncPayload?.activeTypes.paper.storeId).toBe(41);
    expect(rotationState?.scheduledNotificationIds).toEqual(['local-reminder']);

    jest.clearAllMocks();
    await act(async () => {
      tokenChangeListener?.();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(migrateWasteReminderLocalStateToCurrentOwner).toHaveBeenCalledTimes(1);
    await expect(
      (migrateWasteReminderLocalStateToCurrentOwner as jest.Mock).mock.results[0].value
    ).resolves.toBe('unchanged');

    jest.clearAllMocks();
    secureValues.delete(PushNotificationStorageKeys.PUSH_TOKEN);
    await act(async () => {
      tokenChangeListener?.();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();

    act(() => tree?.unmount());
    expect(listenerRemovers.get('pushNotificationTokenChanged')).toHaveBeenCalledTimes(1);
  });

  it('removes permission, token-change, and manual retry subscriptions on unmount', async () => {
    const tree = await renderHook();

    act(() => tree?.unmount());

    expect(listenerRemovers.get('pushNotificationPermissionChanged')).toHaveBeenCalledTimes(1);
    expect(listenerRemovers.get('pushNotificationTokenChanged')).toHaveBeenCalledTimes(1);
    expect(listenerRemovers.get('wasteReminderManualRetry')).toHaveBeenCalledTimes(1);
  });

  it('does not replan a scheduled state when foreground verification succeeds', async () => {
    (readWasteReminderLocalState as jest.Mock).mockResolvedValue({
      scheduledNotificationIds: ['stored-1'],
      scheduling: {
        attemptCount: 0,
        expectedCount: 1,
        lastAttemptAt: '2026-07-23T10:00:00.000Z',
        status: 'scheduled'
      },
      serverSyncPayload: {},
      serverSyncStatus: 'synced'
    });

    await renderHook();
    jest.clearAllMocks();
    await act(async () => appStateListener?.('active'));

    expect(verifyWasteReminderNotificationsFromLocalState).toHaveBeenCalledTimes(1);
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();
  });

  it('forces native inventory verification for a scheduled state on startup', async () => {
    (readWasteReminderLocalState as jest.Mock).mockResolvedValue({
      scheduledNotificationIds: ['stored-1'],
      scheduling: {
        attemptCount: 0,
        expectedCount: 1,
        lastAttemptAt: '2026-07-23T10:00:00.000Z',
        status: 'scheduled'
      },
      serverSyncPayload: {},
      serverSyncStatus: 'synced'
    });

    await renderHook();

    expect(verifyWasteReminderNotificationsFromLocalState).toHaveBeenCalledWith({ force: true });
  });

  it('replans exactly once after a foreground verification mismatch', async () => {
    (readWasteReminderLocalState as jest.Mock).mockResolvedValue({
      scheduledNotificationIds: ['stored-1'],
      scheduling: {
        attemptCount: 0,
        expectedCount: 1,
        lastAttemptAt: '2026-07-23T01:00:00.000Z',
        status: 'scheduled'
      },
      serverSyncPayload: {},
      serverSyncStatus: 'synced'
    });
    (verifyWasteReminderNotificationsFromLocalState as jest.Mock).mockResolvedValue({
      checked: true,
      errorClass: 'native-verification-mismatch',
      status: 'failed'
    });

    await renderHook();
    jest.clearAllMocks();
    (verifyWasteReminderNotificationsFromLocalState as jest.Mock).mockResolvedValue({
      checked: true,
      errorClass: 'native-verification-mismatch',
      status: 'failed'
    });
    await act(async () => appStateListener?.('active'));

    expect(verifyWasteReminderNotificationsFromLocalState).toHaveBeenCalledTimes(1);
    expect(rescheduleWasteReminderNotificationsFromLocalState).toHaveBeenCalledTimes(1);
  });
});
