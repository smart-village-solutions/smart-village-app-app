import { useContext } from 'react';

import { SettingsContext } from './SettingsProvider';

export type AudioPlayerSettings = {
  enabled: boolean;
  label: string;
  showSkipControls: boolean;
  showSpeedControl: boolean;
  skipSeconds: number;
};

const defaults: AudioPlayerSettings = {
  enabled: true,
  label: 'Audio',
  showSkipControls: true,
  showSpeedControl: true,
  skipSeconds: 10
};

export const resolveAudioPlayerSettings = (value: unknown): AudioPlayerSettings => {
  const settings = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const skipSeconds = settings.skipSeconds;
  const label = typeof settings.label === 'string' ? settings.label.trim() : '';

  return {
    enabled: settings.enabled !== false,
    label: label ? label.slice(0, 40) : defaults.label,
    showSkipControls: settings.showSkipControls !== false,
    showSpeedControl: settings.showSpeedControl !== false,
    skipSeconds:
      typeof skipSeconds === 'number' && Number.isFinite(skipSeconds)
        ? Math.min(60, Math.max(5, Math.round(skipSeconds)))
        : defaults.skipSeconds
  };
};

export const useAudioPlayerSettings = () => {
  const { globalSettings } = useContext(SettingsContext);
  const settings = globalSettings as { settings?: { audioPlayer?: unknown } };
  return resolveAudioPlayerSettings(settings?.settings?.audioPlayer);
};
