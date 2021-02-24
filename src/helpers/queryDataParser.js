import _filter from 'lodash/filter';
import _shuffle from 'lodash/shuffle';

import { consts, texts } from '../config';
import { QUERY_TYPES } from '../queries';
import { eventDate } from './dateTimeHelper';
import { mainImageOfMediaContents } from './imageHelper';
import { momentFormat } from './momentHelper';
import { shareMessage } from './shareHelper';
import { subtitle } from './textHelper';

const { ROOT_ROUTE_NAMES } = consts;

const parseEventRecords = (data, skipLastDivider) => {
  return data?.map((eventRecord, index) => ({
    id: eventRecord.id,
    subtitle: subtitle(
      eventDate(eventRecord.listDate),
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

const parseNewsItems = (data, skipLastDivider, titleDetail) => {
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
      title: titleDetail,
      categoryId: newsItem.categories?.[0]?.id,
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
    routeName: 'Index',
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

export const parseListItemsFromQuery = (query, data, skipLastDivider, titleDetail) => {
  if (!data) return;

  switch (query) {
    case QUERY_TYPES.EVENT_RECORDS:
      return parseEventRecords(data[query], skipLastDivider);
    case QUERY_TYPES.NEWS_ITEMS:
      return parseNewsItems(data[query], skipLastDivider, titleDetail);
    case QUERY_TYPES.POINTS_OF_INTEREST:
      return parsePointOfInterest(data[query], skipLastDivider);
    case QUERY_TYPES.TOURS:
      return parseTours(data[query], skipLastDivider);
    case QUERY_TYPES.CATEGORIES:
      return parseCategories(data[query], skipLastDivider);
    case QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS:
      return parsePointsOfInterestAndTours(data);
  }
};
