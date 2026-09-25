const IMAGE_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  heic: 'image/heic',
  heif: 'image/heif'
};

// Keep the upload's filename and MIME aligned with the file produced by the picker/converter.
export const imageUploadMetadata = (uri: string, mimeType?: string | null) => {
  const extension = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(uri)?.[1]?.toLowerCase();
  const type = IMAGE_MIME_TYPES[extension || ''] || mimeType || 'application/octet-stream';
  const normalizedType = type === 'image/jpg' ? 'image/jpeg' : type;
  const suffix =
    extension ||
    Object.keys(IMAGE_MIME_TYPES).find((key) => IMAGE_MIME_TYPES[key] === normalizedType);

  return {
    mimeType: normalizedType,
    fileName: suffix ? `image.${suffix}` : 'image'
  };
};
