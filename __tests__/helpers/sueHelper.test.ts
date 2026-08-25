import {
  getInitialSueStatus,
  getSueApiConfig,
  getVisibleSueStatus,
  hasSueApiConfiguration,
  getSueLimitOfAreaCity,
  inferSueStatusSource,
  shouldShowInternalSuePendingStatus
} from '../../src/helpers/sueHelper';
import { SUE_STATUS_SOURCE } from '../../src/config';

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

describe('getSueLimitOfAreaCity', () => {
  it('returns configured city when present', () => {
    expect(
      getSueLimitOfAreaCity({
        areaName: 'Kiel [kreisfreie Stadt]',
        configuredCity: 'Flensburg'
      })
    ).toBe('Flensburg');
  });

  it('derives city from geo map area name and removes bracket suffixes', () => {
    expect(
      getSueLimitOfAreaCity({
        areaName: 'Kiel [kreisfreie Stadt]'
      })
    ).toBe('Kiel');
  });
});

describe('SUE internal pending status', () => {
  it.each([
    [undefined, true],
    [true, true],
    [null, true],
    ['false', true],
    [false, false]
  ])('resolves setting %p to %p', (setting, expected) => {
    expect(shouldShowInternalSuePendingStatus(setting)).toBe(expected);
  });

  it('creates an internal pending status by default', () => {
    expect(getInitialSueStatus()).toEqual({
      status: 'Unbearbeitet',
      statusSource: SUE_STATUS_SOURCE.INTERNAL
    });
    expect(getInitialSueStatus(false)).toEqual({});
  });

  it('infers legacy status sources without overriding explicit API provenance', () => {
    expect(inferSueStatusSource({ status: 'Unbearbeitet' })).toBe(SUE_STATUS_SOURCE.INTERNAL);
    expect(inferSueStatusSource({ status: 'In Bearbeitung' })).toBe(SUE_STATUS_SOURCE.API);
    expect(
      inferSueStatusSource({ status: 'Unbearbeitet', statusSource: SUE_STATUS_SOURCE.API })
    ).toBe(SUE_STATUS_SOURCE.API);
    expect(inferSueStatusSource({ status: 404 })).toBeUndefined();
    expect(inferSueStatusSource({})).toBeUndefined();
  });

  it('hides only internal statuses when explicitly disabled', () => {
    expect(getVisibleSueStatus({ status: 'Unbearbeitet' }, false)).toBeUndefined();
    expect(
      getVisibleSueStatus({ status: 'Unbearbeitet', statusSource: SUE_STATUS_SOURCE.API }, false)
    ).toBe('Unbearbeitet');
    expect(getVisibleSueStatus({ status: 'In Bearbeitung' }, false)).toBe('In Bearbeitung');
    expect(getVisibleSueStatus({ status: 'Unbearbeitet' })).toBe('Unbearbeitet');
  });
});
