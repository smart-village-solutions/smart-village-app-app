import fs from 'fs';
import { createRequire } from 'module';
import { execSync, execFileSync } from 'child_process';

// CI does not need a global EAS installation; publishing remains mocked.
const mockResolveCli = jest.fn();
jest.mock('module', () => ({ createRequire: jest.fn(() => ({ resolve: mockResolveCli })) }));

jest.mock('fs', () => ({ readFileSync: jest.fn(), writeFileSync: jest.fn() }));
jest.mock('child_process', () => ({ execSync: jest.fn(), execFileSync: jest.fn() }));

describe('OTA native compatibility gate', () => {
  beforeEach(() => jest.clearAllMocks());
  it.each([
    { runtimeVersion: { policy: 'appVersion' } },
    { runtimeVersion: { policy: 'fingerprint' }, android: { runtimeVersion: 'legacy' } }
  ])('refuses unsafe runtime configuration before writing or publishing', (expo) => {
    fs.readFileSync.mockReturnValue(JSON.stringify({ expo }));
    expect(() => jest.isolateModules(() => require('../../.github/scripts/eas-update'))).toThrow(
      'fingerprint'
    );
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(execSync).not.toHaveBeenCalled();
  });
});

describe('OTA source map publishing', () => {
  const originalArgs = process.argv;
  const originalToken = process.env.SENTRY_AUTH_TOKEN;
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveCli.mockReset().mockReturnValue('/tools/eas-cli/bin/run');
    process.argv = ['node', 'eas-update.js', 'fix "quoted" message'];
    process.env.SENTRY_AUTH_TOKEN = 'test-token';
    fs.readFileSync.mockReturnValue(
      JSON.stringify({
        expo: { runtimeVersion: { policy: 'fingerprint' }, extra: { otaVersion: 1 } }
      })
    );
  });
  afterEach(() => {
    process.argv = originalArgs;
    if (originalToken === undefined) delete process.env.SENTRY_AUTH_TOKEN;
    else process.env.SENTRY_AUTH_TOKEN = originalToken;
  });
  it('requires upload credentials before publishing or modifying config', () => {
    delete process.env.SENTRY_AUTH_TOKEN;
    expect(() => jest.isolateModules(() => require('../../.github/scripts/eas-update'))).toThrow(
      'SENTRY_AUTH_TOKEN'
    );
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(execFileSync).not.toHaveBeenCalled();
  });
  it('uploads the same EAS artifacts before the git success steps', () => {
    jest.isolateModules(() => require('../../.github/scripts/eas-update'));
    expect(execFileSync).toHaveBeenNthCalledWith(
      1,
      process.execPath,
      [
        '/tools/eas-cli/bin/run',
        'update',
        '--channel',
        'production',
        '--message',
        'fix "quoted" message'
      ],
      { stdio: 'inherit' }
    );
    expect(execFileSync).toHaveBeenNthCalledWith(
      2,
      process.execPath,
      [expect.stringContaining('expo-upload-sourcemaps'), 'dist'],
      { stdio: 'inherit' }
    );
    expect(createRequire).toHaveBeenCalledWith(expect.stringContaining('eas-update.js'));
    expect(mockResolveCli).toHaveBeenCalledWith('eas-cli/bin/run', { paths: expect.any(Array) });
    const commitIndex = execSync.mock.calls.findIndex(([command]) =>
      command.startsWith('git commit')
    );
    expect(execFileSync.mock.invocationCallOrder[1]).toBeLessThan(
      execSync.mock.invocationCallOrder[commitIndex]
    );
  });
  it('fails before modifying config or publishing if the CLI cannot be resolved', () => {
    mockResolveCli.mockImplementationOnce(() => {
      throw new Error('EAS CLI missing');
    });
    expect(() => jest.isolateModules(() => require('../../.github/scripts/eas-update'))).toThrow(
      'EAS CLI missing'
    );
    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('does not commit or push after a source map upload failure', () => {
    execFileSync
      .mockImplementationOnce(() => undefined)
      .mockImplementationOnce(() => {
        throw new Error('upload failed');
      });
    expect(() => jest.isolateModules(() => require('../../.github/scripts/eas-update'))).toThrow(
      'upload failed'
    );
    expect(execSync.mock.calls.some(([command]) => command.startsWith('git'))).toBe(false);
  });
});
