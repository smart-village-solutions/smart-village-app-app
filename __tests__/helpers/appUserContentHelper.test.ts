/* eslint-disable @typescript-eslint/no-var-requires */
import * as Device from 'expo-device';

import { collectDeviceInfo } from '../../src/helpers/appUserContentHelper';
import { collectWastePushDiagnostics } from '../../src/helpers/wastePushDiagnosticsHelper';

const deviceValues = {
  deviceName: 'Test Phone',
  brand: 'Test Brand',
  manufacturer: 'Test Manufacturer',
  modelId: 'Phone1,1',
  modelName: 'Test Model',
  designName: 'test-design',
  productName: 'test-product',
  deviceType: 1,
  isDevice: true,
  osName: 'TestOS',
  osVersion: '18.0',
  osBuildId: '22A000',
  osInternalBuildId: 'INTERNAL-22A000',
  platformApiLevel: 36
};

jest.mock('expo-device', () => {
  const mockedDevice = { DeviceType: { PHONE: 1 } };

  Object.entries(deviceValues).forEach(([key, value]) => {
    Object.defineProperty(mockedDevice, key, {
      configurable: true,
      enumerable: true,
      get: jest.fn(() => value)
    });
  });

  return mockedDevice;
});

jest.mock('../../src/helpers/wastePushDiagnosticsHelper', () => ({
  collectWastePushDiagnostics: jest.fn()
}));

const deviceKeys = Object.keys(deviceValues) as (keyof typeof deviceValues)[];
const originalDescriptors = new Map(
  deviceKeys.map((key) => [key, Object.getOwnPropertyDescriptor(Device, key)])
);
const wastePushDiagnostics = {
  collectionStatus: {},
  permissions: {
    camera: {
      canAskAgain: true,
      expires: 'never',
      granted: false,
      status: 'undetermined'
    },
    notifications: {
      canAskAgain: true,
      expires: 'never',
      granted: true,
      status: 'granted'
    }
  },
  push: {
    inAppEnabled: true,
    systemPermission: {
      canAskAgain: true,
      granted: true,
      status: 'granted'
    }
  },
  scheduling: {
    currentNativeInventory: { scheduledWasteNotificationCount: 2 }
  }
};
const expectedWastePushDiagnostics = {
  collectionStatus: {},
  push: { inAppEnabled: true },
  scheduling: wastePushDiagnostics.scheduling
};
const expectedPermissions = wastePushDiagnostics.permissions;
const collectWastePushDiagnosticsMock = collectWastePushDiagnostics as jest.Mock;

const expectNoDeviceGetterRead = () => {
  deviceKeys.forEach((key) => {
    const getter = Object.getOwnPropertyDescriptor(Device, key)?.get as jest.Mock;
    expect(getter).not.toHaveBeenCalled();
  });
};

describe('collectDeviceInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    collectWastePushDiagnosticsMock.mockResolvedValue(wastePushDiagnostics);
  });

  afterEach(() => {
    originalDescriptors.forEach((descriptor, key) => {
      if (descriptor) {
        Object.defineProperty(Device, key, descriptor);
      }
    });
  });

  it.each([
    undefined,
    {},
    { includeSystemInformation: false, includeScheduledNotifications: false },
    { includeSystemInformation: 'true', includeScheduledNotifications: 1 }
  ])('does not collect data for inactive settings %#', async (settings) => {
    expect(await collectDeviceInfo({ settings })).toBeUndefined();
    expectNoDeviceGetterRead();
    expect(collectWastePushDiagnosticsMock).not.toHaveBeenCalled();
  });

  it('collects exactly the configured system information', async () => {
    const result = await collectDeviceInfo({ settings: { includeSystemInformation: true } });

    expect(result).toEqual({
      device: {
        deviceName: 'Test Phone',
        brand: 'Test Brand',
        manufacturer: 'Test Manufacturer',
        modelId: 'Phone1,1',
        modelName: 'Test Model',
        designName: 'test-design',
        productName: 'test-product',
        deviceType: 1,
        isDevice: true
      },
      operatingSystem: {
        name: 'TestOS',
        version: '18.0',
        buildId: '22A000',
        internalBuildId: 'INTERNAL-22A000',
        platformApiLevel: 36
      }
    });
    expect(Object.keys(result || {})).toEqual(['device', 'operatingSystem']);
    [
      'appVersion',
      'buildNumber',
      'otaVersion',
      'route',
      'nativeApplicationVersion',
      'nativeBuildVersion'
    ].forEach((key) => {
      expect(result).not.toHaveProperty(key);
      expect(result?.device).not.toHaveProperty(key);
      expect(result?.operatingSystem).not.toHaveProperty(key);
    });
    expect(collectWastePushDiagnosticsMock).not.toHaveBeenCalled();
  });

  it('maps the legacy scheduled-notification setting to minimized diagnostics', async () => {
    const result = await collectDeviceInfo({
      settings: { includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      permissions: expectedPermissions,
      wastePushDiagnostics: expectedWastePushDiagnostics
    });
    expectNoDeviceGetterRead();
  });

  it('collects both independently enabled blocks', async () => {
    const result = await collectDeviceInfo({
      settings: { includeSystemInformation: true, includeScheduledNotifications: true }
    });

    expect(result).toEqual(
      expect.objectContaining({
        device: expect.any(Object),
        operatingSystem: expect.any(Object),
        permissions: expectedPermissions,
        wastePushDiagnostics: expectedWastePushDiagnostics
      })
    );
  });

  it('moves permission collection failures out of waste push diagnostics', async () => {
    collectWastePushDiagnosticsMock.mockResolvedValue({
      ...wastePushDiagnostics,
      collectionStatus: { permissions: 'failed' }
    });

    const result = await collectDeviceInfo({
      settings: { includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      collectionStatus: { permissions: 'failed' },
      permissions: expectedPermissions,
      wastePushDiagnostics: expectedWastePushDiagnostics
    });
  });

  it('keeps system data when scheduled notification collection fails', async () => {
    collectWastePushDiagnosticsMock.mockRejectedValue(new Error('private native error'));

    const result = await collectDeviceInfo({
      settings: { includeSystemInformation: true, includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      device: expect.any(Object),
      operatingSystem: expect.any(Object),
      collectionStatus: { wastePushDiagnostics: 'failed' }
    });
    expect(JSON.stringify(result)).not.toContain('private native error');
  });

  it('keeps notifications when a synchronous device getter fails', async () => {
    Object.defineProperty(Device, 'deviceName', {
      configurable: true,
      enumerable: true,
      get: jest.fn(() => {
        throw new Error('private getter error');
      })
    });

    const result = await collectDeviceInfo({
      settings: { includeSystemInformation: true, includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      permissions: expectedPermissions,
      wastePushDiagnostics: expectedWastePushDiagnostics,
      collectionStatus: { systemInformation: 'failed' }
    });
    expect(JSON.stringify(result)).not.toContain('private getter error');
  });

  it('returns only stable statuses when both collectors fail', async () => {
    Object.defineProperty(Device, 'deviceName', {
      configurable: true,
      enumerable: true,
      get: jest.fn(() => {
        throw new Error('private getter error');
      })
    });
    collectWastePushDiagnosticsMock.mockRejectedValue(new Error('private native error'));

    const result = await collectDeviceInfo({
      settings: { includeSystemInformation: true, includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      collectionStatus: {
        systemInformation: 'failed',
        wastePushDiagnostics: 'failed'
      }
    });
    expect(JSON.stringify(result)).not.toMatch(/private|Error|stack/);
  });
});
