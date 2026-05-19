import {
    BUS_REQUEST_TIMEOUT_MS,
    findBusCategoryChildren,
    findBusCategoryRoot,
    findPublicServicesPage,
    getPoliticalArea,
    getPublicService,
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
    jest.useRealTimers();
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

  it('loads the extended public service detail to include online services', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({
        object: {
          id: 'service-1',
          name: 'Gewerbe Anmeldung',
          onlineServices: [{ id: 'os-1', name: 'Digital beantragen' }]
        }
      }),
      ok: true
    });

    const result = await getPublicService({ areaId: '10004', bus, id: 'service-1' });

    expectBusFetch(
      'https://server.int-development.smart-village.app/api/v1/pstExtended/service-1?areaId=10004',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'de-DE'
        },
        method: 'GET'
      }
    );
    expect(result).toEqual({
      id: 'service-1',
      name: 'Gewerbe Anmeldung',
      onlineServices: [{ id: 'os-1', name: 'Digital beantragen' }]
    });
  });

  it('falls back to pst detail when pstExtended is not available on the BUS backend', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 404
      })
      .mockResolvedValueOnce({
        json: async () => ({
          object: {
            id: 'service-1',
            name: 'Gewerbe Anmeldung',
            organisationalUnits: [{ id: 'ou-1', name: 'Amt' }]
          }
        }),
        ok: true
      });

    const result = await getPublicService({ areaId: '10004', bus, id: 'service-1' });

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      'https://server.int-development.smart-village.app/api/v1/pstExtended/service-1?areaId=10004',
      expect.any(Object)
    );
    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      2,
      'https://server.int-development.smart-village.app/api/v1/pst/service-1?areaId=10004',
      expect.any(Object)
    );
    expect(result).toEqual({
      id: 'service-1',
      name: 'Gewerbe Anmeldung',
      organisationalUnits: [{ id: 'ou-1', name: 'Amt' }]
    });
  });

  it('loads a paginated public service page and reads total-item-count from response headers', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      headers: {
        get: (headerName) => (headerName.toLowerCase() === 'total-item-count' ? '2357' : undefined)
      },
      json: async () => ({
        results: [
          {
            object: {
              id: 'service-1',
              name: 'Gewerbe Anmeldung'
            }
          }
        ]
      }),
      ok: true
    });

    const result = await findPublicServicesPage({
      areaId: '10004',
      bus,
      limit: 500,
      offset: 500,
      searchWord: 'unternehmen'
    });

    expectBusFetch(
      'https://server.int-development.smart-village.app/api/v1/pstExtended/find?areaId=10004&limit=500&offset=500&searchWord=unternehmen&selectAttributes=id,name',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'de-DE'
        },
        method: 'GET'
      }
    );
    expect(result).toEqual({
      items: [
        {
          id: 'service-1',
          name: 'Gewerbe Anmeldung'
        }
      ],
      totalItemCount: 2357
    });
  });

  it('uses the same attribute set for the unfiltered BUS base list import', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      headers: {
        get: (headerName) => (headerName.toLowerCase() === 'total-item-count' ? '2357' : undefined)
      },
      json: async () => ({
        results: [
          {
            object: {
              id: 'service-1',
              name: 'Gewerbe Anmeldung'
            }
          }
        ]
      }),
      ok: true
    });

    await findPublicServicesPage({
      areaId: '10004',
      bus,
      limit: 500,
      offset: 0
    });

    expectBusFetch(
      'https://server.int-development.smart-village.app/api/v1/pst/find?areaId=10004&limit=500&offset=0&searchWord=&selectAttributes=id,name',
      {
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'de-DE'
        },
        method: 'GET'
      }
    );
  });

  it('uses pstExtended/find for free BUS search terms including phrases with spaces', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      headers: {
        get: (headerName) => (headerName.toLowerCase() === 'total-item-count' ? '1' : undefined)
      },
      json: async () => ({
        results: [
          {
            object: {
              id: 'service-2',
              name: 'Neues Unternehmen anmelden'
            }
          }
        ]
      }),
      ok: true
    });

    const result = await findPublicServicesPage({
      areaId: '10004',
      bus,
      searchWord: 'Neues Unternehmen oder'
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://server.int-development.smart-village.app/api/v1/pstExtended/find?areaId=10004&limit=500&offset=0&searchWord=Neues%20Unternehmen%20oder&selectAttributes=id,name',
      expect.any(Object)
    );
    expect(result).toEqual({
      items: [
        {
          id: 'service-2',
          name: 'Neues Unternehmen anmelden'
        }
      ],
      totalItemCount: 1
    });
  });

  it('aborts BUS requests that exceed the client timeout', async () => {
    jest.useFakeTimers();
    jest.spyOn(globalThis, 'fetch').mockImplementation((_, options = {}) => {
      const { signal } = options;

      return new Promise((_, reject) => {
        signal?.addEventListener('abort', () => {
          const abortError = new Error('Request aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        });
      });
    });

    const requestPromise = findPublicServicesPage({
      areaId: '10004',
      bus,
      searchWord: 'unternehmen'
    });

    jest.advanceTimersByTime(BUS_REQUEST_TIMEOUT_MS);

    await expect(requestPromise).rejects.toThrow(
      'BUS API request timed out for https://server.int-development.smart-village.app/api/v1/pstExtended/find?areaId=10004&limit=500&offset=0&searchWord=unternehmen&selectAttributes=id,name'
    );
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
      'https://server.int-development.smart-village.app/api/v1/pstCategory/find?searchWord=Lebenslagen%20f%C3%BCr%20B%C3%BCrgerinnen%20und%20B%C3%BCrger&limit=500&areaId=09162000&selectAttributes=id,name',
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
      'https://server.int-development.smart-village.app/api/v1/pstCategory/find?parentId=247228741&limit=500&areaId=09162000&selectAttributes=id,name,description,parentId,position,image,publicServiceTypes',
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
      searchWord: 'Lebenslagen für Bürgerinnen und Bürger'
    });

    expect(result).toBeNull();
  });

  it('matches the lebenslagen root when the searchWord contains surrounding whitespace', async () => {
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
      bus,
      searchWord: ' Lebenslagen für Bürgerinnen und Bürger '
    });

    expect(result).toEqual({
      id: '247228741',
      name: 'Lebenslagen für Bürgerinnen und Bürger',
      publicServiceTypes: []
    });
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
