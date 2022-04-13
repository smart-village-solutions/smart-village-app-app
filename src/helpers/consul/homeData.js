import { ScreenName } from '../../types';
import { QUERY_TYPES } from '../../queries';
import { texts } from '../../config';

const query = QUERY_TYPES.CONSUL;
const text = texts.consul.homeScreen;

export const homeData = (id) => [
  {
    title: text.general,
    data: [
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.debates,
          query: query.DEBATES,
          queryVariables: { limit: 15, order: 'name_ASC', category: text.debates },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.debates
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.proposals,
          query: query.PROPOSALS,
          queryVariables: { limit: 15, order: 'name_ASC', category: text.proposals },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.proposals
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.voting,
          query: query.POLLS,
          queryVariables: { filter: 'current' },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.voting
      }
    ]
  },
  {
    title: text.personal,
    data: [
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.myDebates,
          query: query.USER,
          extraQuery: query.PUBLIC_DEBATES,
          queryVariables: { id: id },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.myDebates
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.myProposals,
          query: query.USER,
          extraQuery: query.PUBLIC_PROPOSALS,
          queryVariables: { id: id },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.myProposals
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.myComments,
          query: query.USER,
          extraQuery: query.PUBLIC_COMMENTS,
          queryVariables: { id: id },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.myComments
      }
    ]
  },
  {
    title: text.account,
    data: [
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.settings,
          query: query.USER_SETTINGS,
          queryVariables: { link: 'https://beteiligung.bad-belzig.de/account' },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.settings
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: text.settings,
          query: query.LOGOUT,
          queryVariables: { link: 'https://beteiligung.bad-belzig.de/account' },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: text.logout
      }
    ]
  }
];
