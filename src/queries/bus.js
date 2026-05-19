const DEFAULT_LIST_LIMIT = 1000;
const ROOT_CATEGORY_SELECT_ATTRIBUTES = ['id', 'name']
  .map((attribute) => `&selectAttributes[]=${attribute}`)
  .join('');
const CHILD_CATEGORY_SELECT_ATTRIBUTES = [
  'id',
  'name',
  'description',
  'parentId',
  'position',
  'image',
  'publicServiceTypes'
]
  .map((attribute) => `&selectAttributes[]=${attribute}`)
  .join('');

const createRequestOptions = (apiKey) => ({
  headers: {
    Accept: 'application/json',
    'Accept-Language': 'de-DE',
    ...(apiKey ? { 'x-api-key': apiKey } : {})
  },
  method: 'GET'
});

const requestJson = async (url, apiKey) => {
  const response = await fetch(url, createRequestOptions(apiKey));

  if (!response.ok) {
    throw new Error(`BUS API request failed (${response.status}) for ${url}`);
  }

  return response.json();
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
  const { apiKey, uri: baseUrl } = bus;
  const encodedSearchWord = encodeURIComponent(searchWord);
  const commonQuery = `?areaId=${encodeURIComponent(areaId)}&limit=${DEFAULT_LIST_LIMIT}`;
  const selectAttributes = [
    '&selectAttributes[]=id',
    '&selectAttributes[]=externalId',
    '&selectAttributes[]=name',
    '&selectAttributes[]=teaser'
  ].join('');

  const payload = await requestJson(
    `${baseUrl}/pst/find${commonQuery}&searchWord=${encodedSearchWord}${selectAttributes}`,
    apiKey
  );
  const services = (payload?.results || []).map((item) => item?.object);

  return services;
};

export const findBusCategoryRoot = async ({ areaId, bus, searchWord }) => {
  const { apiKey, uri: baseUrl } = bus;
  const normalizedSearchWord = searchWord?.trim();

  if (!normalizedSearchWord) return null;

  const encodedSearchWord = encodeURIComponent(normalizedSearchWord);
  const areaIdQuery = areaId ? `&areaId=${encodeURIComponent(areaId)}` : '';
  const payload = await requestJson(
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
  const payload = await requestJson(
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
  const payload = await requestJson(`${baseUrl}/pst/${encodedId}?areaId=${encodedAreaId}`, apiKey);

  return payload?.object || payload;
};

export const getPoliticalArea = async ({ areaId, bus }) => {
  const { apiKey, uri: baseUrl } = bus;
  const encodedAreaId = encodeURIComponent(areaId);
  const payload = await requestJson(`${baseUrl}/political-area/${encodedAreaId}`, apiKey);

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
  const payload = await requestJson(`${baseUrl}/political-area/search?${searchWordsQuery}`, apiKey);

  return Array.isArray(payload?.values) ? payload.values : [];
};
