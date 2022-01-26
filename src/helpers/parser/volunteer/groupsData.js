import { consts, texts } from '../../../config';
import { QUERY_TYPES } from '../../../queries';

const { ROOT_ROUTE_NAMES } = consts;

export const myGroups = () => [
  {
    id: 2,
    guid: '49868922-5cd7-4afd-9666-0ebe491df78a',
    title: 'Mein Verein',
    routeName: 'VolunteerDetail',
    description: '',
    url: 'http://humhub.herzbergdigitalvereint.de/s/mein-verein/',
    visibility: 1,
    join_policy: 1,
    status: 1,
    tags: 'Senioren, Kinder, Indoor',
    owner: {
      id: 6,
      guid: 'c0655623-346b-4b8d-a888-dfeac07d11b7',
      display_name: 'Marco Metz',
      url: 'http://humhub.herzbergdigitalvereint.de/u/marco.metz/'
    },
    params: {
      title: texts.detailTitles.volunteer.group,
      query: QUERY_TYPES.VOLUNTEER.ALL_GROUPS,
      queryVariables: { id: 2 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    },
    wiki: [
      {
        id: '2962',
        publishedAt: '2022-01-25 18:38:12 UTC',
        sourceUrl: {
          url: 'http://humhub.herzbergdigitalvereint.de/content/perma?id=211',
          description: 'HumHub-Permalink'
        },
        contentBlocks: [
          {
            title: 'öffentliche Information zum Ehrenamt in "Mein Verein"',
            body: '<p>Details zum Ehrenamt</p>'
          }
        ],
        dataProvider: {
          name: 'Mobile App',
          logo: {
            url:
              'https://smart-village.solutions/wp-content/uploads/2020/09/Logo-Smart-Village-Solutions-SVS.png'
          }
        },
        categories: [
          {
            name: 'Ehrenamt'
          }
        ]
      },
      {
        id: '2964',
        publishedAt: '2021-11-16 09:14:28 UTC',
        sourceUrl: {
          url: 'http://humhub.herzbergdigitalvereint.de/content/perma?id=14',
          description: 'HumHub-Permalink'
        },
        contentBlocks: [
          {
            title: 'Mein Verein Intro',
            body: '<p>Hier steht Inhalt</p>'
          }
        ],
        dataProvider: {
          name: 'Mobile App',
          logo: {
            url:
              'https://smart-village.solutions/wp-content/uploads/2020/09/Logo-Smart-Village-Solutions-SVS.png'
          }
        },
        categories: [
          {
            name: 'Ehrenamt'
          }
        ]
      }
    ]
  },
  {
    id: 3,
    guid: '3e6e404c-4c32-44fa-8aa5-6a9b59e9d62b',
    title: 'Projektteam Herzberg digital.verein.t',
    routeName: 'VolunteerDetail',
    description:
      'Dieser Space dient für Absprachen und Tests der Mitglieder von des Projektteams von neuland21, Stadt Herzberg und TPWD.',
    url: 'http://humhub.herzbergdigitalvereint.de/s/projektteam-herzberg-digitalvereint/',
    visibility: 1,
    join_policy: 1,
    status: 1,
    mediaContents: [
      {
        sourceUrl: {
          url:
            'https://humhub.herzbergdigitalvereint.de/uploads/profile_image/banner/3e6e404c-4c32-44fa-8aa5-6a9b59e9d62b.jpg?m=1637074430'
        },
        contentType: 'image'
      }
    ],
    dataProvider: {
      name: '',
      logo: {
        url:
          'https://humhub.herzbergdigitalvereint.de/uploads/profile_image/3e6e404c-4c32-44fa-8aa5-6a9b59e9d62b_org.jpg?m=1637074529'
      }
    },
    tags: null,
    owner: {
      id: 8,
      guid: 'e2e8ab4a-73c0-411c-90ef-93c0777b08a3',
      display_name: 'Laura Heym',
      url: 'http://humhub.herzbergdigitalvereint.de/u/lauraheym/'
    },
    params: {
      title: texts.detailTitles.volunteer.group,
      query: QUERY_TYPES.VOLUNTEER.ALL_GROUPS,
      queryVariables: { id: 3 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  },
  {
    id: 11,
    guid: '3facf95b-1432-4e2b-af6c-3cd733ecd3c0',
    title: 'Testspace',
    routeName: 'VolunteerDetail',
    description: 'Beschreibung',
    url: 'http://humhub.herzbergdigitalvereint.de/s/testspace/',
    visibility: 0,
    join_policy: 0,
    status: 1,
    tags: 'alles',
    owner: {
      id: 5,
      guid: 'c8afbeb8-2041-4424-a9d5-84204652243e',
      display_name: 'Daniel Molnar',
      url: 'http://humhub.herzbergdigitalvereint.de/u/dm%2Bhdvt%40tpwd.de/'
    },
    params: {
      title: texts.detailTitles.volunteer.group,
      query: QUERY_TYPES.VOLUNTEER.ALL_GROUPS,
      queryVariables: { id: 11 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
];

export const myGroupsFollowing = () => [
  {
    id: 8,
    guid: '5e4badda-40ce-4a3e-aefd-21ada3b9b7c1',
    title: 'DorfVerein',
    routeName: 'VolunteerDetail',
    description: 'Hier ist der Bereich unseres DorfVereins, damit wir uns besser vernetzen können.',
    url: 'http://humhub.herzbergdigitalvereint.de/s/dorfverein/',
    visibility: 1,
    join_policy: 1,
    status: 1,
    tags: null,
    mediaContents: [
      {
        sourceUrl: {
          url:
            'https://humhub.herzbergdigitalvereint.de/uploads/profile_image/banner/5e4badda-40ce-4a3e-aefd-21ada3b9b7c1.jpg?m=1637935849'
        },
        contentType: 'image'
      }
    ],
    dataProvider: {
      name: '',
      logo: {
        url:
          'https://humhub.herzbergdigitalvereint.de/uploads/profile_image/5e4badda-40ce-4a3e-aefd-21ada3b9b7c1_org.jpg?m=1637936316'
      }
    },
    owner: {
      id: 11,
      guid: 'caa6a8db-ea00-465b-8553-f749c7b5c542',
      display_name: 'Susann St.adtlabor Herzberg (Elster)',
      url: 'http://humhub.herzbergdigitalvereint.de/u/Stadtlabor+Herzberg/'
    },
    params: {
      title: texts.detailTitles.volunteer.group,
      query: QUERY_TYPES.VOLUNTEER.ALL_GROUPS,
      queryVariables: { id: 8 },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
    }
  }
];

export const allGroups = () => [...myGroups(), ...myGroupsFollowing()].sort((a, b) => a.id - b.id);
