import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

import { addToStore } from '../../../src/helpers/storageHelper';
import { fetchSueEndpoints } from '../../../src/helpers/sueHelper';
import { withSueResourceCache } from '../../../src/helpers/sueResourceCache';
import { areaService } from '../../../src/queries/SUE/areaService';
import { configurations } from '../../../src/queries/SUE/configurations';
import { services } from '../../../src/queries/SUE/services';
import { fetchSueJson } from '../../../src/queries/SUE/submitRequest';

jest.mock('../../../src/helpers/sueHelper', () => ({ fetchSueEndpoints: jest.fn() }));

const serverUrl = 'https://city.test';
const endpoints = {
  apiKey: 'test-api-key',
  sueConfigurationsUrl: `${serverUrl}/configurations`,
  sueGeoMapConfigurationUrl: `${serverUrl}/geoMap`,
  sueContactRequiredFieldConfigurationUrl: `${serverUrl}/contact`,
  sueServicesUrl: `${serverUrl}/services`,
  sueFetchObj: { method: 'GET', headers: { api_key: 'test-api-key' } }
};
const response = (value: unknown) =>
  ({ ok: true, status: 200, json: async () => value } as Response);

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  (fetchSueEndpoints as jest.Mock).mockResolvedValue(endpoints);
});

afterEach(() => jest.restoreAllMocks());

it('restores categories from device storage offline and preserves other modules and legacy reports', async () => {
  const fetch = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(response([{ service_code: 'waste', service_name: 'Waste' }]));
  await addToStore('sueMyReports', [{ serviceRequestId: 38107 }]);
  await addToStore('bookmarks', ['bookmark-1']);
  const online = await services();
  expect(online).toEqual([{ serviceCode: 'waste', serviceName: 'Waste' }]);
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
  expect(await services()).toEqual(online);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem('bookmarks')).toBe('["bookmark-1"]');
  expect(await AsyncStorage.getItem('sueMyReports')).toBe('[{"serviceRequestId":38107}]');
  const cacheKeys = (await AsyncStorage.getAllKeys()).filter((key) =>
    key.startsWith('sueResourceCacheV1:')
  );
  expect(cacheKeys).toHaveLength(1);
  expect(JSON.stringify(await AsyncStorage.multiGet(cacheKeys))).not.toContain('test-api-key');
});

it('keeps test and production caches separate and does not request uncached data offline', async () => {
  const fetch = jest.spyOn(global, 'fetch').mockResolvedValue(response([]));
  await services();
  (fetchSueEndpoints as jest.Mock).mockResolvedValue({
    ...endpoints,
    sueServicesUrl: 'https://other-city.test/services'
  });
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
  await expect(services()).rejects.toThrow('not available offline');
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('retains the last valid data when the server rejects a read or returns malformed data', async () => {
  const fetch = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(response([{ service_code: 'waste' }]));
  const saved = await services();
  fetch.mockResolvedValueOnce({ ok: false, status: 503 } as Response);
  expect(await services()).toEqual(saved);
  fetch.mockResolvedValueOnce(response({ error: 'Invalid response' }));
  expect(await services()).toEqual(saved);
});

it('restores required fields, map rules and attachment limits offline', async () => {
  const fetch = jest.spyOn(global, 'fetch');
  fetch.mockResolvedValueOnce(response([{ short_name: 'max_file_uploads', value: '5' }]));
  fetch.mockResolvedValueOnce(response({ location_is_required: true }));
  fetch.mockResolvedValueOnce(response({ contact: { first_name: true } }));
  const saved = await configurations();
  expect(saved).toMatchObject({
    geoMap: { locationIsRequired: true },
    limitation: { maxFileUploads: { value: '5' } },
    requiredFields: { firstName: true }
  });
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
  expect(await configurations()).toEqual(saved);
  expect(fetch).toHaveBeenCalledTimes(3);
});

it('restores postal-code validation offline without mixing areas', async () => {
  const settings = (id: string) => ({
    sueConfig: { apiConfig: { areaService: { serverUrl, id } } }
  });
  await addToStore('configurations', settings('area-1'));
  const fetch = jest.spyOn(global, 'fetch');
  fetch.mockResolvedValueOnce(response({ rs: '123' }));
  fetch.mockResolvedValueOnce(response({ values: [{ postalCodes: ['24103', '24103'] }] }));
  expect(await areaService()).toEqual({ postalCodes: ['24103'] });
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
  expect(await areaService()).toEqual({ postalCodes: ['24103'] });
  await addToStore('configurations', settings('area-2'));
  await expect(areaService()).rejects.toThrow('not available offline');
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('still returns live data if saving the cache fails', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Disk full'));
  await expect(withSueResourceCache(['example'], async () => ['live'])).resolves.toEqual(['live']);
});

it('bounds read requests including reading their response body', async () => {
  jest.useFakeTimers();
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: () => new Promise(() => {})
  } as Response);
  try {
    const result = expect(fetchSueJson(serverUrl, {})).rejects.toThrow('timed out');
    await jest.advanceTimersByTimeAsync(30_000);
    await result;
  } finally {
    jest.useRealTimers();
  }
});
