import * as appJson from '../../app.json';
import { secrets } from '../config';

const namespace = appJson.expo.slug as keyof typeof secrets;
export const sueApiUrl = secrets[namespace]?.sue?.serverUrl;
export const sueApiKey = secrets[namespace]?.sue?.apiKey;
const mandantenId = secrets[namespace]?.sue?.mandantenId;

// GET
export const sueServicesUrl = `${sueApiUrl}/services?jurisdiction_id=${mandantenId}`;
export const sueStatusesUrl = `${sueApiUrl}/statuses?jurisdiction_id=${mandantenId}`;
export const suePrioritiesUrl = `${sueApiUrl}/priorities?jurisdiction_id=${mandantenId}`;
export const sueRequestsUrl = `${sueApiUrl}/requests?jurisdiction_id=${mandantenId}`;

// PUT
export const sueRequestsUrlWithServiceId = (serviceRequestId: number) =>
  `${sueApiUrl}/requests/${serviceRequestId}?jurisdiction_id=${mandantenId}`;
