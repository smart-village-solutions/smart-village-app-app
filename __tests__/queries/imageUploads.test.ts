import { uploadMultipartFile } from '../../src/helpers';
import { createUserAsync, updateUserAsync } from '../../src/encounterApi/user';
import { uploadAttachment } from '../../src/queries/consul/uploads/upload';
import { uploadMediaContent } from '../../src/queries/mediaContent';

jest.mock('../../src/config', () => ({
  consts: { MEDIA_TYPES: { DOCUMENT: 'pdf' } },
  encounterApi: { serverUrl: 'https://example.test', version: '/v1', user: '/user' },
  namespace: 'test',
  secrets: {
    test: { serverUrl: 'https://example.test', consul: { serverUrl: 'https://example.test' } }
  }
}));
jest.mock('../../src/jsonValidation', () => ({ parseUser: jest.fn() }));
jest.mock('../../src/helpers', () => ({
  getConsulAuthToken: jest.fn(async () => null),
  uploadMultipartFile: jest.fn(async () => ({}))
}));
jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(async () => null) }));

let appendSpy: jest.SpyInstance;
beforeEach(() => {
  jest.clearAllMocks();
  appendSpy = jest.spyOn(FormData.prototype, 'append').mockImplementation(() => {});
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({ service_url: 'https://example.test/image', user_id: '1' })
  } as Response);
});
afterEach(() => jest.restoreAllMocks());

it.each([
  ['jpg', 'image/jpeg'],
  ['png', 'image/png'],
  ['webp', 'image/webp']
])(
  'sends noticeboard/defect report %s with matching MIME and filename',
  async (extension, mimeType) => {
    await uploadMediaContent({ uri: `file:///photo.${extension}` }, 'image');
    expect(appendSpy).toHaveBeenCalledWith('media_content[attachment]', {
      uri: `file:///photo.${extension}`,
      type: mimeType,
      name: `image.${extension}`
    });
  }
);

it('keeps PDF attachments as PDFs', async () => {
  await uploadMediaContent(
    { cachedAttachment: 'file:///document.pdf' },
    'application/pdf',
    'document',
    'pdf'
  );
  expect(appendSpy).toHaveBeenCalledWith('media_content[attachment]', {
    uri: 'file:///document.pdf',
    type: 'application/pdf',
    name: 'document.pdf'
  });
});

it.each([createUserAsync, updateUserAsync])(
  'uses actual image format for Encounter uploads',
  async (upload) => {
    await upload({
      birthDate: '2000-01-01',
      firstName: 'Test',
      lastName: 'Test',
      phone: '',
      userId: '1',
      imageUri: 'file:///photo.png'
    });
    expect(appendSpy).toHaveBeenCalledWith('image', {
      uri: 'file:///photo.png',
      type: 'image/png',
      name: 'image.png'
    });
  }
);

it.each([
  ['image', 'jpg', 'image/jpeg'],
  ['documents', 'pdf', 'application/pdf']
])('uses a proper multipart MIME for Consul %s', async (relation, extension, mimeType) => {
  await uploadAttachment(`file:///attachment.${extension}`, relation);
  expect(uploadMultipartFile).toHaveBeenCalledWith(
    expect.objectContaining({ mimeType, fileUri: `file:///attachment.${extension}` })
  );
});
