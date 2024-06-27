import _filter from 'lodash/filter';
import _shuffle from 'lodash/shuffle';
import React from 'react';
import { StyleSheet } from 'react-native';

import { VolunteerAvatar } from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { GenericType, ScreenName } from '../../types';
import { eventDate, isBeforeEndOfToday, isTodayOrLater } from '../dateTimeHelper';
import {
  getGenericItemDetailTitle,
  getGenericItemRootRouteName,
  getGenericItemSubtitle
} from '../genericTypeHelper';
import { mainImageOfMediaContents } from '../imageHelper';
import { momentFormatUtcToLocal } from '../momentHelper';
import { getTitleForQuery } from '../queryHelper';
import { shareMessage } from '../shareHelper';
import { subtitle } from '../textHelper';
import { volunteerListDate, volunteerSubtitle } from '../volunteerHelper';

const { ROOT_ROUTE_NAMES } = consts;

const GENERIC_TYPES_WITH_DATES = [
  GenericType.Commercial,
  GenericType.Deadline,
  GenericType.Job,
  GenericType.Noticeboard
];

export const filterGenericItems = (item) => {
  if (GENERIC_TYPES_WITH_DATES.includes(item?.genericType)) {
    const dateEnd = item?.dates?.[0]?.dateEnd;
    const hasNotEnded = dateEnd ? isTodayOrLater(dateEnd) : true;

    const publicationDate = item?.publicationDate;
    const isPublished = publicationDate ? isBeforeEndOfToday(publicationDate) : true;

    return hasNotEnded && isPublished;
  }

  return true;
};

const parseEventRecords = (data, skipLastDivider, withDate, withTime) => {
  return data?.map((eventRecord, index) => ({
    id: eventRecord.id,
    overtitle: subtitle(
      withDate ? eventDate(eventRecord.listDate) : undefined,
      eventRecord.addresses?.[0]?.addition || eventRecord.addresses?.[0]?.city,
      withTime ? eventRecord?.dates?.[0]?.timeFrom : undefined
    ),
    title: eventRecord.title,
    picture: {
      url: mainImageOfMediaContents(eventRecord.mediaContents)
    },
    listDate: eventRecord.listDate,
    routeName: ScreenName.Detail,
    params: {
      title: texts.detailTitles.eventRecord,
      query: QUERY_TYPES.EVENT_RECORD,
      queryVariables: { id: `${eventRecord.id}` },
      rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS,
      shareContent: {
        message: shareMessage(eventRecord, QUERY_TYPES.EVENT_RECORD)
      },
      details: eventRecord
    },
    bottomDivider: !skipLastDivider || index !== data.length - 1
  }));
};

const parseGenericItems = (data, skipLastDivider, queryVariables, subQuery) => {
  // this likely needs a rework in the future, but for now this is the place to filter items.
  const filteredData = data?.filter(filterGenericItems);

  return filteredData?.map((genericItem, index) => ({
    id: genericItem.id,
    categories: genericItem.categories,
    overtitle:
      genericItem.genericType !== GenericType.Deadline &&
      subtitle(
        momentFormatUtcToLocal(genericItem.publicationDate ?? genericItem.createdAt),
        getGenericItemSubtitle(genericItem)
      ),
    title: genericItem.title,
    picture: {
      url:
        genericItem.contentBlocks?.[0]?.mediaContents?.length &&
        _filter(
          genericItem.contentBlocks[0].mediaContents,
          (mediaContent) =>
            mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
        )[0]?.sourceUrl?.url
    },
    routeName: ScreenName.Detail,
    params: {
      title: getGenericItemDetailTitle(
        genericItem.genericType,
        queryVariables,
        genericItem?.categories?.[0]?.name
      ),
      subQuery,
      suffix: genericItem.genericType,
      query: QUERY_TYPES.GENERIC_ITEM,
      queryVariables: { id: `${genericItem.id}` },
      rootRouteName: getGenericItemRootRouteName(genericItem.genericType),
      shareContent: {
        message: shareMessage(genericItem, QUERY_TYPES.GENERIC_ITEM)
      },
      details: genericItem
    },
    bottomDivider: !skipLastDivider || index !== filteredData.length - 1
  }));
};

