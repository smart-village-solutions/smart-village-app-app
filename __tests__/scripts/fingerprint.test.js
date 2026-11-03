import { createHash } from 'crypto';

import { fileHookTransform } from '../../fingerprint.config';

const hashConfig = (config) =>
  createHash('sha256')
    .update(fileHookTransform({ type: 'contents', id: 'expoConfig' }, JSON.stringify(config)))
    .digest('hex');

describe('OTA fingerprint compatibility', () => {
  const config = {
    ios: { bundleIdentifier: 'de.test.app' },
    plugins: ['expo-sharing'],
    extra: { otaVersion: 1, feature: 'value' }
  };
  it('allows the OTA display counter to change without requiring a new binary', () => {
    expect(hashConfig({ ...config, extra: { ...config.extra, otaVersion: 2 } })).toBe(
      hashConfig(config)
    );
  });
  it('still detects native plugins, app identity and other config changes', () => {
    expect(hashConfig({ ...config, plugins: [] })).not.toBe(hashConfig(config));
    expect(hashConfig({ ...config, ios: { bundleIdentifier: 'de.other.app' } })).not.toBe(
      hashConfig(config)
    );
    expect(hashConfig({ ...config, extra: { ...config.extra, feature: 'changed' } })).not.toBe(
      hashConfig(config)
    );
  });
  it('leaves native files and other fingerprint sources untouched', () => {
    const contents = Buffer.from('native module content');
    expect(fileHookTransform({ type: 'file', filePath: 'native.swift' }, contents)).toBe(contents);
    expect(fileHookTransform({ type: 'contents', id: 'packageJson' }, contents)).toBe(contents);
    expect(fileHookTransform({ type: 'contents', id: 'expoConfig' }, null)).toBeNull();
  });
});
