import { QUERY_TYPES } from '../../queries';

export * from './calendar';
export * from './conversation';
export * from './countries';
export * from './group';
export * from './post';
export * from './user';

export type VolunteerQuery = typeof QUERY_TYPES.VOLUNTEER[keyof typeof QUERY_TYPES.VOLUNTEER];
