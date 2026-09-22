import { imageUploadMetadata } from '../../src/helpers/imageUploadMetadata';

it.each([
  ['file:///converted.jpg', 'image/heic', 'image/jpeg', 'image.jpg'],
  ['file:///photo.JPEG?cache=1', undefined, 'image/jpeg', 'image.jpeg'],
  ['file:///photo.png', 'image/jpg', 'image/png', 'image.png'],
  ['content://media/123', 'image/jpeg', 'image/jpeg', 'image.jpg'],
  ['content://media/123', 'image/jpg', 'image/jpeg', 'image.jpg'],
  ['content://media/123', 'image/png', 'image/png', 'image.png'],
  ['content://media/123', undefined, 'application/octet-stream', 'image']
])('resolves metadata for %s (%s)', (uri, inputMime, mimeType, fileName) => {
  expect(imageUploadMetadata(uri, inputMime)).toEqual({ mimeType, fileName });
});
