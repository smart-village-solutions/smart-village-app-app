import { resolveAudioPlayerSettings } from '../src/AudioPlayerSettings';

describe('resolveAudioPlayerSettings', () => {
  it('uses safe defaults for absent and invalid remote settings', () => {
    expect(resolveAudioPlayerSettings(undefined)).toEqual({
      enabled: true,
      label: 'Audio',
      showSkipControls: true,
      showSpeedControl: true,
      skipSeconds: 10
    });
    expect(resolveAudioPlayerSettings({ label: ' ', skipSeconds: '30' }).skipSeconds).toBe(10);
  });

  it('accepts the supported remote options and bounds skip duration', () => {
    expect(
      resolveAudioPlayerSettings({
        enabled: false,
        label: 'Audioguide',
        showSkipControls: false,
        showSpeedControl: false,
        skipSeconds: 120
      })
    ).toEqual({
      enabled: false,
      label: 'Audioguide',
      showSkipControls: false,
      showSpeedControl: false,
      skipSeconds: 60
    });
  });
});
