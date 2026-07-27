import * as Device from 'expo-device';

import { collectWastePushDiagnostics } from './wastePushDiagnosticsHelper';

type FeedbackInformationSettings = {
  includePermissions?: boolean;
  includePushInformation?: boolean;
  includeSystemInformation?: boolean;
  includeScheduledNotifications?: boolean;
  includeWasteConfiguration?: boolean;
  includeWasteDisruptionNotifications?: boolean;
  includeWastePushDiagnostics?: boolean;
  includeWasteReminderScheduling?: boolean;
};

type CollectDeviceInfoArgs = {
  settings?: FeedbackInformationSettings;
  wasteSettings?: {
    disruptionNotificationSettings?: {
      disruption_all_locations?: unknown;
      disruption_location?: unknown;
    };
  };
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
  permissions?: Awaited<ReturnType<typeof collectWastePushDiagnostics>>['permissions'];
  wastePushDiagnostics?: Record<string, unknown>;
  collectionStatus?: Partial<
    Record<'permissions' | 'systemInformation' | 'wastePushDiagnostics', 'failed'>
  >;
};

type SystemInformation = Pick<DeviceInfo, 'device' | 'operatingSystem'>;

type DiagnosticSelection = {
  includePermissions: boolean;
  includePushInformation: boolean;
  includeSystemInformation: boolean;
  includeWasteConfiguration: boolean;
  includeWasteDisruptionNotifications: boolean;
  includeWasteReminderScheduling: boolean;
};

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

const resolveDiagnosticSelection = (
  settings: FeedbackInformationSettings | undefined
): DiagnosticSelection => {
  const includeLegacyDiagnostics =
    settings?.includeWastePushDiagnostics === true ||
    settings?.includeScheduledNotifications === true;

  return {
    includePermissions: settings?.includePermissions === true || includeLegacyDiagnostics,
    includePushInformation: settings?.includePushInformation === true || includeLegacyDiagnostics,
    includeSystemInformation: settings?.includeSystemInformation === true,
    includeWasteConfiguration:
      settings?.includeWasteConfiguration === true || includeLegacyDiagnostics,
    includeWasteDisruptionNotifications: settings?.includeWasteDisruptionNotifications === true,
    includeWasteReminderScheduling:
      settings?.includeWasteReminderScheduling === true || includeLegacyDiagnostics
  };
};

const assignWasteDisruptionNotificationDiagnostics = (
  deviceInfo: DeviceInfo,
  wasteSettings: CollectDeviceInfoArgs['wasteSettings']
) => {
  const settings = wasteSettings?.disruptionNotificationSettings;

  deviceInfo.wastePushDiagnostics = {
    ...deviceInfo.wastePushDiagnostics,
    disruptionNotifications: {
      allLocationsEnabled: settings?.disruption_all_locations === true,
      ownLocationEnabled: settings?.disruption_location === true
    }
  };
};

const selectWasteCollectionStatus = (
  collectionStatus: Record<string, 'failed'>,
  selection: DiagnosticSelection
) =>
  Object.fromEntries(
    Object.entries(collectionStatus).filter(([key]) => {
      if (['androidPushChannel', 'inAppPushSetting', 'tokenOwner'].includes(key)) {
        return selection.includePushInformation;
      }
      if (key === 'scheduledStore') return selection.includeWasteReminderScheduling;
      if (key === 'wasteState') {
        return selection.includeWasteConfiguration || selection.includeWasteReminderScheduling;
      }
      return false;
    })
  );

const assignWasteDiagnostics = (
  deviceInfo: DeviceInfo,
  diagnostics: Awaited<ReturnType<typeof collectWastePushDiagnostics>>,
  selection: DiagnosticSelection
) => {
  const { collectedAt, collectionStatus, permissions, push, scheduling, wasteConfiguration } =
    diagnostics;
  const { permissions: permissionStatus, ...wasteCollectionStatus } = collectionStatus;

  if (selection.includePermissions) {
    deviceInfo.permissions = permissions;
    if (permissionStatus === 'failed') {
      deviceInfo.collectionStatus = {
        ...deviceInfo.collectionStatus,
        permissions: 'failed'
      };
    }
  }

  if (
    !selection.includePushInformation &&
    !selection.includeWasteConfiguration &&
    !selection.includeWasteReminderScheduling
  ) {
    return;
  }

  const wastePush = { ...(push as Record<string, unknown>) };
  delete wastePush.systemPermission;
  const selectedCollectionStatus = selectWasteCollectionStatus(wasteCollectionStatus, selection);

  deviceInfo.wastePushDiagnostics = {
    ...deviceInfo.wastePushDiagnostics,
    collectedAt,
    ...(Object.keys(selectedCollectionStatus).length
      ? { collectionStatus: selectedCollectionStatus }
      : {}),
    ...(selection.includePushInformation ? { push: wastePush } : {}),
    ...(selection.includeWasteConfiguration ? { wasteConfiguration } : {}),
    ...(selection.includeWasteReminderScheduling ? { scheduling } : {})
  };
};

export const collectDeviceInfo = async (
  args: CollectDeviceInfoArgs
): Promise<DeviceInfo | undefined> => {
  const selection = resolveDiagnosticSelection(args.settings);
  const { includeSystemInformation } = selection;
  const includeWastePushDiagnostics =
    selection.includePermissions ||
    selection.includePushInformation ||
    selection.includeWasteConfiguration ||
    selection.includeWasteReminderScheduling;
  const hasDiagnosticInformation =
    includeSystemInformation ||
    includeWastePushDiagnostics ||
    selection.includeWasteDisruptionNotifications;

  if (!hasDiagnosticInformation) {
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

  if (selection.includeWasteDisruptionNotifications) {
    assignWasteDisruptionNotificationDiagnostics(deviceInfo, args.wasteSettings);
  }

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
      assignWasteDiagnostics(
        deviceInfo,
        result.value as Awaited<ReturnType<typeof collectWastePushDiagnostics>>,
        selection
      );
    }
  });

  return deviceInfo;
};
