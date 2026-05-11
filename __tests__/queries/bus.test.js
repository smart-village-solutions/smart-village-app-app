import {
  findBusCategoryChildren,
  findBusCategoryRoot,
  getPoliticalArea,
  searchPoliticalAreas
} from '../../src/queries/bus';

const bus = {
  apiKey: 'test-api-key',
  uri: 'https://server.int-development.smart-village.app/api/v1'
};

const mockFetchJson = (payload) =>
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => payload,
    ok: true
  });

const expectBusFetch = (url, options = {}) => {
  const { headers, ...restOptions } = options;

  expect(globalThis.fetch).toHaveBeenCalledWith(
    url,
    expect.objectContaining({
      ...restOptions,
      headers: expect.objectContaining({
        'x-api-key': bus.apiKey,
        ...headers
      })
    })
  );
};

describe('BUS queries', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not call the autocomplete endpoint below the minimum search length', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    const result = await searchPoliticalAreas({ searchTerm: 'ab', bus });

    expect(result).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns political-area search results as an array', async () => {
    mockFetchJson({
      values: [
        {
          id: '3679',
          name: 'Hagelberg',
          displayName: 'Bad Belzig - OT Hagelberg',
          ags: '12069020'
        }
      ]
    });

    const result = await searchPoliticalAreas({ searchTerm: 'zirk', bus });

    expectBusFetch(
      'https://server.int-development.smart-village.app/api/v1/political-area/search?searchWords=zirk*',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'de-DE'
        },
        method: 'GET'
      }
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
    mockFetchJson({
      values: [
        {
          id: '123',
          name: 'Bad Belzig',
          displayName: 'Bad Belzig',
          ags: '12069020'
        }
      ]
    });

    await searchPoliticalAreas({ searchTerm: 'bad bel', bus });

    expectBusFetch(
      'https://server.int-development.smart-village.app/api/v1/political-area/search?searchWords=bad*&searchWords=bel*',
      {}
    );
  });

  it('splits hyphenated political-area search terms into backend-compatible wildcard tokens', async () => {
    mockFetchJson({
      values: [
        {
          id: '15001000',
          name: 'Dessau-Roßlau',
          displayName: 'Dessau-Roßlau',
          ags: '15001000'
        }
      ]
    });

    await searchPoliticalAreas({ searchTerm: 'Dessau-Roßlau - OT Meinsdorf', bus });

    expectBusFetch(
      'https://server.int-development.smart-village.app/api/v1/political-area/search?searchWords=Dessau*&searchWords=Ro%C3%9Flau*&searchWords=Meinsdorf*',
      {}
    );
  });

  it('loads a political area detail by id and maps it into an area result', async () => {
    mockFetchJson({
      id: '10004',
      name: 'Bad Belzig',
      nameShort: 'Bad Belzig',
      displayName: 'Bad Belzig',
      ags: '12069020'
    });

    const result = await getPoliticalArea({ areaId: '10004', bus });

    expectBusFetch('https://server.int-development.smart-village.app/api/v1/political-area/10004', {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'de-DE'
      },
      method: 'GET'
    });
    expect(result).toEqual({
      ags: '12069020',
      id: '10004',
      label: 'Bad Belzig'
    });
  });

  it('returns null when the political area detail is invalid', async () => {
    mockFetchJson({});

    const result = await getPoliticalArea({ areaId: '10004', bus });

    expect(result).toBeNull();
  });

  it('returns an empty list for unexpected political-area search payloads', async () => {
    mockFetchJson({
      suggestions: [
        {
          value: 'Zirkow (18528)',
          data: {
            id: '3679',
            ags: '13073106'
          }
        }
      ]
    });

    const result = await searchPoliticalAreas({ searchTerm: 'zirk', bus });

    expect(result).toEqual([]);
  });

  it('returns an empty list when the political-area response has no values', async () => {
    mockFetchJson({});

    const result = await searchPoliticalAreas({ searchTerm: 'zirk', bus });

    expect(result).toEqual([]);
  });

  it('loads the lebenslagen root category by searchWord', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        results: [
          {
            object: {
              id: '247228741',
              name: 'Lebenslagen für Bürgerinnen und Bürger',
              publicServiceTypes: []
            }
          }
        ]
      }),
      ok: true
    });

    const result = await findBusCategoryRoot({
      areaId: '09162000',
      bus,
      searchWord: 'Lebenslagen für Bürgerinnen und Bürger'
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://server.int-development.smart-village.app/api/v1/pstCategory/find?searchWord=Lebenslagen%20f%C3%BCr%20B%C3%BCrgerinnen%20und%20B%C3%BCrger&limit=1000&areaId=09162000&selectAttributes[]=id&selectAttributes[]=name',
      expect.any(Object)
    );
    expect(result).toEqual({
      id: '247228741',
      name: 'Lebenslagen für Bürgerinnen und Bürger',
      publicServiceTypes: []
    });
  });

  it('loads child categories by parentId', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        results: [
          {
            object: {
              description: 'Beschreibung',
              id: '247228745',
              image: {
                mimeType: 'image/svg+xml',
                url: 'https://example.com/category.svg'
              },
              parentId: '247228741',
              name: 'Partnerschaft und Familie',
              position: 3,
              publicServiceTypes: []
            }
          }
        ]
      }),
      ok: true
    });

    const result = await findBusCategoryChildren({
      areaId: '09162000',
      bus,
      parentId: '247228741'
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://server.int-development.smart-village.app/api/v1/pstCategory/find?parentId=247228741&limit=1000&areaId=09162000&selectAttributes[]=id&selectAttributes[]=name&selectAttributes[]=description&selectAttributes[]=parentId&selectAttributes[]=position&selectAttributes[]=image&selectAttributes[]=publicServiceTypes',
      expect.any(Object)
    );
    expect(result).toEqual([
      {
        description: 'Beschreibung',
        id: '247228745',
        image: {
          mimeType: 'image/svg+xml',
          url: 'https://example.com/category.svg'
        },
        parentId: '247228741',
        name: 'Partnerschaft und Familie',
        position: 3,
        publicServiceTypes: []
      }
    ]);
  });

  it('returns null for a blank lebenslagen root searchWord without calling the API', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    await expect(findBusCategoryRoot({ bus, searchWord: '   ' })).resolves.toBeNull();
    await expect(findBusCategoryRoot({ bus, searchWord: undefined })).resolves.toBeNull();

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns null when no exact lebenslagen root match is present', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        results: [
          {
            object: {
              id: '247228741',
              name: 'Lebenslagen für Unternehmen',
              publicServiceTypes: []
            }
          },
          {
            object: {
              id: '247228742',
              name: 'Lebenslagen für Bürger',
              publicServiceTypes: []
            }
          }
        ]
      }),
      ok: true
    });

    const result = await findBusCategoryRoot({
      bus,
      searchWord: ' Lebenslagen für Bürgerinnen und Bürger '
    });

    expect(result).toBeNull();
  });

  it('returns null when lebenslagen root results are malformed', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        results: [{}, { object: null }]
      }),
      ok: true
    });

    const result = await findBusCategoryRoot({
      bus,
      searchWord: 'Lebenslagen für Bürgerinnen und Bürger'
    });

    expect(result).toBeNull();
  });

  it('returns null when lebenslagen root results are a malformed object', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        results: {}
      }),
      ok: true
    });

    const result = await findBusCategoryRoot({
      bus,
      searchWord: 'Lebenslagen für Bürgerinnen und Bürger'
    });

    expect(result).toBeNull();
  });

  it('returns an empty list when child category results are missing or malformed', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        json: async () => ({}),
        ok: true
      })
      .mockResolvedValueOnce({
        json: async () => ({
          results: [{}, { object: null }]
        }),
        ok: true
      });

    await expect(findBusCategoryChildren({ bus, parentId: '247228741' })).resolves.toEqual([]);
    await expect(findBusCategoryChildren({ bus, parentId: '247228741' })).resolves.toEqual([]);
  });

  it('returns an empty list when child category results are a malformed object', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        results: {}
      }),
      ok: true
    });

    await expect(findBusCategoryChildren({ bus, parentId: '247228741' })).resolves.toEqual([]);
  });
});
