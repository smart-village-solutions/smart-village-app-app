import { getSueApiConfig, hasSueApiConfiguration } from '../../src/helpers/sueHelper';

describe('getSueApiConfig', () => {
  it('returns the selected nested api config when whichApi points to an existing key', () => {
    expect(
      getSueApiConfig({
        whichApi: 'secondary',
        apiKey: 'base-api-key',
        serverUrl: 'https://base.example.com',
        secondary: {
          apiKey: 'secondary-api-key',
          serverUrl: 'https://secondary.example.com'
        }
      })
    ).toEqual({
      apiKey: 'secondary-api-key',
      serverUrl: 'https://secondary.example.com'
    });
  });

  it('falls back to the base api config when whichApi points to a missing key', () => {
    expect(
      getSueApiConfig({
        whichApi: 'missing',
        apiKey: 'base-api-key',
        serverUrl: 'https://base.example.com'
      })
    ).toEqual({
      whichApi: 'missing',
      apiKey: 'base-api-key',
      serverUrl: 'https://base.example.com'
    });
  });

  it('returns the base api config when whichApi is not set', () => {
    expect(
      getSueApiConfig({
        apiKey: 'base-api-key',
        serverUrl: 'https://base.example.com'
      })
    ).toEqual({
      apiKey: 'base-api-key',
      serverUrl: 'https://base.example.com'
    });
  });
});

describe('hasSueApiConfiguration', () => {
  it('returns true for a complete selected api config', () => {
    expect(
      hasSueApiConfiguration({
        apiConfig: {
          whichApi: 'secondary',
          secondary: {
            apiKey: 'secondary-api-key',
            serverUrl: 'https://secondary.example.com'
          }
        }
      })
    ).toBe(true);
  });

  it.each([
    {},
    { apiConfig: {} },
    { apiConfig: { apiKey: 'api-key' } },
    { apiConfig: { serverUrl: 'https://example.com' } }
  ])('returns false without a complete api config', (sueConfig) => {
    expect(hasSueApiConfiguration(sueConfig)).toBe(false);
  });
});
