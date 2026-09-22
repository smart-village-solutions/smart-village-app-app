import { launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker';
import { createAssetAsync, saveToLibraryAsync } from 'expo-media-library';
import { Alert } from 'react-native';

import { device } from '../../src/config';
import { useCaptureImage, useSelectImage } from '../../src/hooks/imagePicker';

const mockSetImageUri = jest.fn();
const mockSaveAsync = jest.fn();
const mockRelease = jest.fn();
const mockRenderAsync = jest.fn();
const mockManipulate = jest.fn();

jest.mock('react', () => ({
  useCallback: (callback: unknown) => callback,
  useState: () => [undefined, mockSetImageUri]
}));
jest.mock('../../src/config', () => ({
  device: { platform: 'ios' },
  texts: { errors: { image: { title: 'Image', processingBody: 'Cannot process image' } } }
}));
jest.mock('expo-media-library', () => ({
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  createAssetAsync: jest.fn(async () => ({})),
  saveToLibraryAsync: jest.fn(async () => undefined),
  getAlbumAsync: jest.fn(async () => ({})),
  addAssetsToAlbumAsync: jest.fn()
}));
jest.mock('expo-image-picker', () => ({
  PermissionStatus: { GRANTED: 'granted' },
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  launchCameraAsync: jest.fn()
}));
jest.mock('expo-image-manipulator', () => ({
  ImageManipulator: { manipulate: (...args: unknown[]) => mockManipulate(...args) },
  SaveFormat: { JPEG: 'jpeg' }
}));

const asset = {
  uri: 'file:///photo.HEIC',
  fileName: 'photo.HEIC',
  mimeType: 'image/heic',
  type: 'image' as const,
  width: 100,
  height: 200,
  fileSize: 123,
  exif: { GPSLatitude: 52, GPSLongitude: 13 }
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  device.platform = 'ios';
  mockSaveAsync.mockResolvedValue({ uri: 'file:///converted.jpg', width: 100, height: 200 });
  mockRenderAsync.mockResolvedValue({ saveAsync: mockSaveAsync, release: mockRelease });
  mockManipulate.mockReturnValue({ renderAsync: mockRenderAsync, release: mockRelease });
  (launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [asset] });
  (launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [asset] });
});

it.each([
  {},
  { uri: 'file:///photo', fileName: null, mimeType: 'image/heif' },
  { uri: 'file:///photo.HEIF', fileName: null, mimeType: null },
  { uri: 'file:///photo', fileName: 'photo.HEIC', mimeType: null }
])(
  'converts HEIC/HEIF before returning or publishing the selected image: %p',
  async (overrides) => {
    (launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ ...asset, ...overrides }]
    });
    const result = await useSelectImage().selectImage();

    expect(result).toMatchObject({
      uri: 'file:///converted.jpg',
      fileName: expect.stringMatching(/\.jpg$/),
      mimeType: 'image/jpeg',
      exif: asset.exif,
      width: asset.width,
      height: asset.height
    });
    expect(result?.fileSize).toBeUndefined();
    expect(result?.base64).toBeUndefined();
    expect(mockSaveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.9 });
    expect(mockSetImageUri).toHaveBeenCalledWith('file:///converted.jpg');
  }
);

it.each(['jpeg', 'png'])('leaves %s images unchanged', async (format) => {
  const image = {
    ...asset,
    uri: `file:///photo.${format}`,
    fileName: `photo.${format}`,
    mimeType: `image/${format}`
  };
  (launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [image] });
  expect(await useSelectImage().selectImage()).toBe(image);
  expect(mockManipulate).not.toHaveBeenCalled();
});

it('converts HEIC on Android before publishing the selection', async () => {
  device.platform = 'android';
  expect(await useSelectImage().selectImage()).toMatchObject({
    uri: 'file:///converted.jpg',
    mimeType: 'image/jpeg'
  });
  expect(mockSaveAsync).toHaveBeenCalledWith({ format: 'jpeg', compress: 0.9 });
});

it('does not publish the original image when conversion fails', async () => {
  mockSaveAsync.mockRejectedValueOnce(new Error('conversion failed'));
  expect(await useSelectImage().selectImage()).toBeUndefined();
  expect(Alert.alert).toHaveBeenCalledWith('Image', 'Cannot process image');
  expect(mockSetImageUri).not.toHaveBeenCalled();
  expect(mockRelease).toHaveBeenCalledTimes(2);
});

it('does nothing when selection is canceled', async () => {
  (launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });
  expect(await useSelectImage().selectImage()).toBeUndefined();
  expect(mockManipulate).not.toHaveBeenCalled();
  expect(mockSetImageUri).not.toHaveBeenCalled();
});

afterEach(() => jest.restoreAllMocks());

it.each(['ios', 'android'])(
  'converts camera HEIC before preview and gallery save on %s',
  async (platform) => {
    device.platform = platform;
    const result = await useCaptureImage({ saveImage: true }).captureImage();
    await new Promise((resolve) => setImmediate(resolve));
    expect(result).toMatchObject({
      uri: 'file:///converted.jpg',
      mimeType: 'image/jpeg',
      exif: asset.exif
    });
    expect(mockSetImageUri).toHaveBeenCalledWith('file:///converted.jpg');
    expect(platform === 'android' ? saveToLibraryAsync : createAssetAsync).toHaveBeenCalledWith(
      'file:///converted.jpg'
    );
  }
);

it('does not publish or save a camera image if the native decoder fails', async () => {
  mockRenderAsync.mockRejectedValueOnce(new Error('unsupported codec'));
  expect(await useCaptureImage({ saveImage: true }).captureImage()).toBeUndefined();
  expect(mockSetImageUri).not.toHaveBeenCalled();
  expect(createAssetAsync).not.toHaveBeenCalled();
  expect(Alert.alert).toHaveBeenCalledTimes(1);
  expect(mockRelease).toHaveBeenCalledTimes(1);
});

it('does not convert videos even if HEIC metadata is present', async () => {
  const video = { ...asset, type: 'video' };
  (launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [video] });
  expect(await useSelectImage().selectImage()).toBe(video);
  expect(mockManipulate).not.toHaveBeenCalled();
});

it('does nothing when camera selection is canceled', async () => {
  (launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: null });
  expect(await useCaptureImage({ saveImage: true }).captureImage()).toBeUndefined();
  expect(mockManipulate).not.toHaveBeenCalled();
  expect(mockSetImageUri).not.toHaveBeenCalled();
  expect(createAssetAsync).not.toHaveBeenCalled();
});

it.each(['jpg', 'png'])('leaves camera %s unchanged', async (extension) => {
  const photo = {
    ...asset,
    uri: `file:///camera.${extension}`,
    fileName: `camera.${extension}`,
    mimeType: `image/${extension}`
  };
  (launchCameraAsync as jest.Mock).mockResolvedValue({ canceled: false, assets: [photo] });
  expect(await useCaptureImage().captureImage()).toBe(photo);
  expect(mockManipulate).not.toHaveBeenCalled();
});
