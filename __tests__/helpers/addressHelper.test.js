import { hasConcretePostalAddress } from '../../src/helpers/addressHelper';

describe('hasConcretePostalAddress', () => {
  it.each([
    { city: 'Musterstadt', street: 'Musterstraße 1' },
    { street: 'Musterstraße 1', zip: '12345' },
    { city: 'Musterstadt', street: 'Dorfstraße', zip: '12345' }
  ])('accepts a street with a locality as a concrete postal address: %p', (address) => {
    expect(hasConcretePostalAddress(address)).toBe(true);
  });

  it.each([
    undefined,
    {},
    { city: 'Lenzen' },
    { city: 'Bad Wilsnack', zip: '19336' },
    { addition: 'Beobachtungsturm A', city: 'Lenzen', zip: '19309' },
    { city: 'Musterstadt', street: '   ', zip: '12345' },
    { street: 'Musterstraße 1' }
  ])('rejects incomplete or descriptive location data: %p', (address) => {
    expect(hasConcretePostalAddress(address)).toBe(false);
  });
});
