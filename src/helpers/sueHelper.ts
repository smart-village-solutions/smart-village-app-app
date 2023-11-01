import * as appJson from '../../app.json';
import { secrets } from '../config';

const namespace = appJson.expo.slug as keyof typeof secrets;
export const serverUrl = secrets[namespace]?.sue?.serverUrl;
export const apiKey = secrets[namespace]?.sue?.apiKey;
const jurisdictionId = secrets[namespace]?.sue?.jurisdictionId;

export const sueFetchObj = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    api_key: apiKey
  }
};

export const suePrioritiesUrl = `${serverUrl}/priorities?jurisdiction_id=${jurisdictionId}`;
export const sueRequestsUrl = `${serverUrl}/requests?jurisdiction_id=${jurisdictionId}`;
export const sueRequestsUrlWithServiceId = (serviceRequestId: number) =>
  `${serverUrl}/requests/${serviceRequestId}?jurisdiction_id=${jurisdictionId}`;
export const sueServicesUrl = `${serverUrl}/services?jurisdiction_id=${jurisdictionId}`;
export const sueStatusesUrl = `${serverUrl}/statuses?jurisdiction_id=${jurisdictionId}`;
