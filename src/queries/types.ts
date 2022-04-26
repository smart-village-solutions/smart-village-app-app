import _camelCase from 'lodash/camelCase';

export const QUERY_TYPES = {
  APP_USER_CONTENT: 'appUserContent',
  CATEGORIES: 'categories',
  CONSTRUCTION_SITES: 'constructionSites',
  EVENT_RECORD: 'eventRecord',
  EVENT_RECORDS: 'eventRecords',
  GENERIC_ITEM: 'genericItem',
  GENERIC_ITEMS: 'genericItems',
  LUNCHES: 'lunches',
  NEWS_ITEM: 'newsItem',
  NEWS_ITEMS: 'newsItems',
  NEWS_ITEMS_DATA_PROVIDER: 'newsItemsDataProvider',
  POINT_OF_INTEREST: 'pointOfInterest',
  POINTS_OF_INTEREST: 'pointsOfInterest',
  POINTS_OF_INTEREST_AND_TOURS: 'pointsOfInterestAndTours',
  PUBLIC_HTML_FILE: 'publicHtmlFile',
  PUBLIC_JSON_FILE: 'publicJsonFile',
  TOUR: 'tour',
  TOURS: 'tours',
  VOLUNTEER: {
    ADDITIONAL: 'additional',
    CALENDAR_ALL_MY: 'calendarAllMy',
    CALENDAR_ALL: 'calendarAll',
    CALENDAR: 'calendar',
    CONVERSATION: 'conversation',
    CONVERSATIONS: 'conversations',
    GROUP: 'group',
    GROUPS_MY: 'groupsMy',
    GROUPS: 'groups',
    ME: 'me',
    MEMBERS: 'members',
    POSTS: 'posts',
    PROFILE: 'profile',
    TASKS: 'tasks',
    USER: 'user',
    USERS: 'users'
  } as const,
  WASTE_ADDRESSES: 'wasteAddresses',
  WASTE_STREET: 'wasteStreet',
  WEATHER_MAP: 'weatherMap',
  WEATHER_MAP_CURRENT: 'weatherMapCurrent',
  CONSUL: {
    DEBATES: 'debates',
    DEBATE: 'debate',
    START_DEBATE: 'startDebate',
    UPDATE_DEBATE: 'updateDebate',
    PROPOSALS: 'proposals',
    PROPOSAL: 'proposal',
    START_PROPOSAL: 'startProposal',
    UPDATE_PROPOSAL: 'updateProposal',
    POLLS: 'polls',
    POLL: 'poll',
    USER: 'user',
    COMMENTS: 'comments',
    PUBLIC_DEBATES: 'publicDebates',
    PUBLIC_PROPOSALS: 'publicProposals',
    PUBLIC_COMMENTS: 'publicComments',
    PUBLIC_COMMENT: 'publicComment',
    USER_SETTINGS: 'userSettings',
    LOGOUT: 'logout',
    SORTING: {
      NEWESTDATE: 'newestDate',
      MOSTACTIVE: 'mostActive',
      HIGHESTRATED: 'highestRated'
    },
    FILTER: {
      CURRENT: 'current',
      EXPIRED: 'expired'
    }
  }
};

/**
 * Parse a query type from json string if one matches.
 */
export const getQueryType = (input: string) => {
  const camelCaseInput = _camelCase(input);
  const availableTypes = [
    QUERY_TYPES.TOUR,
    QUERY_TYPES.POINTS_OF_INTEREST,
    QUERY_TYPES.NEWS_ITEM,
    QUERY_TYPES.EVENT_RECORD
  ];
  return availableTypes.find((type) => type === camelCaseInput);
};
