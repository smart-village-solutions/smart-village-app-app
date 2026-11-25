import { fetchSueEndpoints } from '../../helpers';

type SueFeedback = {
  message: string;
  rating: number;
  appVersion?: string;
};

export const sendUserFeedback = async ({ message, rating, appVersion }: SueFeedback) => {
  const { apiKey, sueUserFeedbackUrl } = await fetchSueEndpoints();
  const body = new FormData();

  body.append('feedback', message);
  body.append('rating', String(rating));
  if (appVersion) body.append('appVersion', appVersion);

  const response = await fetch(sueUserFeedbackUrl, {
    method: 'POST',
    headers: { accept: 'application/json', api_key: apiKey },
    body
  });

  // The endpoint returns no response body on success.
  if (!response.ok) {
    throw new Error(`SUE feedback request failed (${response.status})`);
  }
};
