import { consts, texts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const { ROOT_ROUTE_NAMES } = consts;

export const additionalData = () => [
  {
    id: 2,
    title: 'G-Wiki',
    routeName: 'VolunteerDetail',
    description: '',
    tags: 'Wissensspeicher für Gruppen',
    dataProvider: {},
    picture: {
      url: 'https://picsum.photos/1600/900'
    },
    params: {
      title: texts.detailTitles.volunteer.additional,
      query: QUERY_TYPES.VOLUNTEER.ADDITIONAL,
      queryVariables: { id: 2 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  {
    id: 3,
    title: 'G-Marktplatz',
    routeName: 'VolunteerDetail',
    description: '',
    tags: 'Austausch mit und zwischen Gruppen',
    dataProvider: {},
    picture: {
      url: 'https://picsum.photos/1600/900'
    },
    params: {
      title: texts.detailTitles.volunteer.additional,
      query: QUERY_TYPES.VOLUNTEER.ADDITIONAL,
      queryVariables: { id: 3 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  {
    id: 11,
    title: 'G-Nachbarschaft',
    routeName: 'VolunteerDetail',
    description: '',
    tags: 'Technik/Material/Räume gemeinsam nutzen ',
    dataProvider: {},
    picture: {
      url: 'https://picsum.photos/1600/900'
    },
    params: {
      title: texts.detailTitles.volunteer.additional,
      query: QUERY_TYPES.VOLUNTEER.ADDITIONAL,
      queryVariables: { id: 11 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
];
