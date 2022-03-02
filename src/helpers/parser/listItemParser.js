import _filter from 'lodash/filter';
import _shuffle from 'lodash/shuffle';

import { consts, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { GenericType, ScreenName } from '../../types';
import { eventDate, isBeforeEndOfToday, isTodayOrLater } from '../dateTimeHelper';
import { getGenericItemDetailTitle, getGenericItemRootRouteName } from '../genericTypeHelper';
import { mainImageOfMediaContents } from '../imageHelper';
import { momentFormat } from '../momentHelper';
import { getTitleForQuery } from '../queryHelper';
import { shareMessage } from '../shareHelper';
import { subtitle } from '../textHelper';
import { volunteerSubtitle } from '../volunteerHelper';

const { ROOT_ROUTE_NAMES } = consts;

const GENERIC_TYPES_WITH_DATES = [GenericType.Job, GenericType.Commercial];

const filterGenericItems = (item) => {
  if (GENERIC_TYPES_WITH_DATES.includes(item?.genericType)) {
    const dateEnd = item?.dates?.[0]?.dateEnd;
    const hasNotEnded = dateEnd ? isTodayOrLater(dateEnd) : true;

    const publicationDate = item?.publicationDate;
    const isPublished = publicationDate ? isBeforeEndOfToday(publicationDate) : true;

    return hasNotEnded && isPublished;
  }
  return true;
};

const parseEventRecords = (data, skipLastDivider, withDate) => {
  return data?.map((eventRecord, index) => ({
    id: eventRecord.id,
    subtitle: subtitle(
      withDate ? eventDate(eventRecord.listDate) : undefined,
      eventRecord.addresses?.[0]?.addition || eventRecord.addresses?.[0]?.city
    ),
    title: eventRecord.title,
    picture: {
      url: mainImageOfMediaContents(eventRecord.mediaContents)
    },
    routeName: 'Detail',
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

const parseGenericItems = (data, skipLastDivider) => {
  // this likely needs a rework in the future, but for now this is the place to filter items.
  const filteredData = data?.filter(filterGenericItems);

  return filteredData?.map((genericItem, index) => ({
    id: genericItem.id,
    subtitle: subtitle(
      momentFormat(genericItem.publicationDate ?? genericItem.createdAt),
      genericItem.dataProvider?.name
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
    routeName: 'Detail',
    params: {
      title: getGenericItemDetailTitle(genericItem.genericType),
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
    subtitle: subtitle(momentFormat(newsItem.publishedAt), newsItem.dataProvider?.name),
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
    routeName: 'Detail',
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

const parsePointOfInterest = (data, skipLastDivider) => {
  return data?.map((pointOfInterest, index) => ({
    id: pointOfInterest.id,
    title: pointOfInterest.name,
    subtitle: pointOfInterest.category?.name,
    picture: {
      url: mainImageOfMediaContents(pointOfInterest.mediaContents)
    },
    routeName: 'Detail',
    params: {
      title: texts.detailTitles.pointOfInterest,
      query: QUERY_TYPES.POINT_OF_INTEREST,
      queryVariables: { id: `${pointOfInterest.id}` },
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
    subtitle: tour.category?.name,
    picture: {
      url: mainImageOfMediaContents(tour.mediaContents)
    },
    routeName: 'Detail',
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

const parseCategories = (data, skipLastDivider) => {
  return data?.map((category, index) => ({
    id: category.id,
    title: category.name,
    pointsOfInterestCount: category.pointsOfInterestCount,
    toursCount: category.toursCount,
    routeName: 'Category',
    params: {
      title: category.name,
      query:
        category.pointsOfInterestCount > 0 ? QUERY_TYPES.POINTS_OF_INTEREST : QUERY_TYPES.TOURS,
      queryVariables: { limit: 15, order: 'name_ASC', category: `${category.name}` },
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

const parseVolunteers = (data, query, skipLastDivider, withDate) => {
  return data?.map((volunteer, index) => ({
    id: volunteer.id,
    title: volunteer.title || volunteer.name,
    subtitle: volunteerSubtitle(volunteer, query, withDate),
    picture: volunteer.picture,
    routeName: ScreenName.VolunteerDetail,
    onPress: volunteer.onPress,
    listDate: volunteer.listDate,
    params: {
      title: getTitleForQuery(query, volunteer),
      query,
      queryVariables: { id: `${volunteer.id}` },
      rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
      shareContent: {
        message: shareMessage(
          {
            title: volunteer.title || volunteer.name,
            subtitle: volunteerSubtitle(volunteer, query, withDate)
          },
          query
        )
      },
      details: {
        description: volunteer.description,
        guid: volunteer.guid,
        id: volunteer.id,
        title: volunteer.title,
        name: volunteer.name
      }
    },
    bottomDivider: !skipLastDivider || index !== data.length - 1
  }));
};

/**
 * Parses list items from query a query result
 * @param {string} query
 * @param {any} data
 * @param {string | undefined} titleDetail
 * @param {{ bookmarkable?: boolean; skipLastDivider?: boolean; withDate?: boolean }} options
 * @returns
 */
// eslint-disable-next-line complexity
export const parseListItemsFromQuery = (query, data, titleDetail, options = {}) => {
  if (!data) return;

  const { bookmarkable = true, skipLastDivider = false, withDate = true } = options;

  switch (query) {
    case QUERY_TYPES.EVENT_RECORDS:
      return parseEventRecords(data[query], skipLastDivider, withDate);
    case QUERY_TYPES.GENERIC_ITEMS:
      return parseGenericItems(data[query], skipLastDivider);
    case QUERY_TYPES.NEWS_ITEMS:
      return parseNewsItems(data[query], skipLastDivider, titleDetail, bookmarkable);
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return parsePointOfInterest(data[query], skipLastDivider);
    case QUERY_TYPES.TOURS:
      return parseTours(data[query], skipLastDivider);
    case QUERY_TYPES.CATEGORIES:
      return parseCategories(data[query], skipLastDivider);
    case QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS:
      return parsePointsOfInterestAndTours(data);
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL:
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY:
      return parseVolunteers(data, QUERY_TYPES.VOLUNTEER.CALENDAR, skipLastDivider, withDate);
    case QUERY_TYPES.VOLUNTEER.GROUPS:
    case QUERY_TYPES.VOLUNTEER.GROUPS_MY:
      return parseVolunteers(data, QUERY_TYPES.VOLUNTEER.GROUP, skipLastDivider);
    case QUERY_TYPES.VOLUNTEER.CONVERSATIONS:
      return parseVolunteers(data, QUERY_TYPES.VOLUNTEER.CONVERSATION, skipLastDivider, withDate);
    case QUERY_TYPES.VOLUNTEER.TASKS:
    case QUERY_TYPES.VOLUNTEER.ADDITIONAL:
    case QUERY_TYPES.VOLUNTEER.PROFILE:
      return parseVolunteers(data, query, skipLastDivider);
  }
};
