import { LocationObjectCoords } from 'expo-location';

import { GenericItem, OpeningHour, SVA_Date } from '../types';

import { formatAddress } from './addressHelper';
import { removeHtml, trimNewLines } from './htmlViewHelper';

export type ParticipationProjectPayload = {
  capacity?: string | number;
  contact?: string;
  email?: string;
  endTime?: string;
  instance?: string;
  location?: string;
  organizer?: string;
  phone?: string;
  registrationRequired?: boolean | string;
  startTime?: string;
  statistics?: string;
  status?: string;
  tags?: string[] | string;
  theme?: string;
  type?: string;
};

export type ParticipationProject = GenericItem<ParticipationProjectPayload> & {
  description?: string;
  teaser?: string;
  updatedAt?: string;
};

export const normalizeParticipationProjectValue = (value?: unknown) => {
  if (value === undefined || value === null) return;

  const text = `${value}`.trim();

  if (!text || text === 'null' || text === 'undefined') return;

  return text;
};

export const PARTICIPATION_PROJECT_OPEN_START_DATE_PREFIX = 'ab';

export const getParticipationProjectDatePrefix = (date?: SVA_Date) => {
  const timeDescription = normalizeParticipationProjectValue(date?.timeDescription)?.toLowerCase();

  return timeDescription === PARTICIPATION_PROJECT_OPEN_START_DATE_PREFIX
    ? PARTICIPATION_PROJECT_OPEN_START_DATE_PREFIX
    : undefined;
};

export const normalizeParticipationProjectTags = (tags?: string[] | string) => {
  if (Array.isArray(tags)) {
    return tags.map(normalizeParticipationProjectValue).filter(Boolean) as string[];
  }

  const text = normalizeParticipationProjectValue(tags);

  return text ? text.split(',').map(normalizeParticipationProjectValue).filter(Boolean) : [];
};

export const getParticipationProjectType = ({ categories, payload }: ParticipationProject) =>
  normalizeParticipationProjectValue(payload?.type) ||
  normalizeParticipationProjectValue(categories?.[0]?.name);

export const getParticipationProjectGeoLocation = ({
  addresses,
  locations
}: ParticipationProject): LocationObjectCoords | undefined =>
  locations?.find((location) => location.geoLocation)?.geoLocation ||
  addresses?.find((address) => address.geoLocation)?.geoLocation;

export const getParticipationProjectLocationText = ({
  addresses,
  locations,
  payload
}: ParticipationProject) =>
  normalizeParticipationProjectValue(payload?.location) ||
  normalizeParticipationProjectValue(locations?.find((location) => location.name)?.name) ||
  (addresses?.[0] ? formatAddress(addresses[0]) : undefined);

export const getParticipationProjectBody = ({
  contentBlocks,
  description,
  teaser
}: ParticipationProject) => {
  const firstContentBlockBody = contentBlocks
    ?.map((contentBlock) => normalizeParticipationProjectValue(contentBlock.body))
    .find(Boolean);

  return normalizeParticipationProjectValue(description || teaser || firstContentBlockBody);
};

export const getParticipationProjectPlainBody = (data: ParticipationProject) =>
  normalizeParticipationProjectValue(
    trimNewLines(removeHtml(getParticipationProjectBody(data) || ''))
  );

export const normalizeParticipationProjectDates = ({
  dates,
  payload
}: ParticipationProject): OpeningHour[] =>
  (dates || [])
    .map((date) => {
      const dateFrom = normalizeParticipationProjectValue(date.dateFrom || date.dateStart);
      const dateTo = normalizeParticipationProjectValue(date.dateTo || date.dateEnd);
      const timeFrom = normalizeParticipationProjectValue(date.timeFrom || date.timeStart);
      const timeTo = normalizeParticipationProjectValue(date.timeTo || date.timeEnd);
      const fallbackTimeFrom = normalizeParticipationProjectValue(payload?.startTime);
      const fallbackTimeTo = normalizeParticipationProjectValue(payload?.endTime);
      const datePrefix = getParticipationProjectDatePrefix(date);
      const description = normalizeParticipationProjectValue(
        date.description || (datePrefix ? undefined : date.timeDescription)
      );

      if (!dateFrom && !dateTo) return;

      return {
        dateFrom,
        datePrefix,
        dateTo,
        description,
        open: true,
        timeFrom: timeFrom || fallbackTimeFrom,
        timeTo: timeTo || fallbackTimeTo,
        useYear: true,
        weekday: date.weekday
      };
    })
    .filter(Boolean) as OpeningHour[];

export const buildParticipationProjectCalendarDateTime = (date?: string, time?: string) => {
  const normalizedDate = normalizeParticipationProjectValue(date);
  const normalizedTime = normalizeParticipationProjectValue(time);

  if (!normalizedDate) return;

  return normalizedTime ? `${normalizedDate}T${normalizedTime}` : normalizedDate;
};

const firstNormalizedValue = (...values: unknown[]) =>
  values.map(normalizeParticipationProjectValue).find(Boolean);

export const buildParticipationProjectCalendarValues = ({
  dates,
  payload
}: ParticipationProject) => {
  const firstDate = dates?.[0];
  const startTime = firstNormalizedValue(
    firstDate?.timeStart,
    firstDate?.timeFrom,
    payload?.startTime
  );
  const endTime = firstNormalizedValue(
    firstDate?.timeEnd,
    firstDate?.timeTo,
    payload?.endTime,
    startTime
  );
  const startDatetime = buildParticipationProjectCalendarDateTime(
    firstNormalizedValue(firstDate?.dateStart, firstDate?.dateFrom),
    startTime
  );
  const endDatetime =
    buildParticipationProjectCalendarDateTime(
      firstNormalizedValue(
        firstDate?.dateEnd,
        firstDate?.dateTo,
        firstDate?.dateStart,
        firstDate?.dateFrom
      ),
      endTime
    ) || startDatetime;

  return {
    allDay: !startTime && !endTime,
    endDatetime,
    startDatetime
  };
};

export const hasParticipationProjectContent = ({
  contentBlocks,
  description,
  teaser,
  webUrls
}: ParticipationProject) =>
  !!description || !!teaser || !!contentBlocks?.length || !!webUrls?.[0]?.url;
