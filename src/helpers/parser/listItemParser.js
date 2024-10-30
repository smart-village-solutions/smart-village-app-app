import _filter from 'lodash/filter';
import _shuffle from 'lodash/shuffle';

import { consts, texts } from '../../config';
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
import { shareMessage } from '../shareHelper';
import { subtitle } from '../textHelper';

import { parseConsulData } from './consulParser';
import { parseSueData } from './sueParser';
import { parseVolunteerData } from './volunteerParser';
import { parseVouchersCategories, parseVouchersData } from './voucherParser';

const { ROOT_ROUTE_NAMES } = consts;

const GENERIC_TYPES_WITH_DATES = [
  GenericType.Commercial,
  GenericType.Deadline,
  GenericType.Job,
  GenericType.Noticeboard
];

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

const parseEventRecords = (data, skipLastDivider, withDate, withTime) => {
  return data?.map((eventRecord, index) => ({
    id: eventRecord.id,
    subtitle: subtitle(
      withDate ? eventDate(eventRecord.listDate) : undefined,
      eventRecord.addresses?.[0]?.addition || eventRecord.addresses?.[0]?.city,
      withTime ? eventRecord?.date?.timeFrom || eventRecord?.dates?.[0]?.timeFrom : undefined
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

const parseGenericItems = (data, skipLastDivider, consentForDataProcessingText) => {
  // this likely needs a rework in the future, but for now this is the place to filter items.
  const filteredData = data?.filter(filterGenericItems);

  return filteredData?.map((genericItem, index) => ({
    id: genericItem.id,
    subtitle:
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
    routeName:
      genericItem.genericType === GenericType.Noticeboard
        ? ScreenName.NoticeboardForm
        : ScreenName.Detail,
    params: {
      title: getGenericItemDetailTitle(genericItem.genericType),
      consentForDataProcessingText,
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
    subtitle: subtitle(momentFormatUtcToLocal(newsItem.publishedAt), newsItem.dataProvider?.name),
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

const parsePointOfInterest = (data, skipLastDivider, queryVariables = undefined) => {
  return data?.map((pointOfInterest, index) => ({
    id: pointOfInterest.id,
    title: pointOfInterest.title || pointOfInterest.name,
    subtitle: queryVariables?.category || pointOfInterest.category?.name,
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
    subtitle: tour.category?.name,
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
      usedAsInitialScreen: false,
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

/* eslint-disable complexity */

/**
 * Parses list items from query a query result
 * @param {string} query
 * @param {any} data
 * @param {string | undefined} titleDetail
 * @param {{
 *    bookmarkable?: boolean;
 *    consentForDataProcessingText?: string;
 *    skipLastDivider?: boolean;
 *    withDate?: boolean,
 *    withTime?: boolean,
 *    isSectioned?: boolean,
 *    queryVariables?: any,
 *    appDesignSystem?: any
 *    queryKey?: string
 *  }} options
 * @returns
 */
export const parseListItemsFromQuery = (query, data, titleDetail, options = {}) => {
  if (!data) return [];

  const {
    bookmarkable = true,
    consentForDataProcessingText,
    skipLastDivider = false,
    withDate = true,
    withTime = false,
    isSectioned = false,
    queryVariables,
    appDesignSystem
  } = options;

  switch (query) {
    case QUERY_TYPES.EVENT_RECORDS:
      return parseEventRecords(data[query], skipLastDivider, withDate, withTime);
    case QUERY_TYPES.GENERIC_ITEMS:
      return parseGenericItems(data[query], skipLastDivider, consentForDataProcessingText);
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

    // CONSUL
    case QUERY_TYPES.CONSUL.DEBATES:
    case QUERY_TYPES.CONSUL.PROPOSALS:
    case QUERY_TYPES.CONSUL.POLLS:
    case QUERY_TYPES.CONSUL.PUBLIC_DEBATES:
    case QUERY_TYPES.CONSUL.PUBLIC_PROPOSALS:
    case QUERY_TYPES.CONSUL.PUBLIC_COMMENTS:
      return parseConsulData(data[query], query, skipLastDivider);

    // SUE
    case QUERY_TYPES.SUE.REQUESTS:
    case QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID:
      return parseSueData(data, appDesignSystem);

    // VOLUNTEER
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL:
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY:
      return parseVolunteerData(
        data,
        QUERY_TYPES.VOLUNTEER.CALENDAR,
        skipLastDivider,
        withDate,
        isSectioned
      );
    case QUERY_TYPES.VOLUNTEER.GROUPS:
    case QUERY_TYPES.VOLUNTEER.GROUPS_MY:
      return parseVolunteerData(data, QUERY_TYPES.VOLUNTEER.GROUP, skipLastDivider);
    case QUERY_TYPES.VOLUNTEER.CONVERSATIONS:
      return parseVolunteerData(
        data,
        QUERY_TYPES.VOLUNTEER.CONVERSATION,
        skipLastDivider,
        withDate
      );
    case QUERY_TYPES.VOLUNTEER.MEMBERS:
    case QUERY_TYPES.VOLUNTEER.APPLICANTS:
    case QUERY_TYPES.VOLUNTEER.CALENDAR:
      return parseVolunteerData(
        data,
        QUERY_TYPES.VOLUNTEER.USER,
        skipLastDivider,
        undefined,
        undefined,
        queryVariables?.currentUserId
      );
    case QUERY_TYPES.VOLUNTEER.PROFILE:
      return parseVolunteerData(data, query, skipLastDivider);

    // VOUCHERS
    case QUERY_TYPES.VOUCHERS:
    case QUERY_TYPES.VOUCHERS_REDEEMED:
      return parseVouchersData(data[options.queryKey], skipLastDivider);
    case QUERY_TYPES.VOUCHERS_CATEGORIES:
      return parseVouchersCategories(data[QUERY_TYPES.GENERIC_ITEMS], skipLastDivider);
    default:
      return data;
  }
};
/* eslint-enable complexity */
