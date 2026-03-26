import { getPoliticalArea, searchPoliticalAreas } from '../../src/queries/bus';

const bus = {
  apiKey: 'test-api-key',
  uri: 'https://server.int-development.smart-village.app/api/v1'
};

describe('BUS queries', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not call the autocomplete endpoint below the minimum search length', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    const result = await searchPoliticalAreas({ searchTerm: 'ab', bus });

    expect(result).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns political-area search results as an array', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        values: [
          {
            id: '3679',
            name: 'Hagelberg',
            displayName: 'Bad Belzig - OT Hagelberg',
            ags: '12069020'
          }
        ]
      }),
      ok: true
    });

    const result = await searchPoliticalAreas({ searchTerm: 'zirk', bus });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://server.int-development.smart-village.app/api/v1/political-area/search?searchWords=zirk*',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Accept-Language': 'de-DE',
          'x-api-key': 'test-api-key'
        }),
        method: 'GET'
      })
    );
    expect(result).toEqual([
      {
        id: '3679',
        name: 'Hagelberg',
        displayName: 'Bad Belzig - OT Hagelberg',
        ags: '12069020'
      }
    ]);
  });

  it('forwards multiple words as repeated wildcard searchWords params', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        values: [
          {
            id: '123',
            name: 'Bad Belzig',
            displayName: 'Bad Belzig',
            ags: '12069020'
          }
        ]
      }),
      ok: true
    });

    await searchPoliticalAreas({ searchTerm: 'bad bel', bus });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://server.int-development.smart-village.app/api/v1/political-area/search?searchWords=bad*&searchWords=bel*',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': 'test-api-key'
        })
      })
    );
  });

  it('loads a political area detail by id and maps it into an area result', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        id: '10004',
        name: 'Bad Belzig',
        nameShort: 'Bad Belzig',
        displayName: 'Bad Belzig',
        ags: '12069020'
      }),
      ok: true
    });

    const result = await getPoliticalArea({ areaId: '10004', bus });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://server.int-development.smart-village.app/api/v1/political-area/10004',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Accept-Language': 'de-DE',
          'x-api-key': 'test-api-key'
        }),
        method: 'GET'
      })
    );
    expect(result).toEqual({
      ags: '12069020',
      id: '10004',
      label: 'Bad Belzig'
    });
  });

  it('returns null when the political area detail is invalid', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({}),
      ok: true
    });

    const result = await getPoliticalArea({ areaId: '10004', bus });

    expect(result).toBeNull();
  });

  it('returns an empty list for unexpected political-area search payloads', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        suggestions: [
          {
            value: 'Zirkow (18528)',
            data: {
              id: '3679',
              ags: '13073106'
            }
          }
        ]
      }),
      ok: true
    });

    const result = await searchPoliticalAreas({ searchTerm: 'zirk', bus });

    expect(result).toEqual([]);
  });

  it('returns an empty list when the political-area response has no values', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({}),
      ok: true
    });

    const result = await searchPoliticalAreas({ searchTerm: 'zirk', bus });

    expect(result).toEqual([]);
  });
});
