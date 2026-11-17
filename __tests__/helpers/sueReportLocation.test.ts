import { geocodeSueAddress } from '../../src/helpers/sueReportLocation';

const address = { street: 'Hauptstraße', houseNumber: '2', postalCode: '12345', city: 'Town A' };

it.each([
  [{ town: 'Town B', county: 'Town A' }, false],
  [{ town: 'Town B', suburb: 'Town A', county: 'County' }, true],
  [{ county: 'Town A' }, true]
])(
  'uses county only when more specific locality fields are absent (%j)',
  async (locality, accepted) => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          address: { road: address.street, house_number: '2', postcode: '12345', ...locality },
          lat: '54',
          lon: '10'
        }
      ]
    } as Response);
    try {
      const result = await geocodeSueAddress(address);
      expect(!!result).toBe(accepted);
    } finally {
      fetchSpy.mockRestore();
    }
  }
);
