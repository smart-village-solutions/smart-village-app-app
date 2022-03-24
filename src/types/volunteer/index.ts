import { QUERY_TYPES } from '../../queries';

export * from './calendar';
export * from './login';
export * from './group';

export type VolunteerQuery = typeof QUERY_TYPES.VOLUNTEER[keyof typeof QUERY_TYPES.VOLUNTEER];
