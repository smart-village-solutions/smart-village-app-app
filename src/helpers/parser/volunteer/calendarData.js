import { consts, texts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const { ROOT_ROUTE_NAMES } = consts;

export const myCalendar = () => [
  {
    id: 1,
    title: 'Termin in meinem Profilkalender',
    tags: '14.01.2022 - 28.01.2022',
    routeName: 'VolunteerDetail',
    category: { name: 'Senioren, Kinder, Indoor' },
    dataProvider: { notice: 'Besonderheiten' },
    dates: [
      {
        dateFrom: '2022-01-14',
        dateTo: '2022-01-28',
        timeStart: '',
        timeEnd: ''
      }
    ],
    listDate: '2022-01-28',
    description: 'Beschreibung',
    params: {
      title: texts.detailTitles.eventRecord,
      query: QUERY_TYPES.VOLUNTEER.CALENDAR,
      queryVariables: { id: 1 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  {
    id: 2,
    title: 'Weihnachten',
    tags: '24.12.2022',
    routeName: 'VolunteerDetail',
    dataProvider: {},
    dates: [
      {
        dateFrom: '2022-12-24',
        dateTo: '2022-12-24',
        timeStart: '',
        timeEnd: ''
      }
    ],
    listDate: '2022-12-24',
    description: 'Stille Nacht, heilige Nacht',
    params: {
      title: texts.detailTitles.eventRecord,
      query: QUERY_TYPES.VOLUNTEER.CALENDAR,
      queryVariables: { id: 2 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
];
