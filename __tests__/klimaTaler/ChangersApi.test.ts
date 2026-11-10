import assert from 'node:assert/strict';

import { ChangersError, createChangers, maskUUID } from '../../modules/expo-changers/src/api';
import type { ChangersNative } from '../../modules/expo-changers/src/types';

test('Ohne nativen Build wird ein Fehler statt eines scheinbaren Erfolgs zurückgegeben', async () => {
  await assert.rejects(createChangers(null, 'ios').getStatus(), { code: 'E_NATIVE_UNAVAILABLE' });
});
test('Nicht bestätigte Funktionen rufen das native Modul nicht auf', async () => {
  let calls = 0;
  const native = {
    fetchStatistics: async () => {
      calls++;
    }
  } as unknown as ChangersNative;
  await assert.rejects(createChangers(native, 'android').fetchStatistics(), {
    code: 'E_UNSUPPORTED'
  });
  assert.equal(calls, 0);
});

test('Android statistics require the native safe implementation and preserve zero', async () => {
  const statistics = { coins: 0 };
  const native = {
    safeStatistics: true,
    fetchStatistics: jest.fn().mockResolvedValue(statistics)
  } as unknown as ChangersNative;
  await expect(createChangers(native, 'android').fetchStatistics()).resolves.toEqual(statistics);
  expect(native.fetchStatistics).toHaveBeenCalledTimes(1);
});
test('Anbieterfehler geben keine Identität oder Zugangsdaten preis', async () => {
  const native = {
    getUserUUID: async () => {
      throw { code: 'E_NETWORK', message: 'uuid=private&token=secret' };
    }
  } as unknown as ChangersNative;
  try {
    await createChangers(native, 'ios').getUserUUID();
    assert.fail();
  } catch (e) {
    assert.ok(e instanceof ChangersError);
    assert.equal(e.code, 'E_NETWORK');
    assert.doesNotMatch(e.message, /private|secret/);
  }
});
test('Die angezeigte Identität ist maskiert', () => {
  assert.equal(maskUUID('12345678-1234-1234-1234-123456789abc'), '1234••••9abc');
  assert.equal(maskUUID(null), 'Keine Sitzung');
});
test('iOS verwendet native Statistiken und erhält numerische Nullwerte', async () => {
  const statistics = { coins: 0, walkingDistance: 2, cyclingDistance: 4, co2Avoided: 0 };
  const native = { fetchStatistics: async () => statistics } as ChangersNative;
  assert.deepEqual(await createChangers(native, 'ios').fetchStatistics(), statistics);
});

test('Unrecognized native error codes cannot disclose provider data', async () => {
  const native = {
    getStatus: async () => {
      throw { code: 'E_token=fixture' };
    }
  } as unknown as ChangersNative;
  await assert.rejects(createChangers(native, 'ios').getStatus(), { code: 'E_PROVIDER' });
});

test('an older binary cannot silently enable without the globalSettings gate', async () => {
  const native = { activate: jest.fn() } as unknown as ChangersNative;
  await assert.rejects(createChangers(native, 'ios').setEnabled(true), {
    code: 'E_NATIVE_UNAVAILABLE'
  });
  expect(native.activate).not.toHaveBeenCalled();
});

test('disabled customers without the native module remain inert', async () => {
  await expect(createChangers(null, 'ios').setEnabled(false)).resolves.toBeUndefined();
});

test('unsupported simulator errors remain distinguishable from missing credentials', async () => {
  const native = {
    setEnabled: async () => {
      throw { code: 'E_SIMULATOR_UNSUPPORTED' };
    }
  } as unknown as ChangersNative;
  await assert.rejects(createChangers(native, 'ios').setEnabled(true), {
    code: 'E_SIMULATOR_UNSUPPORTED'
  });
});

test.each([
  0,
  -1,
  1.5,
  NaN,
  Infinity,
  Number.MAX_SAFE_INTEGER + 1,
  '10',
  'https://example.org/offers/10'
])('invalid offer target %s does not reach native code', async (id) => {
  const openOffer = jest.fn();
  const client = createChangers({ openOffer } as unknown as ChangersNative, 'ios');
  await expect(client.openOffer(id as number)).rejects.toMatchObject({
    code: 'E_INVALID_ARGUMENT'
  });
  expect(openOffer).not.toHaveBeenCalled();
});

test.each(['ios', 'android'])('only an offer ID crosses the %s bridge', async (platform) => {
  const openOffer = jest.fn().mockResolvedValue(undefined);
  const client = createChangers({ openOffer } as unknown as ChangersNative, platform);
  expect(client.capabilities.offerDetails.supported).toBe(true);
  await client.openOffer(10);
  expect(openOffer).toHaveBeenCalledWith('10');
});