const parseNewsItems = (data, skipLastDivider, titleDetail, bookmarkable) => {
  return data?.map((newsItem, index) => ({
    id: newsItem.id,
    overtitle: subtitle(momentFormatUtcToLocal(newsItem.publishedAt), newsItem.dataProvider?.name),
    title: newsItem.contentBlocks?.[0]?.title,
    picture: {
      url:
        newsItem.contentBlocks?.[0]?.mediaContents?.length &&
        _filter(
          newsItem.contentBlocks[0].mediaContents,
          (mediaContent) =>
            mediaContent.contentType === 'image' || mediaContent.contentType === 'thumbnail'
        )[0]?.sourceUrl?.url
    },
    routeName: ScreenName.Detail,
    params: {
      bookmarkable,
      title: titleDetail,
      suffix: newsItem.categories?.[0]?.id,
      query: QUERY_TYPES.NEWS_ITEM,
      queryVariables: { id: `${newsItem.id}` },
      rootRouteName: ROOT_ROUTE_NAMES.NEWS_ITEMS,
      shareContent: {
        message: shareMessage(newsItem, QUERY_TYPES.NEWS_ITEM)
      },
      details: newsItem
    },
    bottomDivider: !skipLastDivider || index !== data.length - 1
  }));
};

const parsePointOfInterest = (data, skipLastDivider = false, queryVariables = undefined) => {
  return data?.map((pointOfInterest, index) => ({
    iconName: pointOfInterest.category?.iconName?.length
      ? pointOfInterest.category.iconName
      : undefined,
    id: pointOfInterest.id,
    title: pointOfInterest.title || pointOfInterest.name,
    overtitle: pointOfInterest.category?.name,
    picture: {
      url: mainImageOfMediaContents(pointOfInterest.mediaContents)
    },
    routeName: ScreenName.Detail,
    params: {
      title: texts.detailTitles.pointOfInterest,
      query: QUERY_TYPES.POINT_OF_INTEREST,
      queryVariables: { id: `${pointOfInterest.id}`, categoryName: queryVariables?.category },
      rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS,
      shareContent: {
        message: shareMessage(pointOfInterest, QUERY_TYPES.POINT_OF_INTEREST)
      },
      details: {
        ...pointOfInterest,
        title: pointOfInterest.name
      }
    },
    bottomDivider: !skipLastDivider || index !== data.length - 1
  }));
};

const parseTours = (data, skipLastDivider) => {
  return data?.map((tour, index) => ({
    id: tour.id,
    title: tour.name,
    overtitle: tour.category?.name,
    picture: {
      url: mainImageOfMediaContents(tour.mediaContents)
    },
    routeName: ScreenName.Detail,
    params: {
      title: texts.detailTitles.tour,
      query: QUERY_TYPES.TOUR,
      queryVariables: { id: `${tour.id}` },
      rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS,
      shareContent: {
        message: shareMessage(tour, QUERY_TYPES.TOUR)
      },
      details: {
        ...tour,
        title: tour.name
      }
    },
    bottomDivider: !skipLastDivider || index !== data.length - 1
  }));
};

const parseCategories = (data, skipLastDivider, routeName, queryVariables) => {
  return data?.map((category, index) => ({
    id: category.id,
    iconName: category.iconName?.length ? category.iconName : undefined,
    title: category.name,
    pointsOfInterestCount: category.pointsOfInterestCount,
    pointsOfInterestTreeCount: category.pointsOfInterestTreeCount,
    toursCount: category.toursCount,
    toursTreeCount: category.toursTreeCount,
    routeName,
    parent: category.parent,
    params: {
      title: category.name,
      categories: parseCategories(
        category.children,
        skipLastDivider,
        ScreenName.Index,
        queryVariables
      ),
      query:
        category.pointsOfInterestTreeCount > 0 ? QUERY_TYPES.POINTS_OF_INTEREST : QUERY_TYPES.TOURS,
      queryVariables: {
        limit: 15,
        order: 'name_ASC',
        category: `${category.name}`,
        location: queryVariables?.location
      },
      rootRouteName: ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS
    },
    bottomDivider: !skipLastDivider || index !== data.length - 1
  }));
};

