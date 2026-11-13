import changers from '../../modules/expo-changers';
import { isKlimaTalerEnabled, openKlimaTaler } from '../../src/klimaTaler/entry';
import { readImportedKlimaTalerVoucher } from '../../src/klimaTaler/importedVoucher';
import { redeemImportedKlimaTalerVoucher } from '../../src/klimaTaler/redeemImportedVoucher';
import { resolveImportedOffersMap } from '../../src/klimaTaler/offersConfiguration';
import { isVoucherCurrentlyAvailable } from '../../src/helpers/voucherAvailability';

jest.mock('../../modules/expo-changers', () => ({
  __esModule: true,
  default: { getStatus: jest.fn() }
}));
jest.mock('../../src/klimaTaler/entry', () => ({
  isKlimaTalerEnabled: jest.fn(),
  openKlimaTaler: jest.fn()
}));

const payload = {
  klimaTaler: {
    schemaVersion: 1,
    environment: 'stage',
    redemptionMode: 'provider',
    locationId: 266,
    offerId: 761,
    cost: 2,
    remaining: 50,
    deeplink: 'https://open.klima-taler.com/offers/761'
  }
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(isKlimaTalerEnabled).mockReturnValue(true);
  jest.mocked(changers.getStatus).mockResolvedValue({ environment: 'stage' } as never);
  jest.mocked(openKlimaTaler).mockResolvedValue(undefined);
});

test('imported-map settings validate both IDs and preselect the category without a provider restriction', () => {
  expect(resolveImportedOffersMap(true)).toBeUndefined();
  expect(resolveImportedOffersMap({ offers: { area: 'detmold' } })).toBeUndefined();
  expect(
    resolveImportedOffersMap({
      offers: { source: 'mainserver', dataProviderId: '601', categoryId: 6013 }
    })
  ).toEqual({ queryVariables: { categoryIds: ['6013'] } });
  expect(
    resolveImportedOffersMap({ offers: { source: 'mainserver', categoryId: '6013' } })
  ).toEqual({ queryVariables: undefined });
  expect(
    resolveImportedOffersMap({
      offers: { source: 'mainserver', dataProviderId: 'other', categoryId: '' }
    })
  ).toEqual({ queryVariables: undefined });
});

test('recognizes the importer contract and opens its remote offer ID', async () => {
  expect(readImportedKlimaTalerVoucher(payload)?.offerId).toBe(761);
  await redeemImportedKlimaTalerVoucher(payload);
  expect(openKlimaTaler).toHaveBeenCalledWith(761);
});

test.each([
  { schemaVersion: 2 },
  { redemptionMode: 'local' },
  { environment: 'invalid' },
  { offerId: '761' },
  { offerId: 0 },
  { locationId: -1 },
  { cost: -1 },
  { remaining: -1 },
  { remaining: 1.5 },
  { deeplink: 'https://example.org/offers/761' }
])('rejects malformed provider metadata: %j', async (override) => {
  const invalid = { klimaTaler: { ...payload.klimaTaler, ...override } };
  expect(readImportedKlimaTalerVoucher(invalid)).toBeUndefined();
  await expect(redeemImportedKlimaTalerVoucher(invalid)).rejects.toThrow();
  expect(openKlimaTaler).not.toHaveBeenCalled();
});

test('blocks exhausted coupons and does not start a native session', async () => {
  const exhausted = { klimaTaler: { ...payload.klimaTaler, remaining: 0 } };
  expect(isVoucherCurrentlyAvailable({ payload: exhausted })).toBe(false);
  expect(isVoucherCurrentlyAvailable({ payload })).toBe(true);
  expect(isVoucherCurrentlyAvailable({ payload: { klimaTaler: {} } })).toBe(false);
  expect(isVoucherCurrentlyAvailable({})).toBe(true);
  await expect(redeemImportedKlimaTalerVoucher(exhausted)).rejects.toThrow();
  expect(changers.getStatus).not.toHaveBeenCalled();
});

test('blocks mismatched environments, native failures and disabled integrations', async () => {
  jest.mocked(changers.getStatus).mockResolvedValue({ environment: 'production' } as never);
  await expect(redeemImportedKlimaTalerVoucher(payload)).rejects.toThrow();
  jest.mocked(changers.getStatus).mockRejectedValue(new Error('unavailable'));
  await expect(redeemImportedKlimaTalerVoucher(payload)).rejects.toThrow();
  jest.mocked(isKlimaTalerEnabled).mockReturnValue(false);
  await expect(redeemImportedKlimaTalerVoucher(payload)).rejects.toThrow();
  expect(openKlimaTaler).not.toHaveBeenCalled();
});

test('a module disabled during the native status request cannot open an offer', async () => {
  jest.mocked(isKlimaTalerEnabled).mockReturnValueOnce(true).mockReturnValue(false);
  await expect(redeemImportedKlimaTalerVoucher(payload)).rejects.toThrow();
  expect(openKlimaTaler).not.toHaveBeenCalled();
});
