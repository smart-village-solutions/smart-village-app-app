import { addToStore, readFromStore } from '../../src/helpers/storageHelper';
import { setInAppPermission } from '../../src/pushNotifications/PermissionHandling';
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
});
