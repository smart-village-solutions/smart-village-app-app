import { getVoucherPartnerAddress } from '../../src/helpers/voucherAddress';

describe('voucher partner address', () => {
  const poiAddresses = [
    { kind: 'other', street: 'Nebenstraße 1' },
    { kind: 'default', street: 'Burgdorfer Str. 11-15', zip: '31275', city: 'Lehrte' }
  ];

  it('prefers the operating company address', () => {
    const address = { street: 'Firmensitz 1' };
    expect(getVoucherPartnerAddress(address, poiAddresses)).toBe(address);
  });

  it('uses the default POI address when the company or its address is missing', () => {
    expect(getVoucherPartnerAddress(undefined, poiAddresses)).toBe(poiAddresses[1]);
    expect(getVoucherPartnerAddress({}, poiAddresses)).toBe(poiAddresses[1]);
  });

  it('uses another valid POI address if no default address exists', () => {
    expect(getVoucherPartnerAddress(null, [poiAddresses[0]])).toBe(poiAddresses[0]);
  });
});
