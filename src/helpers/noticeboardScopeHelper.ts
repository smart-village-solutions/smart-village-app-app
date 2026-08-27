import { AUTH_MODE_PUBLIC, AUTH_MODE_USER, GraphqlAuthMode } from '../graphqlAuth';
import { QUERY_TYPES } from '../queries/types';
import { GenericType, ScreenName } from '../types';

type NoticeboardScopeInput = {
  initialQueryVariables?: Record<string, any>;
  isLoginRequired?: boolean;
  navigationSourceRouteName?: string;
  navigationSourceStaticJsonName?: string;
  query?: string;
  rootRouteName?: string;
};

type NoticeboardScopeResult = {
  authMode: GraphqlAuthMode;
  currentMember: boolean;
};

const PROFILE_NOTICEBOARD_SOURCE_STATIC_JSON_NAMES = new Set([
  'profileService',
  'profileCreateContentServiceTop',
  'profileCreateContentServiceBottom'
]);

const PROFILE_NOTICEBOARD_SOURCE_ROUTE_NAMES = new Set([
  ScreenName.Profile,
  ScreenName.ProfileCreateContentHome
]);

const hasOwn = (value: Record<string, any>, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

export const resolveNoticeboardScope = ({
  initialQueryVariables = {},
  navigationSourceRouteName = '',
  navigationSourceStaticJsonName = '',
  query = '',
  rootRouteName = ''
}: NoticeboardScopeInput): NoticeboardScopeResult => {
  if (hasOwn(initialQueryVariables, 'authMode')) {
    return {
      authMode: initialQueryVariables.authMode as GraphqlAuthMode,
      currentMember: Boolean(initialQueryVariables.currentMember)
    };
  }

  if (hasOwn(initialQueryVariables, 'currentMember')) {
    return {
      authMode: initialQueryVariables.currentMember ? AUTH_MODE_USER : AUTH_MODE_PUBLIC,
      currentMember: Boolean(initialQueryVariables.currentMember)
    };
  }

  const shouldFallbackToCurrentMember =
    query === QUERY_TYPES.GENERIC_ITEMS &&
    initialQueryVariables.genericType === GenericType.Noticeboard &&
    (PROFILE_NOTICEBOARD_SOURCE_STATIC_JSON_NAMES.has(navigationSourceStaticJsonName) ||
      PROFILE_NOTICEBOARD_SOURCE_ROUTE_NAMES.has(navigationSourceRouteName as ScreenName));

  return {
    authMode: shouldFallbackToCurrentMember ? AUTH_MODE_USER : AUTH_MODE_PUBLIC,
    currentMember: shouldFallbackToCurrentMember
  };
};
