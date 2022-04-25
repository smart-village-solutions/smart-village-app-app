import { ScreenName } from '../../types';
import { QUERY_TYPES } from '../../queries';
import { texts } from '../../config';
import { consul } from '../../config';

export const homeData = (id) => [
  {
    title: texts.consul.homeScreen.general,
    data: [
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.debates,
          query: QUERY_TYPES.CONSUL.DEBATES,
          queryVariables: {
            limit: 15,
            order: 'name_ASC',
            category: texts.consul.homeScreen.debates
          },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.debates
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.proposals,
          query: QUERY_TYPES.CONSUL.PROPOSALS,
          queryVariables: {
            limit: 15,
            order: 'name_ASC',
            category: texts.consul.homeScreen.proposals
          },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.proposals
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.voting,
          query: QUERY_TYPES.CONSUL.POLLS,
          queryVariables: { filter: 'current' },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.voting
      }
    ]
  },
  {
    title: texts.consul.homeScreen.personal,
    data: [
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.myDebates,
          query: QUERY_TYPES.CONSUL.USER,
          extraQuery: QUERY_TYPES.CONSUL.PUBLIC_DEBATES,
          queryVariables: { id: id },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.myDebates
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.myProposals,
          query: QUERY_TYPES.CONSUL.USER,
          extraQuery: QUERY_TYPES.CONSUL.PUBLIC_PROPOSALS,
          queryVariables: { id: id },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.myProposals
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.myComments,
          query: QUERY_TYPES.CONSUL.USER,
          extraQuery: QUERY_TYPES.CONSUL.PUBLIC_COMMENTS,
          queryVariables: { id: id },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.myComments
      }
    ]
  },
  {
    title: texts.consul.homeScreen.account,
    data: [
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.settings,
          query: QUERY_TYPES.CONSUL.USER_SETTINGS,
          queryVariables: { link: consul.serverUrl + consul.settings },
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.settings
      },
      {
        routeName: ScreenName.ConsulIndexScreen,
        params: {
          title: texts.consul.homeScreen.settings,
          query: QUERY_TYPES.CONSUL.LOGOUT,
          queryVariables: {},
          rootRouteName: ScreenName.ConsulHomeScreen
        },
        title: texts.consul.homeScreen.logout
      }
    ]
  }
];
