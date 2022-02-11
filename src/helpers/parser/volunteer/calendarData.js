import { consts, texts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const { ROOT_ROUTE_NAMES } = consts;

export const myCalendar = () => [
  {
    id: 1,
    name: 'Termin in meinem Profilkalender',
    tags: '14.01.2022 - 28.01.2022',
    routeName: 'Detail',
    listDate: '2022-01-28',
    params: {
      title: texts.detailTitles.eventRecord,
      query: QUERY_TYPES.EVENT_RECORD,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
    }
  },
  {
    id: 2,
    name: 'Weihnachten',
    tags: '24.12.2022',
    routeName: 'Detail',
    listDate: '2022-12-24',
    params: {
      title: texts.detailTitles.eventRecord,
      query: QUERY_TYPES.EVENT_RECORD,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
    }
  }
];

export const myCalendarSectioned = () => [
  {
    id: 1,
    name: 'Termin in meinem Profilkalender',
    tags: '14.01.2022 - 28.01.2022',
    routeName: 'Detail',
    listDate: '2022-01-28',
    params: {
      title: texts.detailTitles.eventRecord,
      query: QUERY_TYPES.EVENT_RECORD,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
    }
  },
  {
    id: 2,
    name: 'Weihnachten',
    tags: '24.12.2022',
    routeName: 'Detail',
    listDate: '2022-12-24',
    params: {
      title: texts.detailTitles.eventRecord,
      query: QUERY_TYPES.EVENT_RECORD,
      queryVariables: {},
      rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
    }
  }
];