const parsePointsOfInterestAndTours = (data) => {
  const pointsOfInterest = parsePointOfInterest(data?.[QUERY_TYPES.POINTS_OF_INTEREST]);
  const tours = parseTours(data?.[QUERY_TYPES.TOURS]);

  return _shuffle([...(pointsOfInterest || []), ...(tours || [])]);
};

const parseConversations = (data) =>
  data?.map((conversation, index) => ({
    ...conversation,
    bottomDivider: index !== data.length - 1,
    createdAt: conversation.latestMessage?.createdAt,
    genericItemId: conversation.conversationableId,
    params: {
      query: QUERY_TYPES.PROFILE.GET_MESSAGES,
      queryVariables: conversation,
      rootRouteName: ROOT_ROUTE_NAMES.CONVERSATIONS,
      title: texts.detailTitles.conversation
    },
    routeName: ScreenName.ProfileMessaging,
    subtitle: conversation.latestMessage?.messageText
  }));

/* eslint-disable complexity */
const parseVolunteers = (data, query, skipLastDivider, withDate, isSectioned, currentUserId) => {
  return data?.map((volunteer, index) => {
    let badge, leftIcon, statustitle, statustitleIcon, teaserTitle;

    if (query === QUERY_TYPES.VOLUNTEER.USER) {
      if ((volunteer.user?.id || volunteer.id) == currentUserId) {
        badge = {
          value: texts.volunteer.myProfile,
          textStyle: {
            color: colors.lightestText
          },
          badgeStyle: {
            backgroundColor: colors.primary
          }
        };
      }

      leftIcon = <VolunteerAvatar item={volunteer.user ? volunteer : { user: volunteer }} />;
    }

    if (query === QUERY_TYPES.VOLUNTEER.GROUP && !!volunteer.role) {
      statustitle = texts.volunteer[volunteer.role];
      statustitleIcon = (
        <Icon.Member
          color={colors.placeholder}
          size={normalize(13)}
          style={styles.statustitleIcon}
        />
      );
    }

    if (query === QUERY_TYPES.VOLUNTEER.GROUP) {
      teaserTitle = volunteer.description;
    }

    if (query === QUERY_TYPES.VOLUNTEER.CALENDAR) {
      teaserTitle = volunteer.content?.topics?.map((topic) => topic.name).join(', ');
    }

    return {
      ...volunteer,
      id: volunteer.id || volunteer.user?.id,
      title:
        volunteer.title || volunteer.name || volunteer.display_name || volunteer.user?.display_name,
      subtitle: volunteer.subtitle || volunteerSubtitle(volunteer, query, withDate, isSectioned),
      badge: volunteer.badge || badge,
      statustitle: volunteer.statustitle || statustitle,
      statustitleIcon: volunteer.statustitleIcon || statustitleIcon,
      leftIcon,
      teaserTitle,
      picture: volunteer.picture,
      routeName: ScreenName.VolunteerDetail,
      onPress: volunteer.onPress,
      listDate: volunteer.listDate || volunteerListDate(volunteer),
      status: volunteer.status,
      params: {
        title: getTitleForQuery(query, volunteer),
        query,
        queryVariables: { id: volunteer.user?.id ? `${volunteer.user.id}` : `${volunteer.id}` },
        queryOptions: query === QUERY_TYPES.VOLUNTEER.CONVERSATION && {
          refetchInterval: 1000
        },
        rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
        shareContent: query !== QUERY_TYPES.VOLUNTEER.CONVERSATION && {
          message: shareMessage(
            {
              title: volunteer.title || volunteer.name,
              subtitle:
                volunteer.subtitle || volunteerSubtitle(volunteer, query, withDate, isSectioned)
            },
            query
          )
        },
        details: volunteer
      },
      bottomDivider: !skipLastDivider || index !== data.length - 1
    };
  });
};
/* eslint-enable complexity */

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

