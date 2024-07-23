import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { momentFormatUtcToLocal } from '../momentHelper';
import { getTitleForQuery } from '../queryHelper';

const { ROOT_ROUTE_NAMES } = consts;

const querySwitcherForDetail = (query) => {
  switch (query) {
    case QUERY_TYPES.CONSUL.DEBATES:
    case QUERY_TYPES.CONSUL.PUBLIC_DEBATES:
      return QUERY_TYPES.CONSUL.DEBATE;
    case QUERY_TYPES.CONSUL.PROPOSALS:
    case QUERY_TYPES.CONSUL.PUBLIC_PROPOSALS:
      return QUERY_TYPES.CONSUL.PROPOSAL;
    case QUERY_TYPES.CONSUL.POLLS:
      return QUERY_TYPES.CONSUL.POLL;
    case QUERY_TYPES.CONSUL.PUBLIC_COMMENTS:
      return QUERY_TYPES.CONSUL.PUBLIC_COMMENT;
    default:
      return query;
  }
};

export const parseConsulData = (data, query, skipLastDivider) => {
  return data?.nodes?.map((consulData, index) => {
    let subtitle = momentFormatUtcToLocal(consulData.publicCreatedAt ?? consulData.createdAt);
    let title = consulData.title ?? consulData.body;

    if (query === QUERY_TYPES.CONSUL.PUBLIC_COMMENTS) {
      subtitle = consulData.commentableTitle;
    } else if (query === QUERY_TYPES.CONSUL.POLLS) {
      subtitle =
        momentFormatUtcToLocal(consulData.startsAt) +
        ' - ' +
        momentFormatUtcToLocal(consulData.endsAt);
    }

    if (query === QUERY_TYPES.CONSUL.PUBLIC_PROPOSALS && !consulData.published) {
      title = `${texts.consul.draft} - ${title}`;
    }

    return {
      id: consulData.id,
      title,
      createdAt: consulData.publicCreatedAt,
      cachedVotesUp: consulData.cachedVotesUp,
      subtitle,
      routeName: ScreenName.ConsulDetailScreen,
      published: consulData.published,
      params: {
        title: getTitleForQuery(query),
        query: querySwitcherForDetail(query),
        queryVariables: { id: consulData.id },
        rootRouteName: ROOT_ROUTE_NAMES.CONSOLE_HOME
      },
      bottomDivider: !skipLastDivider || index !== consulData.length - 1
    };
  });
};
