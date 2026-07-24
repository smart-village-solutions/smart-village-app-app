import React from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import {
  clearWasteReminderLocalStateForChangedOwner,
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

jest.mock('../../src/pushNotifications', () => ({
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT: 'pushNotificationPermissionChanged',
  clearWasteReminderLocalStateForChangedOwner: jest.fn(async () => false),
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
  await act(async () => {
    renderer.create(
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
};

describe('useWasteReminderSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appStateListener = undefined;
    permissionChangeListener = undefined;
    manualRetryListener = undefined;
    (getInAppPermission as jest.Mock).mockResolvedValue(true);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      appStateListener = listener as (state: string) => void;

      return { remove: jest.fn() };
    });
    jest.spyOn(DeviceEventEmitter, 'addListener').mockImplementation((event, listener) => {
      if (event === 'wasteReminderManualRetry') {
        manualRetryListener = listener as () => void;
      } else {
        permissionChangeListener = listener as (isEnabled: boolean) => void;
      }

      return { remove: jest.fn() };
    });
  });

  it('serializes owner cleanup, pending server sync, and local replan when app becomes active', async () => {
    const callOrder: string[] = [];

    (clearWasteReminderLocalStateForChangedOwner as jest.Mock).mockImplementation(async () => {
      callOrder.push('cleanup');
      return false;
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

  it('continues maintenance after owner cleanup so current-owner state can be reconstructed', async () => {
    (clearWasteReminderLocalStateForChangedOwner as jest.Mock).mockResolvedValue(
      'changed-and-cleared'
    );

    await renderHook();
    jest.clearAllMocks();
    (clearWasteReminderLocalStateForChangedOwner as jest.Mock).mockResolvedValue(
      'changed-and-cleared'
    );

    await act(async () => {
      appStateListener?.('active');
    });

    expect(rescheduleWasteReminderNotificationsFromLocalState).toHaveBeenCalled();
  });

  it('reconstructs only current-street records from a mixed owner response', async () => {
    (clearWasteReminderLocalStateForChangedOwner as jest.Mock).mockResolvedValue(
      'changed-and-cleared'
    );
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

    jest.clearAllMocks();
    (getInAppPermission as jest.Mock).mockResolvedValue(false);

    await act(async () => {
      appStateListener?.('active');
    });
    await flushPromises();

    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();
  });

  it('syncs and replans stored waste reminders when in-app push notifications are enabled', async () => {
    const callOrder: string[] = [];

    (clearWasteReminderLocalStateForChangedOwner as jest.Mock).mockImplementation(async () => {
      callOrder.push('cleanup');
      return false;
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
    expect(clearWasteReminderLocalStateForChangedOwner).toHaveBeenCalledTimes(1);
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();

    await act(async () => {
      manualRetryListener?.();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(rescheduleWasteReminderNotificationsFromLocalState).toHaveBeenCalledTimes(1);
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
