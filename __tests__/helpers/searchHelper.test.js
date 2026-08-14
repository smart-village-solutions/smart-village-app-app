import { search } from '../../src/helpers/searchHelper';

const createBusEntry = (name, areaId, suffix = '') => ({
  id: `${name}-${areaId}${suffix}`,
  params: {
    areaId,
    data: {
      id: `${name}-${areaId}${suffix}`,
      name
    }
  },
  routeName: 'BusDetail',
  title: name
});

describe('search helper', () => {
  it('returns current A-Z matches for the current area even when the result count stays the same', () => {
    const brandenburgResults = [
      createBusEntry('Containerdienst, Angebot', '12000000'),
      createBusEntry('Buergerservice', '12000000')
    ];
    const nrwResults = [
      createBusEntry('Containerdienst, Angebot', '05000000'),
      createBusEntry('Buergerservice', '05000000')
    ];

    const brandenburgMatches = search({
      results: brandenburgResults,
      character: 'C'
    });
    const nrwMatches = search({
      results: nrwResults,
      character: 'C'
    });

    expect(brandenburgMatches).toEqual([
      expect.objectContaining({
        params: expect.objectContaining({ areaId: '12000000' })
      })
    ]);
    expect(nrwMatches).toEqual([
      expect.objectContaining({
        params: expect.objectContaining({ areaId: '05000000' })
      })
    ]);
    expect(nrwMatches).not.toBe(brandenburgMatches);
  });
});
