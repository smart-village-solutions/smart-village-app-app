/* eslint-disable @typescript-eslint/no-var-requires */
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { collectDeviceInfo } from '../../src/helpers/appUserContentHelper';

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

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn()
}));

const deviceKeys = Object.keys(deviceValues) as (keyof typeof deviceValues)[];
const originalDescriptors = new Map(
  deviceKeys.map((key) => [key, Object.getOwnPropertyDescriptor(Device, key)])
);
const getAllScheduledNotificationsAsync =
  Notifications.getAllScheduledNotificationsAsync as jest.Mock;

const scheduledNotifications = [
  {
    identifier: 'first',
    content: { title: 'First', data: { example: true } },
    trigger: { type: 'date', timestamp: 123 },
    futureExpoField: 'must not be sent'
  },
  {
    identifier: 'second',
    content: { title: 'Second' },
    trigger: null
  }
];

const expectNoDeviceGetterRead = () => {
  deviceKeys.forEach((key) => {
    const getter = Object.getOwnPropertyDescriptor(Device, key)?.get as jest.Mock;
    expect(getter).not.toHaveBeenCalled();
  });
};

describe('collectDeviceInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllScheduledNotificationsAsync.mockResolvedValue(scheduledNotifications);
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
    expect(getAllScheduledNotificationsAsync).not.toHaveBeenCalled();
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
    expect(getAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });

  it('collects and explicitly maps scheduled notifications only', async () => {
    const result = await collectDeviceInfo({
      settings: { includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      scheduledNotifications: scheduledNotifications.map(({ identifier, content, trigger }) => ({
        identifier,
        content,
        trigger
      }))
    });
    expectNoDeviceGetterRead();
  });

  it('keeps an empty scheduled notification list', async () => {
    getAllScheduledNotificationsAsync.mockResolvedValue([]);

    await expect(
      collectDeviceInfo({ settings: { includeScheduledNotifications: true } })
    ).resolves.toEqual({ scheduledNotifications: [] });
  });

  it('collects both independently enabled blocks', async () => {
    const result = await collectDeviceInfo({
      settings: { includeSystemInformation: true, includeScheduledNotifications: true }
    });

    expect(result).toEqual(
      expect.objectContaining({
        device: expect.any(Object),
        operatingSystem: expect.any(Object),
        scheduledNotifications: expect.any(Array)
      })
    );
  });

  it('keeps system data when scheduled notification collection fails', async () => {
    getAllScheduledNotificationsAsync.mockRejectedValue(new Error('private native error'));

    const result = await collectDeviceInfo({
      settings: { includeSystemInformation: true, includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      device: expect.any(Object),
      operatingSystem: expect.any(Object),
      collectionStatus: { scheduledNotifications: 'failed' }
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
      scheduledNotifications: scheduledNotifications.map(({ identifier, content, trigger }) => ({
        identifier,
        content,
        trigger
      })),
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
    getAllScheduledNotificationsAsync.mockRejectedValue(new Error('private native error'));

    const result = await collectDeviceInfo({
      settings: { includeSystemInformation: true, includeScheduledNotifications: true }
    });

    expect(result).toEqual({
      collectionStatus: {
        systemInformation: 'failed',
        scheduledNotifications: 'failed'
      }
    });
    expect(JSON.stringify(result)).not.toMatch(/private|Error|stack/);
  });
});