const parseConsulData = (data, query, skipLastDivider) => {
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

/* eslint-disable complexity */
/**
 * Parses list items from query a query result
 * @param {string} query
 * @param {any} data
 * @param {string | undefined} titleDetail
 * @param {{
 *    bookmarkable?: boolean;
 *    skipLastDivider?: boolean;
 *    withDate?: boolean,
 *    withTime?: boolean,
 *    isSectioned?: boolean,
 *    queryVariables?: any,
 *    subQuery?: any
 *  }} options
 * @returns
 */
// eslint-disable-next-line complexity
export const parseListItemsFromQuery = (query, data, titleDetail, options = {}) => {
  if (!data) return [];

  const {
    bookmarkable = true,
    skipLastDivider = false,
    withDate = true,
    withTime = false,
    isSectioned = false,
    queryVariables,
    subQuery
  } = options;

  switch (query) {
    case QUERY_TYPES.EVENT_RECORDS:
      return parseEventRecords(data[query], skipLastDivider, withDate, withTime);
    case QUERY_TYPES.GENERIC_ITEMS:
      return parseGenericItems(data[query], skipLastDivider, queryVariables, subQuery);
    case QUERY_TYPES.NEWS_ITEMS:
      return parseNewsItems(data[query], skipLastDivider, titleDetail, bookmarkable);
    case QUERY_TYPES.POINT_OF_INTEREST:
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return parsePointOfInterest(data[query], skipLastDivider, queryVariables);
    case QUERY_TYPES.TOURS:
      return parseTours(data[query], skipLastDivider);
    case QUERY_TYPES.CATEGORIES:
      return parseCategories(data[query], skipLastDivider, ScreenName.Category, queryVariables);
    case QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS:
      return parsePointsOfInterestAndTours(data);
    case QUERY_TYPES.PROFILE.GET_CONVERSATIONS:
      return parseConversations(data[query]);
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL:
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY:
      return parseVolunteers(
        data,
        QUERY_TYPES.VOLUNTEER.CALENDAR,
        skipLastDivider,
        withDate,
        isSectioned
      );
    case QUERY_TYPES.VOLUNTEER.GROUPS:
    case QUERY_TYPES.VOLUNTEER.GROUPS_MY:
      return parseVolunteers(data, QUERY_TYPES.VOLUNTEER.GROUP, skipLastDivider);
    case QUERY_TYPES.VOLUNTEER.CONVERSATIONS:
      return parseVolunteers(data, QUERY_TYPES.VOLUNTEER.CONVERSATION, skipLastDivider, withDate);
    case QUERY_TYPES.VOLUNTEER.MEMBERS:
    case QUERY_TYPES.VOLUNTEER.APPLICANTS:
    case QUERY_TYPES.VOLUNTEER.CALENDAR:
      return parseVolunteers(
        data,
        QUERY_TYPES.VOLUNTEER.USER,
        skipLastDivider,
        undefined,
        undefined,
        queryVariables?.currentUserId
      );
    case QUERY_TYPES.VOLUNTEER.PROFILE:
      return parseVolunteers(data, query, skipLastDivider);
    case QUERY_TYPES.CONSUL.DEBATES:
    case QUERY_TYPES.CONSUL.PROPOSALS:
    case QUERY_TYPES.CONSUL.POLLS:
    case QUERY_TYPES.CONSUL.PUBLIC_DEBATES:
    case QUERY_TYPES.CONSUL.PUBLIC_PROPOSALS:
    case QUERY_TYPES.CONSUL.PUBLIC_COMMENTS:
      return parseConsulData(data[query], query, skipLastDivider);
    default:
      return data;
  }
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  statustitleIcon: {
    marginRight: normalize(7),
    marginTop: normalize(1)
  }
});
