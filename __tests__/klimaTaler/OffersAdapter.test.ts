import { fetch } from 'expo/fetch';

import changers from '../../modules/expo-changers';
import { loadKlimaTalerOffers } from '../../src/klimaTaler/offers';

let mockEnabled = true;
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }));
jest.mock('../../modules/expo-changers', () => ({
  __esModule: true,
  default: { getStatus: jest.fn(), activate: jest.fn(), registerUser: jest.fn() }
}));
jest.mock('../../src/klimaTaler/entry', () => ({ isKlimaTalerEnabled: () => mockEnabled }));

const native = changers.getStatus as jest.Mock;
const request = fetch as jest.Mock;
beforeEach(() => {
  mockEnabled = true;
  jest.clearAllMocks();
  native.mockResolvedValue({ environment: 'stage', activated: false, authenticated: false });
  request.mockResolvedValue({
    status: 200,
    headers: { get: () => null },
    json: async () => ({
      count: 0,
      locations: [],
      center: { latitude: 51, longitude: 8 },
      radius_km: 10
    })
  });
});

test('reads the native environment without activating or registering an unauthenticated user', async () => {
  await loadKlimaTalerOffers({ area: 'detmold' });
  expect(request.mock.calls[0][0]).toBe('https://api.coin-stage.de/api/v1/map/offers?area=detmold');
  expect(changers.activate).not.toHaveBeenCalled();
  expect(changers.registerUser).not.toHaveBeenCalled();
});

test('disabled modules do not even read SDK status', async () => {
  mockEnabled = false;
  await expect(loadKlimaTalerOffers({ area: 'detmold' })).rejects.toThrow('E_DISABLED');
  expect(native).not.toHaveBeenCalled();
  expect(request).not.toHaveBeenCalled();
});

test('a late native status response cannot dispatch after remote disable', async () => {
  let finish!: (value: object) => void;
  native.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const result = loadKlimaTalerOffers({ area: 'detmold', radius: 5 });
  mockEnabled = false;
  finish({ environment: 'stage' });
  await expect(result).rejects.toThrow('E_DISABLED');
  expect(request).not.toHaveBeenCalled();
});
