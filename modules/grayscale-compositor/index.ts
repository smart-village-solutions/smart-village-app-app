import { NativeModule, requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

declare class GrayscaleCompositorNativeModule extends NativeModule {
  setEnabled(isEnabled: boolean): Promise<void>;
}

const nativeModule =
  Platform.OS === 'ios'
    ? requireOptionalNativeModule<GrayscaleCompositorNativeModule>('GrayscaleCompositor')
    : null;

export const setIosGrayscaleCompositorEnabled = async (isEnabled: boolean) => {
  if (!nativeModule) return;

  try {
    await nativeModule.setEnabled(isEnabled);
  } catch (error) {
    console.warn('Could not update the iOS grayscale compositor.', error);
  }
};
