import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  readSueReportDraftForEndpoint,
  storeSueReportDraftForEndpoint,
  removeSueReportDraftForEndpoint
} from '../../src/helpers/sueReportDraftHelper';

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});

it('keeps drafts isolated by their original endpoint and removes only the submitted draft', async () => {
  const test = 'https://test.example/requests';
  const prod = 'https://prod.example/requests';
  await storeSueReportDraftForEndpoint({ title: 'Test report' }, test);
  expect(await readSueReportDraftForEndpoint(prod)).toBeUndefined();
  await storeSueReportDraftForEndpoint({ title: 'Production report' }, prod);
  expect(await readSueReportDraftForEndpoint(test)).toEqual({ title: 'Test report' });
  await removeSueReportDraftForEndpoint(prod);
  expect(await readSueReportDraftForEndpoint(test)).toEqual({ title: 'Test report' });
});

it('retains an unbound legacy draft without assigning it to the current backend', async () => {
  await AsyncStorage.setItem('sueReportValues', JSON.stringify({ title: 'Legacy report' }));
  expect(await readSueReportDraftForEndpoint('https://prod.example/requests')).toBeUndefined();
  expect(await AsyncStorage.getItem('sueReportValues')).toBe(
    JSON.stringify({ title: 'Legacy report' })
  );
});

it('rejects mismatched or newer envelopes without removing their contents', async () => {
  const key = 'sueReportDraftV2:https://prod.example/requests';
  const stored = JSON.stringify({
    version: 3,
    endpoint: 'https://test.example/requests',
    values: {}
  });
  await AsyncStorage.setItem(key, stored);
  await expect(readSueReportDraftForEndpoint('https://prod.example/requests')).rejects.toThrow();
  expect(await AsyncStorage.getItem(key)).toBe(stored);
});
