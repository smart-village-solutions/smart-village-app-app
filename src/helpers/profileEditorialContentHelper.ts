import { QUERY_TYPES } from '../queries/types';
import { GenericType, ProfileRoles, ScreenName } from '../types';

type ServiceTileLike = {
  params?: {
    genericType?: string;
    queryVariables?: {
      genericType?: string;
    };
    query?: string;
  };
  routeName?: string;
  title?: string;
};

const PROFILE_EDITORIAL_ROUTE_NAMES = [
  ScreenName.ProfileContent,
  ScreenName.ProfileCreateContentHome
];

const EDITORIAL_QUERY_ROLE_MAP = {
  eventRecord: 'role_event_record',
  eventRecords: 'role_event_record',
  newsItem: 'role_news_item',
  newsItems: 'role_news_item',
  pointOfInterest: 'role_point_of_interest'
} as const;

const EDITORIAL_QUERIES = Object.keys(EDITORIAL_QUERY_ROLE_MAP);

const isNoticeboardTile = (tile: ServiceTileLike) =>
  tile.params?.query === 'noticeboard' ||
  tile.routeName === ScreenName.NoticeboardForm ||
  tile.title === 'Anzeige' ||
  (tile.params?.query === QUERY_TYPES.GENERIC_ITEMS &&
    tile.params?.queryVariables?.genericType === GenericType.Noticeboard) ||
  tile.params?.genericType === GenericType.Noticeboard;

export const hasEditorialRoles = (roles?: ProfileRoles) =>
  EDITORIAL_QUERIES.some((query) => {
    const roleKey = EDITORIAL_QUERY_ROLE_MAP[query as keyof typeof EDITORIAL_QUERY_ROLE_MAP];

    return !!roles?.[roleKey];
  });

export const filterCreateContentTilesByRoles = <T extends ServiceTileLike>(
  tiles: T[] = [],
  roles?: ProfileRoles
) =>
  tiles.filter((tile) => {
    const query = tile.params?.query;

    if (!EDITORIAL_QUERIES.includes(query || '')) {
      return true;
    }

    if (!roles) {
      return true;
    }

    const roleKey = EDITORIAL_QUERY_ROLE_MAP[query as keyof typeof EDITORIAL_QUERY_ROLE_MAP];

    return !!roles[roleKey];
  });

export const groupCreateContentTiles = <T extends ServiceTileLike>(
  tiles: T[] = [],
  roles?: ProfileRoles
) => {
  const filteredTiles = filterCreateContentTilesByRoles(tiles, roles);

  return {
    noticeboardTiles: filteredTiles.filter(isNoticeboardTile),
    editorialTiles: filteredTiles.filter((tile) =>
      EDITORIAL_QUERIES.includes(tile.params?.query || '')
    )
  };
};

export const filterProfileEditorialTiles = <T extends ServiceTileLike>(
  tiles: T[] = [],
  roles?: ProfileRoles
) => {
  if (!roles || hasEditorialRoles(roles)) {
    return tiles;
  }

  return tiles.filter(
    (tile) =>
      !tile.routeName || !PROFILE_EDITORIAL_ROUTE_NAMES.includes(tile.routeName as ScreenName)
  );
};
