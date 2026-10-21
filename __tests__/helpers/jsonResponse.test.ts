import { readJsonList, readJsonResponse } from '../../src/helpers/jsonResponse';

const response = (body: string, status = 200, contentType = 'application/json') =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => contentType },
    text: async () => body
  } as unknown as Response);

describe('API response validation', () => {
  it.each([
    ['', 200, 'application/json', 'empty'],
    ['', 204, 'application/json', 'empty'],
    ['{"secret":"private"}', 401, 'application/json', 'http'],
    ['<html>private</html>', 502, 'text/html', 'http'],
    ['<html>private</html>', 200, 'text/html', 'content-type'],
    ['{"secret":', 200, 'application/json', 'invalid-json']
  ])('rejects invalid responses without leaking their body', async (body, status, type, reason) => {
    const pending = readJsonResponse(response(body as string, status as number, type as string));
    await expect(pending).rejects.toMatchObject({ reason, status });
    await expect(pending).rejects.not.toThrow('private');
    await expect(pending).rejects.not.toThrow('secret');
  });

  it('accepts JSON with charset and structured JSON content types', async () => {
    await expect(
      readJsonResponse(response('{"id":1}', 200, 'application/json; charset=utf-8'))
    ).resolves.toEqual({ id: 1 });
    await expect(
      readJsonResponse(response('{"id":1}', 200, 'application/problem+json'))
    ).resolves.toEqual({ id: 1 });
  });

  it.each(['null', '{}', '[null]', '[1]'])('rejects invalid list shapes: %s', async (body) => {
    await expect(readJsonList(response(body))).rejects.toMatchObject({ reason: 'shape' });
  });

  it('preserves a valid empty list', async () => {
    await expect(readJsonList(response('[]'))).resolves.toEqual([]);
  });
});
