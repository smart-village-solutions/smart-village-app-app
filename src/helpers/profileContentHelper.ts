import { consts, texts } from '../config';
import { QUERY_TYPES } from '../queries/types';
import { ScreenName } from '../types';

import { eventDate } from './dateTimeHelper';
import { mainImageOfMediaContents } from './imageHelper';
import { momentFormatUtcToLocal } from './momentHelper';
import { subtitle } from './textHelper';

type ProfileContentData = {
  eventRecords?: ProfileContentRecord[];
  newsItems?: ProfileContentRecord[];
  pointsOfInterest?: ProfileContentRecord[];
};

type ProfileContentRecord = {
  addresses?: Array<{ addition?: string; city?: string }>;
  category?: { name?: string };
  contentBlocks?: Array<{ mediaContents?: unknown[]; title?: string }>;
  createdAt?: string;
  created_at?: string;
  date?: { timeFrom?: string };
  dates?: Array<{ timeFrom?: string }>;
  id?: string | number;
  listDate?: string;
  mediaContents?: unknown[];
  name?: string;
  publishedAt?: string;
  published_at?: string;
  title?: string;
  updatedAt?: string;
  updated_at?: string;
};

type ProfileContentListItem = {
  addresses?: Array<Record<string, unknown>>;
  bottomDivider?: boolean;
  id?: string | number;
  listDate?: string;
  overtitle?: string;
  picture?: { url?: string };
  params?: {
    details?: ProfileContentRecord;
    query?: string;
    queryVariables?: Record<string, string>;
    rootRouteName?: string;
    title?: string;
  };
  routeName?: ScreenName;
  subtitle?: string;
  title?: string;
};

type ProfileContentSection = {
  data: ProfileContentListItem[];
  key: string;
  query: string;
  title: string;
};

const { ROOT_ROUTE_NAMES } = consts;

const getContentTimestamp = (item: ProfileContentListItem) => {
  const details = item.params?.details || {};
  const timestamp =
    details.updatedAt ||
    details.updated_at ||
    details.publishedAt ||
    details.published_at ||
    details.createdAt ||
    details.created_at ||
    details.listDate;

  return timestamp ? new Date(timestamp).getTime() : 0;
};

const createDetailParams = (
  query: string,
  title: string,
  rootRouteName: string,
  details: ProfileContentRecord
) => ({
  title,
  query,
  queryVariables: { id: `${details.id}` },
  rootRouteName,
  details
});

const mapNewsItem = (newsItem: ProfileContentRecord): ProfileContentListItem => ({
  id: newsItem.id,
  overtitle: newsItem.dataProvider?.name,
  subtitle: momentFormatUtcToLocal(newsItem.publishedAt),
  title: newsItem.contentBlocks?.[0]?.title || newsItem.title,
  picture: {
    url: mainImageOfMediaContents(newsItem.contentBlocks?.[0]?.mediaContents)
  },
  routeName: ScreenName.Detail,
  params: createDetailParams(
    QUERY_TYPES.NEWS_ITEM,
    texts.detailTitles.newsItem,
    ROOT_ROUTE_NAMES.NEWS_ITEMS,
    newsItem
  )
});

const mapPointOfInterest = (pointOfInterest: ProfileContentRecord): ProfileContentListItem => ({
  id: pointOfInterest.id,
  title: pointOfInterest.title || pointOfInterest.name,
  overtitle: pointOfInterest.category?.name,
  picture: {
    url: mainImageOfMediaContents(pointOfInterest.mediaContents)
  },
  addresses: pointOfInterest.addresses,
  routeName: ScreenName.Detail,
  params: createDetailParams(
    QUERY_TYPES.POINT_OF_INTEREST,
    texts.detailTitles.pointOfInterest,
    ROOT_ROUTE_NAMES.POINTS_OF_INTEREST_AND_TOURS,
    {
      ...pointOfInterest,
      title: pointOfInterest.name
    }
  )
});

const mapEventRecord = (eventRecord: ProfileContentRecord): ProfileContentListItem => ({
  id: eventRecord.id,
  subtitle: subtitle(
    eventDate(eventRecord.listDate),
    eventRecord.addresses?.[0]?.addition || eventRecord.addresses?.[0]?.city,
    eventRecord?.date?.timeFrom || eventRecord?.dates?.[0]?.timeFrom
  ),
  addresses: eventRecord.addresses,
  title: eventRecord.title,
  picture: {
    url: mainImageOfMediaContents(eventRecord.mediaContents)
  },
  listDate: eventRecord.listDate,
  routeName: ScreenName.Detail,
  params: createDetailParams(
    QUERY_TYPES.EVENT_RECORD,
    texts.detailTitles.eventRecord,
    ROOT_ROUTE_NAMES.EVENT_RECORDS,
    eventRecord
  )
});

const PROFILE_CONTENT_SECTIONS = [
  {
    itemsKey: 'eventRecords',
    title: texts.eventRecord.appointments,
    query: QUERY_TYPES.EVENT_RECORDS,
    mapper: mapEventRecord
  },
  {
    itemsKey: 'newsItems',
    title: texts.profile.myContentNews,
    query: QUERY_TYPES.NEWS_ITEMS,
    mapper: mapNewsItem
  },
  {
    itemsKey: 'pointsOfInterest',
    title: texts.categoryTitles.pointsOfInterest,
    query: QUERY_TYPES.POINTS_OF_INTEREST,
    mapper: mapPointOfInterest
  }
] as const;

export const buildProfileContentListItems = ({
  eventRecords = [],
  newsItems = [],
  pointsOfInterest = []
}: ProfileContentData): ProfileContentListItem[] => {
  const parsedItems = [
    ...newsItems.map(mapNewsItem),
    ...pointsOfInterest.map(mapPointOfInterest),
    ...eventRecords.map(mapEventRecord)
  ];

  return parsedItems
    .sort((a, b) => getContentTimestamp(b) - getContentTimestamp(a))
    .map((item, index, items) => ({
      ...item,
      bottomDivider: index !== items.length - 1
    }));
};

export const buildProfileContentSectionedList = (data: ProfileContentData) => {
  const sectionedData: Array<string | ProfileContentListItem> = [];

  PROFILE_CONTENT_SECTIONS.forEach(({ itemsKey, mapper, title }) => {
    const sectionItems = (data[itemsKey] || [])
      .map(mapper)
      .sort((a, b) => getContentTimestamp(b) - getContentTimestamp(a))
      .map((item, index, items) => ({
        ...item,
        bottomDivider: index !== items.length - 1
      }));

    if (!sectionItems.length) return;

    sectionedData.push(title);
    sectionedData.push(...sectionItems);
  });

  return {
    listItems: sectionedData,
    stickyHeaderIndices: sectionedData
      .map((item, index) => (typeof item === 'string' ? index : null))
      .filter((item): item is number => item !== null)
  };
};

export const buildProfileContentSections = (data: ProfileContentData): ProfileContentSection[] =>
  PROFILE_CONTENT_SECTIONS.map(({ itemsKey, mapper, query, title }) => {
    const sectionItems = (data[itemsKey] || [])
      .map(mapper)
      .sort((a, b) => getContentTimestamp(b) - getContentTimestamp(a))
      .map((item, index, items) => ({
        ...item,
        bottomDivider: index !== items.length - 1
      }));

    return {
      data: sectionItems,
      key: itemsKey,
      query,
      title
    };
  }).filter(({ data: sectionItems }) => !!sectionItems.length);
