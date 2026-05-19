export const DEFAULT_LIST_LIMIT = 500;
export const BUS_REQUEST_TIMEOUT_MS = 15000;
const buildSelectAttributesQuery = (attributes) =>
  attributes.length ? `&selectAttributes=${attributes.join(',')}` : '';

const ROOT_CATEGORY_SELECT_ATTRIBUTES = buildSelectAttributesQuery(['id', 'name']);
const CHILD_CATEGORY_SELECT_ATTRIBUTES = buildSelectAttributesQuery([
  'id',
  'name',
  'description',
  'parentId',
  'position',
  'image',
  'publicServiceTypes'
]);

const createRequestOptions = (apiKey) => ({
  headers: {
    Accept: 'application/json',
    'Accept-Language': 'de-DE',
    ...(apiKey ? { 'x-api-key': apiKey } : {})
  },
  method: 'GET'
});

const requestJson = async (url, apiKey) => {
  const controller = new AbortController();
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      const timeoutError = new Error(`BUS API request timed out for ${url}`);
      timeoutError.code = 'BUS_API_TIMEOUT';
      reject(timeoutError);
    }, BUS_REQUEST_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      fetch(url, {
        ...createRequestOptions(apiKey),
        signal: controller.signal
      }),
      timeoutPromise
    ]);

    if (!response.ok) {
      const requestError = new Error(`BUS API request failed (${response.status}) for ${url}`);
      requestError.status = response.status;
      throw requestError;
    }

    return {
      headers: response.headers,
      payload: await response.json()
    };
  } catch (error) {
    if (error?.name === 'AbortError' && error?.code !== 'BUS_API_TIMEOUT') {
      const abortError = new Error(`BUS API request timed out for ${url}`);
      abortError.code = 'BUS_API_TIMEOUT';
      throw abortError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const BUS_LEGACY_DETAIL_FALLBACK_STATUSES = new Set([404, 405, 501]);

const normalizePublicServiceSearchWord = (searchWord) =>
  `${searchWord ?? ''}`.trim().replace(/\s+/g, ' ');

const buildPublicServiceFindUrl = ({ areaId, baseUrl, limit, offset, searchWord, endpoint }) => {
  const encodedSearchWord = encodeURIComponent(normalizePublicServiceSearchWord(searchWord));
  const encodedOffset = encodeURIComponent(offset);
  const encodedLimit = encodeURIComponent(limit);
  const commonQuery = `?areaId=${encodeURIComponent(
    areaId
  )}&limit=${encodedLimit}&offset=${encodedOffset}`;
  const selectAttributes = buildSelectAttributesQuery(['id', 'name']);

  return `${baseUrl}/${endpoint}${commonQuery}&searchWord=${encodedSearchWord}${selectAttributes}`;
};

const mapPoliticalArea = (area) => {
  if (!area?.id && !area?.ags && !(area?.displayName || area?.name || area?.nameShort)) return null;

  return {
    ags: area?.ags,
    id: area.id,
    label: area?.displayName || area?.name || area?.nameShort
  };
};

export const findPublicServices = async ({ areaId, bus, searchWord = '' }) => {
  const { items } = await findPublicServicesPage({ areaId, bus, searchWord });

  return items;
};

export const findPublicServicesPage = async ({
  areaId,
  bus,
  limit = DEFAULT_LIST_LIMIT,
  offset = 0,
  searchWord = ''
}) => {
  const { apiKey, uri: baseUrl } = bus;
  const normalizedSearchWord = normalizePublicServiceSearchWord(searchWord);
  const endpoint = normalizedSearchWord ? 'pstExtended/find' : 'pst/find';
  const requestUrl = buildPublicServiceFindUrl({
    areaId,
    baseUrl,
    endpoint,
    limit,
    offset,
    searchWord: normalizedSearchWord
  });
  const { headers, payload } = await requestJson(requestUrl, apiKey);
  const items = (payload?.results || []).map((item) => item?.object).filter(Boolean);
  const totalItemCount = Number(headers?.get?.('total-item-count')) || items.length;

  return { items, totalItemCount };
};

export const findBusCategoryRoot = async ({ areaId, bus, searchWord }) => {
  const { apiKey, uri: baseUrl } = bus;
  const normalizedSearchWord = searchWord?.trim();

  if (!normalizedSearchWord) return null;

  const encodedSearchWord = encodeURIComponent(normalizedSearchWord);
  const areaIdQuery = areaId ? `&areaId=${encodeURIComponent(areaId)}` : '';
  const { payload } = await requestJson(
    `${baseUrl}/pstCategory/find?searchWord=${encodedSearchWord}&limit=${DEFAULT_LIST_LIMIT}${areaIdQuery}${ROOT_CATEGORY_SELECT_ATTRIBUTES}`,
    apiKey
  );
  const results = Array.isArray(payload?.results) ? payload.results : [];

  return (
    results
      .map((item) => item?.object)
      .find((category) => category?.name === normalizedSearchWord) ?? null
  );
};

export const findBusCategoryChildren = async ({ areaId, bus, parentId }) => {
  const { apiKey, uri: baseUrl } = bus;
  const encodedParentId = encodeURIComponent(parentId);
  const areaIdQuery = areaId ? `&areaId=${encodeURIComponent(areaId)}` : '';
  const { payload } = await requestJson(
    `${baseUrl}/pstCategory/find?parentId=${encodedParentId}&limit=${DEFAULT_LIST_LIMIT}${areaIdQuery}${CHILD_CATEGORY_SELECT_ATTRIBUTES}`,
    apiKey
  );
  const results = Array.isArray(payload?.results) ? payload.results : [];

  return results.map((item) => item?.object).filter(Boolean);
};

export const getPublicService = async ({ areaId, bus, id }) => {
  const { apiKey, uri: baseUrl } = bus;
  const encodedAreaId = encodeURIComponent(areaId);
  const encodedId = encodeURIComponent(id);
  let payload;

  try {
    ({ payload } = await requestJson(
      `${baseUrl}/pstExtended/${encodedId}?areaId=${encodedAreaId}`,
      apiKey
    ));
  } catch (error) {
    if (!BUS_LEGACY_DETAIL_FALLBACK_STATUSES.has(error?.status)) {
      throw error;
    }

    ({ payload } = await requestJson(
      `${baseUrl}/pst/${encodedId}?areaId=${encodedAreaId}`,
      apiKey
    ));
  }

  return payload?.object || payload;
};

export const getPoliticalArea = async ({ areaId, bus }) => {
  const { apiKey, uri: baseUrl } = bus;
  const encodedAreaId = encodeURIComponent(areaId);
  const { payload } = await requestJson(`${baseUrl}/political-area/${encodedAreaId}`, apiKey);

  return mapPoliticalArea(payload);
};

export const searchPoliticalAreas = async ({ searchTerm = '', bus }) => {
  const { apiKey, uri: baseUrl } = bus;
  const query = searchTerm.trim();

  if (query.length < 3) return [];

  const sanitizedSearchWords = query
    .split(/[\s-]+/)
    .map((word) => word.replace(/[^0-9A-Za-zÄÖÜäöüß]/g, ''))
    .filter((word) => word.length >= 3);

  if (!sanitizedSearchWords.length) return [];

  const searchWordsQuery = sanitizedSearchWords
    .map((word) => `searchWords=${encodeURIComponent(word + '*')}`)
    .join('&');
  const { payload } = await requestJson(
    `${baseUrl}/political-area/search?${searchWordsQuery}`,
    apiKey
  );

  return Array.isArray(payload?.values) ? payload.values : [];
};
