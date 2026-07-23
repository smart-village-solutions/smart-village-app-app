import * as Device from 'expo-device';

import { collectWastePushDiagnostics } from './wastePushDiagnosticsHelper';

type FeedbackInformationSettings = {
  includeSystemInformation?: boolean;
  includeScheduledNotifications?: boolean;
  includeWastePushDiagnostics?: boolean;
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

type DeviceInfo = {
  device?: DeviceDetails;
  operatingSystem?: OperatingSystemDetails;
  wastePushDiagnostics?: Awaited<ReturnType<typeof collectWastePushDiagnostics>>;
  collectionStatus?: Partial<Record<'systemInformation' | 'wastePushDiagnostics', 'failed'>>;
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

export const collectDeviceInfo = async (
  args: CollectDeviceInfoArgs
): Promise<DeviceInfo | undefined> => {
  const includeSystemInformation = args.settings?.includeSystemInformation === true;
  const includeWastePushDiagnostics =
    args.settings?.includeWastePushDiagnostics === true ||
    args.settings?.includeScheduledNotifications === true;

  if (!includeSystemInformation && !includeWastePushDiagnostics) {
    return undefined;
  }

  const collectors: Promise<
    SystemInformation | Awaited<ReturnType<typeof collectWastePushDiagnostics>>
  >[] = [];
  const collectorNames: ('systemInformation' | 'wastePushDiagnostics')[] = [];

  if (includeSystemInformation) {
    collectorNames.push('systemInformation');
    collectors.push(Promise.resolve().then(() => collectSystemInformation()));
  }

  if (includeWastePushDiagnostics) {
    collectorNames.push('wastePushDiagnostics');
    collectors.push(Promise.resolve().then(() => collectWastePushDiagnostics()));
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
      deviceInfo.wastePushDiagnostics = result.value as Awaited<
        ReturnType<typeof collectWastePushDiagnostics>
      >;
    }
  });

  return deviceInfo;
};
