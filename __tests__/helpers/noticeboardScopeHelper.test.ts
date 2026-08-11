import { AUTH_MODE_PUBLIC, AUTH_MODE_USER } from '../../src/graphqlAuth';
import { resolveNoticeboardScope } from '../../src/helpers/noticeboardScopeHelper';
import { QUERY_TYPES } from '../../src/queries/types';
import { GenericType } from '../../src/types/GenericType';
import { ScreenName } from '../../src/types/Navigation';

describe('resolveNoticeboardScope', () => {
  it('uses explicit authMode from static content with highest priority', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          authMode: AUTH_MODE_USER,
          currentMember: true,
          genericType: GenericType.Noticeboard
        },
        navigationSourceStaticJsonName: 'profileService',
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Profile
      })
    ).toEqual({
      authMode: AUTH_MODE_USER,
      currentMember: true
    });
  });

  it('uses explicit currentMember from static content before fallback heuristics', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          currentMember: false,
          genericType: GenericType.Noticeboard
        },
        navigationSourceStaticJsonName: 'profileService',
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Profile
      })
    ).toEqual({
      authMode: AUTH_MODE_PUBLIC,
      currentMember: false
    });
  });

  it('falls back to user scope for profile service noticeboard entries when nothing explicit is provided', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          genericType: GenericType.Noticeboard
        },
        navigationSourceStaticJsonName: 'profileService',
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Noticeboard
      })
    ).toEqual({
      authMode: AUTH_MODE_USER,
      currentMember: true
    });
  });

  it('falls back to user scope for noticeboard entries opened from the profile create-content home route', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          genericType: GenericType.Noticeboard
        },
        navigationSourceRouteName: ScreenName.ProfileCreateContentHome,
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Noticeboard
      })
    ).toEqual({
      authMode: AUTH_MODE_USER,
      currentMember: true
    });
  });

  it('falls back to user scope for noticeboard entries from the profile create-content top tiles', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          genericType: GenericType.Noticeboard
        },
        navigationSourceStaticJsonName: 'profileCreateContentServiceTop',
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Noticeboard
      })
    ).toEqual({
      authMode: AUTH_MODE_USER,
      currentMember: true
    });
  });

  it('falls back to user scope for noticeboard entries from the profile create-content bottom tiles', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          genericType: GenericType.Noticeboard
        },
        navigationSourceStaticJsonName: 'profileCreateContentServiceBottom',
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Noticeboard
      })
    ).toEqual({
      authMode: AUTH_MODE_USER,
      currentMember: true
    });
  });

  it('keeps public scope for ordinary noticeboard overviews outside the profile service context', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          genericType: GenericType.Noticeboard
        },
        navigationSourceStaticJsonName: 'homeService',
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Noticeboard
      })
    ).toEqual({
      authMode: AUTH_MODE_PUBLIC,
      currentMember: false
    });
  });

  it('maps explicit currentMember=true to user scope for member-owned noticeboard data', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          currentMember: true,
          genericType: GenericType.Noticeboard
        },
        navigationSourceStaticJsonName: 'homeService',
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Noticeboard
      })
    ).toEqual({
      authMode: AUTH_MODE_USER,
      currentMember: true
    });
  });

  it('falls back to user scope when the noticeboard is opened from the profile screen route', () => {
    expect(
      resolveNoticeboardScope({
        initialQueryVariables: {
          genericType: GenericType.Noticeboard
        },
        navigationSourceRouteName: ScreenName.Profile,
        query: QUERY_TYPES.GENERIC_ITEMS,
        rootRouteName: ScreenName.Noticeboard
      })
    ).toEqual({
      authMode: AUTH_MODE_USER,
      currentMember: true
    });
  });
});
