import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { ImagePickerAsset } from 'expo-image-picker';

const JPEG_QUALITY = 0.9;

const HEIF_EXTENSION = /\.hei[cf](?:[?#].*)?$/i;
const HEIF_MIME_TYPE = /^image\/hei[cf](?:-sequence)?$/i;

const isHeifAsset = (asset: ImagePickerAsset) =>
  HEIF_MIME_TYPE.test(asset.mimeType || '') ||
  HEIF_EXTENSION.test(asset.uri) ||
  HEIF_EXTENSION.test(asset.fileName || '');

export const normalizeSelectedImage = async (
  asset: ImagePickerAsset,
  platform: string
): Promise<ImagePickerAsset> => {
  if (!['ios', 'android'].includes(platform) || asset.type === 'video' || !isHeifAsset(asset))
    return asset;

  const context = ImageManipulator.manipulate(asset.uri);

  try {
    const image = await context.renderAsync();

    try {
      const result = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });

      // Keep EXIF for the report's location lookup, but discard the original file's size/base64.
      return {
        ...asset,
        ...result,
        fileName: result.uri.split('/').pop(),
        mimeType: 'image/jpeg',
        fileSize: undefined,
        base64: undefined
      };
    } finally {
      image.release();
    }
  } finally {
    context.release();
  }
};
