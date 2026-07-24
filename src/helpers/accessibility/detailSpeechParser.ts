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

const asDisplayString = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return;

  const text = `${value}`.trim();

  if (!text || text === 'null' || text === 'undefined') return;

  return text;
};

const normalizeText = (value?: string) => {
  return normalizeSpeechText(value);
};

const withLabel = (label: string, value?: string) => (value ? `${label}: ${value}` : undefined);

const formatRegistrationRequired = (value: unknown) => {
  const text = asDisplayString(value);

  if (!text) return;
  if (text === 'true') return texts.participationProject.yes;
  if (text === 'false') return texts.participationProject.no;

  return text;
};

const pushText = (items: DetailSpeechItem[], id: string, value?: string) => {
  const normalized = normalizeText(value);
  if (!normalized) return;
  items.push({ id, text: normalized });
};

const joinAddress = (address?: DetailRecord) =>
  [
    asString(address?.street),
    asString(address?.houseNumber),
    asString(address?.zip),
    asString(address?.city)
  ]
    .filter(Boolean)
    .join(' ');

const joinContact = (contact?: DetailRecord) =>
  [
    asString(contact?.firstName),
    asString(contact?.lastName),
    asString(contact?.phone),
    asString(contact?.mobile),
    asString(contact?.email),
    asString(contact?.fax)
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

const parseParticipationProject = (items: DetailSpeechItem[], detail: DetailRecord) => {
  const dataProvider = asRecord(detail.dataProvider);
  const payload = asRecord(detail.payload);
  const firstDate = asRecordArray(detail.dates)[0];
  const firstAddress = asRecordArray(detail.addresses)[0];
  const firstContact = asRecordArray(detail.contacts)[0];
  const firstLocation = asRecordArray(detail.locations)[0];
  const tags = Array.isArray(payload?.tags)
    ? payload.tags.map(asDisplayString).filter(Boolean).join(', ')
    : asDisplayString(payload?.tags);

  pushText(items, 'title', asString(detail.title));
  pushText(items, 'dataProvider', asString(dataProvider?.name));
  pushText(items, 'publishedAt', asString(detail.publicationDate) || asString(detail.createdAt));
  pushText(
    items,
    'type',
    withLabel(texts.participationProject.type, asDisplayString(payload?.type))
  );
  pushText(
    items,
    'theme',
    withLabel(texts.participationProject.theme, asDisplayString(payload?.theme))
  );
  pushText(
    items,
    'status',
    withLabel(texts.participationProject.status, asDisplayString(payload?.status))
  );
  pushText(
    items,
    'instance',
    withLabel(texts.participationProject.instance, asDisplayString(payload?.instance))
  );
  pushText(
    items,
    'dateStart',
    withLabel(texts.participationProject.date, asDisplayString(firstDate?.dateStart))
  );
  pushText(items, 'dateEnd', asDisplayString(firstDate?.dateEnd));
  pushText(
    items,
    'time',
    withLabel(
      texts.participationProject.time,
      [asDisplayString(payload?.startTime), asDisplayString(payload?.endTime)]
        .filter(Boolean)
        .join(' - ')
    )
  );
  pushText(
    items,
    'location',
    withLabel(
      texts.participationProject.location,
      asDisplayString(payload?.location) ||
        asDisplayString(firstLocation?.name) ||
        joinAddress(firstAddress)
    )
  );
  pushText(
    items,
    'organizer',
    withLabel(texts.participationProject.organizer, asDisplayString(payload?.organizer))
  );
  pushText(
    items,
    'contact',
    withLabel(
      texts.participationProject.contact,
      asDisplayString(payload?.contact) || joinContact(firstContact)
    )
  );
  pushText(
    items,
    'email',
    withLabel(
      texts.participationProject.email,
      asDisplayString(payload?.email) || asDisplayString(firstContact?.email)
    )
  );
  pushText(
    items,
    'phone',
    withLabel(
      texts.participationProject.phone,
      asDisplayString(payload?.phone) || asDisplayString(firstContact?.phone)
    )
  );
  pushText(
    items,
    'capacity',
    withLabel(texts.participationProject.capacity, asDisplayString(payload?.capacity))
  );
  pushText(
    items,
    'registrationRequired',
    withLabel(
      texts.participationProject.registrationRequired,
      formatRegistrationRequired(payload?.registrationRequired)
    )
  );
  pushText(
    items,
    'statistics',
    withLabel(texts.participationProject.statistics, asDisplayString(payload?.statistics))
  );
  pushText(items, 'tags', withLabel(texts.participationProject.tags, tags));
  pushText(items, 'teaser', asString(detail.teaser));
  pushText(items, 'description', asString(detail.description));
  parseContentBlocks(items, detail.contentBlocks);
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
      } else if (detail.genericType === GenericType.ParticipationProject) {
        parseParticipationProject(items, detail);
      } else {
        parseOffer(items, detail);
      }
      break;
    default:
      break;
  }

  return items;
};
