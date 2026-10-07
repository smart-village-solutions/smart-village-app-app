const fs = require('fs');
const { execSync } = require('child_process');

jest.mock('fs', () => ({ readFileSync: jest.fn(), writeFileSync: jest.fn() }));
jest.mock('child_process', () => ({ execSync: jest.fn() }));

describe('OTA native compatibility gate', () => {
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
