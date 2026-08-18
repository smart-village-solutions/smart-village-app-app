import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';

type MultipartFileUploadParams = {
  fieldName: string;
  fileUri: string;
  headers?: Record<string, string>;
  mimeType?: string;
  parameters?: Record<string, string>;
  url: string;
};

type MultipartFileUploadResult = {
  body: string;
  headers: Record<string, string>;
  mimeType: string | null;
  status: number;
};

export const getFileSize = (uri: string) => new File(uri).info().size ?? 0;

export const uploadMultipartFile = async ({
  fieldName,
  fileUri,
  headers,
  mimeType,
  parameters,
  url
}: MultipartFileUploadParams): Promise<MultipartFileUploadResult> => {
  const file = new File(fileUri);
  const formData = new FormData();

  Object.entries(parameters ?? {}).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append(
    fieldName,
    mimeType ? file.slice(undefined, undefined, mimeType) : file,
    file.name
  );

  const response = await fetch(url, {
    body: formData,
    headers,
    method: 'POST'
  });

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    body: await response.text(),
    headers: responseHeaders,
    mimeType: response.headers.get('content-type'),
    status: response.status
  };
};
