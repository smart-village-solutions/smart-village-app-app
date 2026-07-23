import React from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';
import renderer, { act } from 'react-test-renderer';

import { NetworkContext } from '../../src/NetworkProvider';
import {
  clearWasteReminderLocalStateForChangedOwner,
  getInAppPermission,
  markWasteReminderServerSyncSynced,
  rescheduleWasteReminderNotificationsFromLocalState,
  syncWasteReminderSettingsWithServer
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

jest.mock('../../src/pushNotifications', () => ({
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT: 'pushNotificationPermissionChanged',
  clearWasteReminderLocalStateForChangedOwner: jest.fn(async () => false),
  getInAppPermission: jest.fn(async () => true),
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
  syncWasteReminderSettingsWithServer: jest.fn(async () => ({
    serverSyncPayload: {
      activeTypes: { paper: { active: true, storeId: 123 } },
      notificationSettings: { paper: true },
      reminderTime: '2000-01-01T08:00:00.000Z',
      usedTypeKeys: ['paper']
    },
    success: true
  }))
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
    (getInAppPermission as jest.Mock).mockResolvedValue(true);
    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
      appStateListener = listener as (state: string) => void;

      return { remove: jest.fn() };
    });
    jest.spyOn(DeviceEventEmitter, 'addListener').mockImplementation((_, listener) => {
      permissionChangeListener = listener as (isEnabled: boolean) => void;

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

  it('skips sync and replan on app active after owner cleanup removed local reminder state', async () => {
    (clearWasteReminderLocalStateForChangedOwner as jest.Mock).mockResolvedValue(true);

    await renderHook();
    jest.clearAllMocks();
    (clearWasteReminderLocalStateForChangedOwner as jest.Mock).mockResolvedValue(true);

    await act(async () => {
      appStateListener?.('active');
    });

    expect(syncWasteReminderSettingsWithServer).not.toHaveBeenCalled();
    expect(rescheduleWasteReminderNotificationsFromLocalState).not.toHaveBeenCalled();
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
});
