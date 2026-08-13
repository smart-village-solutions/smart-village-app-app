import { EventSubscription, NativeModule, requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type OnOffSwitchLabelsChangedEvent = {
  isEnabled: boolean;
};

type OnOffSwitchLabelsModuleEvents = {
  onOffSwitchLabelsChanged: (event: OnOffSwitchLabelsChangedEvent) => void;
};

declare class OnOffSwitchLabelsNativeModule extends NativeModule<OnOffSwitchLabelsModuleEvents> {
  isEnabled(): Promise<boolean>;
}

const nativeModule =
  Platform.OS === 'ios'
    ? requireOptionalNativeModule<OnOffSwitchLabelsNativeModule>('OnOffSwitchLabels')
    : null;

const emptySubscription: EventSubscription = {
  remove: () => undefined
};

export const isSystemOnOffSwitchLabelsEnabled = async () => {
  if (!nativeModule) return false;

  try {
    return (await nativeModule.isEnabled()) === true;
  } catch (error) {
    console.warn('Could not read the iOS On/Off Labels setting.', error);
    return false;
  }
};

export const addSystemOnOffSwitchLabelsChangeListener = (
  listener: (isEnabled: boolean) => void
): EventSubscription => {
  if (!nativeModule) return emptySubscription;

  return nativeModule.addListener('onOffSwitchLabelsChanged', ({ isEnabled }) => {
    listener(isEnabled === true);
  });
};
