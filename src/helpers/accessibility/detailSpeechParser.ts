import { texts } from '../../config';
import { momentFormatUtcToLocal } from '../momentHelper';
import { QUERY_TYPES } from '../../queries';
import { GenericType } from '../../types';

import { normalizeSpeechText } from './speechTextFormatter';

type DetailRecord = Record<string, unknown>;

export type DetailSpeechItem = {
  id: string;
  text: string;
};

type DetailSpeechParseParams = {
  detail: DetailRecord;
  query: string;
};

const asRecord = (value: unknown): DetailRecord | undefined =>
  value && typeof value === 'object' ? (value as DetailRecord) : undefined;

const asRecordArray = (value: unknown): DetailRecord[] => {
  if (!Array.isArray(value)) return [];
  return value.map(asRecord).filter(Boolean) as DetailRecord[];
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const normalizeText = (value?: string) => {
  return normalizeSpeechText(value);
};

const pushText = (items: DetailSpeechItem[], id: string, value?: string) => {
  const normalized = normalizeText(value);
  if (!normalized) return;
  items.push({ id, text: normalized });
};

const joinAddress = (address: DetailRecord) =>
  [
    asString(address.street),
    asString(address.houseNumber),
    asString(address.zip),
    asString(address.city)
  ]
    .filter(Boolean)
    .join(' ');

const joinContact = (contact: DetailRecord) =>
  [
    asString(contact.firstName),
    asString(contact.lastName),
    asString(contact.phone),
    asString(contact.mobile),
    asString(contact.email),
    asString(contact.fax)
  ]
    .filter(Boolean)
    .join(' ');

const parseContentBlocks = (items: DetailSpeechItem[], contentBlocks: unknown) => {
  asRecordArray(contentBlocks).forEach((block, index) => {
    pushText(items, `contentBlockTitle-${index}`, asString(block.title));
    pushText(items, `contentBlockBody-${index}`, asString(block.body));
  });
};

const parseNewsItem = (items: DetailSpeechItem[], detail: DetailRecord) => {
  const contentBlocks = asRecordArray(detail.contentBlocks);
  const firstContentBlock = contentBlocks[0];
  const dataProvider = asRecord(detail.dataProvider);
  const spokenTitle = asString(detail.mainTitle) || asString(firstContentBlock?.title);

  pushText(items, 'title', spokenTitle);
  pushText(items, 'subtitle', asString(dataProvider?.name));
  pushText(items, 'publishedAt', momentFormatUtcToLocal(asString(detail.publishedAt)));

  contentBlocks.forEach((block, index) => {
    const blockTitle = asString(block.title);

    if (!(index === 0 && blockTitle === spokenTitle)) {
      pushText(items, `contentBlockTitle-${index}`, blockTitle);
    }

    pushText(items, `contentBlockIntro-${index}`, asString(block.intro));
    pushText(items, `contentBlockBody-${index}`, asString(block.body));
  });
};

const parseEventRecord = (items: DetailSpeechItem[], detail: DetailRecord) => {
  const category = asRecord(detail.category);

  pushText(items, 'title', asString(detail.title));
  pushText(items, 'category', asString(category?.name));
  pushText(items, 'description', asString(detail.description));

  asRecordArray(detail.addresses).forEach((address, index) =>
    pushText(items, `address-${index}`, joinAddress(address))
  );

  asRecordArray(detail.contacts).forEach((contact, index) =>
    pushText(items, `contact-${index}`, joinContact(contact))
  );
};

const parsePointOfInterest = (items: DetailSpeechItem[], detail: DetailRecord) => {
  const category = asRecord(detail.category);

  pushText(items, 'title', asString(detail.title));
  pushText(items, 'category', asString(category?.name));
  pushText(items, 'description', asString(detail.description));

  asRecordArray(detail.addresses).forEach((address, index) =>
    pushText(items, `address-${index}`, joinAddress(address))
  );
};

const parseTour = (items: DetailSpeechItem[], detail: DetailRecord) => {
  const category = asRecord(detail.category);

  pushText(items, 'title', asString(detail.title));
  pushText(items, 'category', asString(category?.name));
  pushText(items, 'description', asString(detail.description));

  asRecordArray(detail.tourStops).forEach((tourStop, index) => {
    pushText(items, `tourStopTitle-${index}`, asString(tourStop.title));
    pushText(items, `tourStopDescription-${index}`, asString(tourStop.description));
  });
};

const parseOffer = (items: DetailSpeechItem[], detail: DetailRecord) => {
  const firstCategory = asRecordArray(detail.categories)[0];
  const payload = asRecord(detail.payload);

  pushText(items, 'title', asString(detail.title));
  pushText(items, 'category', asString(firstCategory?.name));
  pushText(items, 'employmentType', asString(payload?.employmentType));
  pushText(items, 'publishedAt', asString(detail.publicationDate));
  parseContentBlocks(items, detail.contentBlocks);
};

const parseNoticeboard = (items: DetailSpeechItem[], detail: DetailRecord) => {
  const firstCategory = asRecordArray(detail.categories)[0];
  const payload = asRecord(detail.payload);

  pushText(items, 'title', asString(detail.title));
  pushText(items, 'category', asString(firstCategory?.name));
  parseContentBlocks(items, detail.contentBlocks);
  pushText(items, 'comments', asString(payload?.comments));
  pushText(items, 'departureAddress', asString(payload?.departureAddress));
  pushText(items, 'destinationAddress', asString(payload?.destinationAddress));
};

export const getDetailSpeechItems = ({
  detail,
  query
}: DetailSpeechParseParams): DetailSpeechItem[] => {
  if (!detail || typeof detail !== 'object') return [];

  const items: DetailSpeechItem[] = [];

  switch (query) {
    case QUERY_TYPES.NEWS_ITEM:
      parseNewsItem(items, detail);
      break;
    case QUERY_TYPES.EVENT_RECORD:
      parseEventRecord(items, detail);
      break;
    case QUERY_TYPES.POINT_OF_INTEREST:
      parsePointOfInterest(items, detail);
      break;
    case QUERY_TYPES.TOUR:
      parseTour(items, detail);
      break;
    case QUERY_TYPES.GENERIC_ITEM:
      if (detail.genericType === GenericType.Noticeboard) {
        parseNoticeboard(items, detail);
      } else {
        parseOffer(items, detail);
      }
      break;
    default:
      break;
  }

  return items;
};
