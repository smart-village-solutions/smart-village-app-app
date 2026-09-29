import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';

import { uploadMultipartFile } from '../../src/helpers/fileSystem';

jest.mock('expo/fetch', () => ({ fetch: jest.fn() }));

afterEach(() => jest.restoreAllMocks());

it('uploads a byte-backed file with the requested MIME type', async () => {
  const appendSpy = jest.spyOn(FormData.prototype, 'append').mockImplementation(() => {});
  const bytesSpy = jest.spyOn(File.prototype, 'bytes').mockResolvedValue(new Uint8Array([65, 66]));
  const sliceSpy = jest.spyOn(File.prototype, 'slice');
  (fetch as jest.Mock).mockResolvedValue({
    headers: new Headers({ 'content-type': 'application/json' }),
    status: 201,
    text: async () => '{}'
  });

  await uploadMultipartFile({
    fieldName: 'attachment',
    fileUri: 'file:///document.pdf',
    mimeType: 'application/pdf',
    url: 'https://example.test/upload'
  });

  const attachment = appendSpy.mock.calls.find(([name]) => name === 'attachment')?.[1];
  expect(attachment).toEqual({
    name: 'document.pdf',
    type: 'application/pdf',
    bytes: expect.any(Function)
  });
  expect(await attachment.bytes()).toEqual(new Uint8Array([65, 66]));
  expect(bytesSpy).toHaveBeenCalledTimes(1);
  expect(sliceSpy).not.toHaveBeenCalled();
  expect(fetch).toHaveBeenCalledWith(
    'https://example.test/upload',
    expect.objectContaining({ body: expect.any(FormData), method: 'POST' })
  );
});
