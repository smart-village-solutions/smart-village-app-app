export class JsonResponseError extends Error {
  constructor(
    public readonly reason: 'http' | 'empty' | 'content-type' | 'invalid-json' | 'shape',
    public readonly status: number
  ) {
    // Do not include response bodies, URLs or credentials in diagnostics.
    super(`Invalid API response (${reason}, HTTP ${status})`);
    this.name = 'JsonResponseError';
  }
}

export const readJsonResponse = async (response: Response): Promise<unknown> => {
  if (!response.ok) throw new JsonResponseError('http', response.status);

  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType && contentType !== 'application/json' && !contentType.endsWith('+json')) {
    throw new JsonResponseError('content-type', response.status);
  }

  const text = await response.text();
  if (!text.trim()) throw new JsonResponseError('empty', response.status);

  try {
    return JSON.parse(text);
  } catch {
    throw new JsonResponseError('invalid-json', response.status);
  }
};

export const isJsonObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

export const readJsonList = async (response: Response): Promise<Record<string, unknown>[]> => {
  const value = await readJsonResponse(response);
  if (!Array.isArray(value) || !value.every(isJsonObject)) {
    throw new JsonResponseError('shape', response.status);
  }

  return value;
};
