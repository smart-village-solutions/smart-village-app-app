import { QUERY_TYPES } from '../../queries';

export * from './calendar';
export * from './comment';
export * from './conversation';
export * from './countries';
export * from './group';
export * from './post';
export * from './user';

export type VolunteerQuery = (typeof QUERY_TYPES.VOLUNTEER)[keyof typeof QUERY_TYPES.VOLUNTEER];

export type VolunteerCalendarDateRange = [start: string, end: string];
export type VolunteerDateRange = [date: string] | VolunteerCalendarDateRange;

export enum VolunteerModulesType {
  CALENDAR = 'calendar'
}

export enum VolunteerObjectModelType {
  CALENDAR = 'humhub\\modules\\calendar\\models\\CalendarEntry',
  COMMENT = 'humhub\\modules\\comment\\models\\Comment',
  POST = 'humhub\\modules\\post\\models\\Post'
}
