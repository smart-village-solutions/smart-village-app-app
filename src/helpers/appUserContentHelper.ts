import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

type FeedbackInformationSettings = {
  includeSystemInformation?: boolean;
  includeScheduledNotifications?: boolean;
};

type CollectDeviceInfoArgs = {
  settings?: FeedbackInformationSettings;
};

type DeviceDetails = {
  deviceName: string | null;
  brand: string | null;
  manufacturer: string | null;
  modelId: unknown;
  modelName: string | null;
  designName: string | null;
  productName: string | null;
  deviceType: Device.DeviceType | null;
  isDevice: boolean;
};

type OperatingSystemDetails = {
  name: string | null;
  version: string | null;
  buildId: string | null;
  internalBuildId: string | null;
  platformApiLevel: number | null;
};

type ScheduledNotificationDetails = Pick<
  Notifications.NotificationRequest,
  'identifier' | 'content' | 'trigger'
>;

type DeviceInfo = {
  device?: DeviceDetails;
  operatingSystem?: OperatingSystemDetails;
  scheduledNotifications?: ScheduledNotificationDetails[];
  collectionStatus?: Partial<Record<'systemInformation' | 'scheduledNotifications', 'failed'>>;
};

type SystemInformation = Pick<DeviceInfo, 'device' | 'operatingSystem'>;

const collectSystemInformation = (): SystemInformation => ({
  device: {
    deviceName: Device.deviceName,
    brand: Device.brand,
    manufacturer: Device.manufacturer,
    modelId: Device.modelId,
    modelName: Device.modelName,
    designName: Device.designName,
    productName: Device.productName,
    deviceType: Device.deviceType,
    isDevice: Device.isDevice
  },
  operatingSystem: {
    name: Device.osName,
    version: Device.osVersion,
    buildId: Device.osBuildId,
    internalBuildId: Device.osInternalBuildId,
    platformApiLevel: Device.platformApiLevel
  }
});

const collectScheduledNotifications = async (): Promise<ScheduledNotificationDetails[]> => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();

  return notifications.map(({ identifier, content, trigger }) => ({
    identifier,
    content,
    trigger
  }));
};

export const collectDeviceInfo = async (
  args: CollectDeviceInfoArgs
): Promise<DeviceInfo | undefined> => {
  const includeSystemInformation = args.settings?.includeSystemInformation === true;
  const includeScheduledNotifications = args.settings?.includeScheduledNotifications === true;

  if (!includeSystemInformation && !includeScheduledNotifications) {
    return undefined;
  }

  const collectors: Promise<SystemInformation | ScheduledNotificationDetails[]>[] = [];
  const collectorNames: ('systemInformation' | 'scheduledNotifications')[] = [];

  if (includeSystemInformation) {
    collectorNames.push('systemInformation');
    collectors.push(Promise.resolve().then(() => collectSystemInformation()));
  }

  if (includeScheduledNotifications) {
    collectorNames.push('scheduledNotifications');
    collectors.push(Promise.resolve().then(() => collectScheduledNotifications()));
  }

  const results = await Promise.allSettled(collectors);
  const deviceInfo: DeviceInfo = {};

  results.forEach((result, index) => {
    const collectorName = collectorNames[index];

    if (result.status === 'rejected') {
      deviceInfo.collectionStatus = {
        ...deviceInfo.collectionStatus,
        [collectorName]: 'failed'
      };
      return;
    }

    if (collectorName === 'systemInformation') {
      Object.assign(deviceInfo, result.value as SystemInformation);
    } else {
      deviceInfo.scheduledNotifications = result.value as ScheduledNotificationDetails[];
    }
  });

  return deviceInfo;
};
