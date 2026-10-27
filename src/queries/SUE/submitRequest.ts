import { File } from 'expo-file-system';

import { fetchSueEndpoints } from '../../helpers/sueHelper';

export class SueSubmissionError extends Error {
  constructor(public status: number) {
    super(`SUE report submission failed (HTTP ${status})`);
  }
}

const withSueTimeout = async <T>(request: (signal: AbortSignal) => Promise<T>): Promise<T> => {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout>;
  const expired = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error('SUE request timed out'));
    }, 30000);
  });
  try {
    return await Promise.race([request(controller.signal), expired]);
  } finally {
    clearTimeout(timeout!);
  }
};

export const fetchSueWithTimeout = (url: string, options: RequestInit) =>
  withSueTimeout((signal) => fetch(url, { ...options, signal }));

export const fetchSueJson = (url: string, options: RequestInit) =>
  withSueTimeout(async (signal) => {
    const response = await fetch(url, { ...options, signal });
    if (!response.ok) throw new Error(`SUE request failed (HTTP ${response.status})`);
    return response.json();
  });

/* eslint-disable complexity */
export const postRequests = async (
  data: Record<string, unknown>,
  endpoints?: Awaited<ReturnType<typeof fetchSueEndpoints>>
) => {
  const { apiKey = '', suePostRequest = '' } = endpoints || (await fetchSueEndpoints());
  const formData = new FormData();

  if (data) {
    const fieldMappings = {
      addressString: 'address_string',
      description: 'description',
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name',
      lat: 'lat',
      long: 'long',
      phone: 'phone',
      serviceCode: 'service_code',
      title: 'title'
    };

    Object.entries(fieldMappings).forEach(([key, formKey]) => {
      if (data[key] != null) formData.append(formKey, String(data[key]));
    });
  }

  const images = JSON.parse(typeof data.images === 'string' ? data.images : '[]') || [];
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const file = new File(image.uri);

    // Expo's native multipart encoder accepts byte-backed file parts in addition to DOM Blobs.
    const attachment = {
      name: image?.imageName,
      type: image?.mimeType,
      bytes: () => file.bytes()
    };
    formData.append(`media_file_${i + 1}`, attachment as unknown as Blob);
  }

  const fetchObj = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    },
    body: formData
  };

  return withSueTimeout(async (signal) => {
    const response = await fetch(suePostRequest, { ...fetchObj, signal });

    if (!response.ok) {
      throw new SueSubmissionError(response.status);
    }

    const result = await response.json();
    const report = Array.isArray(result) && result.length === 1 ? result[0] : result;
    const serviceRequestId = report?.service_request_id;
    const hasValidId =
      (typeof serviceRequestId === 'string' && !!serviceRequestId.trim()) ||
      (typeof serviceRequestId === 'number' &&
        Number.isFinite(serviceRequestId) &&
        serviceRequestId > 0);
    const hasErrorStatus =
      report?.status != null &&
      (typeof report.status !== 'number' || report.status < 200 || report.status >= 300);

    // Only confirmed submissions may reach the screen's onSuccess handler and local history.
    // Some endpoints return API errors in a JSON body even with a successful HTTP status.
    if (hasErrorStatus && typeof report.status === 'number' && report.status >= 400) {
      throw new SueSubmissionError(report.status);
    }
    if (!hasValidId || hasErrorStatus) {
      throw new Error('SUE report submission returned an invalid confirmation');
    }

    return result;
  });
};
/* eslint-enable complexity */
