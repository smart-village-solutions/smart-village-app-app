import { getSueApiConfig } from '../../src/helpers/sueHelper';

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
