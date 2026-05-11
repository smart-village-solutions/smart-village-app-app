const DEFAULT_LIST_LIMIT = 1000;

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
    .split(/\s+/)
    .map((word) => word.replace(/[^0-9A-Za-zÄÖÜäöüß]/g, ''))
    .filter(Boolean);

  if (!sanitizedSearchWords.length) return [];

  const searchWordsQuery = sanitizedSearchWords
    .map((word) => `searchWords=${encodeURIComponent(word + '*')}`)
    .join('&');
  const payload = await requestJson(`${baseUrl}/political-area/search?${searchWordsQuery}`, apiKey);

  return Array.isArray(payload?.values) ? payload.values : [];
};
