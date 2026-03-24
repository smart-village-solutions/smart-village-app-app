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
