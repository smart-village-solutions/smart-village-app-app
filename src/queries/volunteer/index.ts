import * as appJson from '../../../app.json';
import { secrets } from '../../config';

const namespace = appJson.expo.slug as keyof typeof secrets;
export const volunteerApiUrl =
  secrets[namespace]?.volunteer?.serverUrl + secrets[namespace]?.volunteer?.version;

export * from './auth';
export * from './calendar';
export * from './group';
