import { consts, texts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const { ROOT_ROUTE_NAMES } = consts;

export const additionalData = () => [
  {
    id: 2,
    title: 'G-Wiki',
    routeName: 'VolunteerDetail',
    description:
      'Esse sit magna mollit Lorem id veniam eiusmod aliquip elit id consequat deserunt tempor sit.',
    tags: 'Wissensspeicher für Gruppen und Vereine',
    category: { name: 'Wissensspeicher für Gruppen und Vereine' },
    dataProvider: {},
    picture: {
      url: 'https://picsum.photos/1600/900'
    },
    mediaContents: [
      {
        sourceUrl: {
          url: 'https://picsum.photos/1600/900'
        },
        contentType: 'image'
      }
    ],
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
    description:
      'Incididunt eu esse pariatur nisi. Quis labore nisi in id reprehenderit consectetur nisi dolore veniam id irure eiusmod. Fugiat occaecat cupidatat amet deserunt ad officia ut nisi est laboris ex id laboris do.',
    tags: 'Austausch mit und zwischen Gruppen und Vereinen',
    category: { name: 'Austausch mit und zwischen Gruppen und Vereinen' },
    dataProvider: {},
    picture: {
      url: 'https://picsum.photos/1600/901'
    },
    mediaContents: [
      {
        sourceUrl: {
          url: 'https://picsum.photos/1600/901'
        },
        contentType: 'image'
      }
    ],
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
    description:
      'Est tempor aliqua do cillum ex officia nostrud cupidatat exercitation. Incididunt eu esse pariatur nisi. Quis labore nisi in id reprehenderit consectetur nisi dolore veniam id irure eiusmod. Fugiat occaecat cupidatat amet deserunt ad officia ut nisi est laboris ex id laboris do. Reprehenderit laboris aliqua anim consectetur adipisicing in reprehenderit. Esse cillum sit incididunt velit tempor.',
    tags: 'Technik/Material/Räume gemeinsam nutzen',
    category: { name: 'Technik/Material/Räume gemeinsam nutzen' },
    dataProvider: {},
    picture: {
      url: 'https://picsum.photos/1600/902'
    },
    mediaContents: [
      {
        sourceUrl: {
          url: 'https://picsum.photos/1600/902'
        },
        contentType: 'image'
      }
    ],
    params: {
      title: texts.detailTitles.volunteer.additional,
      query: QUERY_TYPES.VOLUNTEER.ADDITIONAL,
      queryVariables: { id: 11 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
];
