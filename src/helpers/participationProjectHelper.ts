import { LocationObjectCoords } from 'expo-location';

import { consts, texts } from '../config';
import { QUERY_TYPES } from '../queries';
import { GenericItem, OpeningHour, ScreenName, SVA_Date } from '../types';

import { formatAddress } from './addressHelper';
import { removeHtml, trimNewLines } from './htmlViewHelper';
import { mainImageOfMediaContents } from './imageHelper';
import { momentFormatUtcToLocal } from './momentHelper';
import { subtitle as formatSubtitle } from './textHelper';

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
  status?:
    | string
    | {
        label?: string;
        name?: string;
        status?: string;
        text?: string;
        title?: string;
        value?: string;
      };
  statusColor?: string;
  tags?: string[] | string;
  theme?: string;
  type?: string;
};

export const PARTICIPATION_PROJECT_STATUS = {
  ACTIVE: 'active',
  ANNOUNCED: 'announced',
  COMPLETED: 'completed',
  ENDED: 'ended',
  RECENTLY_ENDED: 'recently_ended',
  EMPTY: 'empty'
} as const;

export const PARTICIPATION_PROJECT_STATUS_FILTER = 'participationStatus';
export const PARTICIPATION_PROJECT_STATUS_POSITION_PARAM = 'participationStatusPosition';
export const PARTICIPATION_PROJECT_STATUS_POSITION = {
  BELOW_TEASER: 'belowTeaser',
  REPLACE_TEASER: 'replaceTeaser'
} as const;
export type ParticipationProjectStatusPosition =
  (typeof PARTICIPATION_PROJECT_STATUS_POSITION)[keyof typeof PARTICIPATION_PROJECT_STATUS_POSITION];
export const PARTICIPATION_PROJECT_DEFAULT_STATUSES: string[] = [
  PARTICIPATION_PROJECT_STATUS.ACTIVE
];
export const PARTICIPATION_PROJECT_COMPLETED_STATUSES: string[] = [
  PARTICIPATION_PROJECT_STATUS.COMPLETED,
  PARTICIPATION_PROJECT_STATUS.ENDED,
  PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED
];

export type ParticipationProjectStatusCount = {
  count: number;
  label: string;
  status: string;
};

export type ParticipationProject = GenericItem<ParticipationProjectPayload> & {
  description?: string;
  teaser?: string;
  updatedAt?: string;
};

type ParticipationProjectPreviewItem = {
  accessibilityLabel: string;
  bottomDivider: boolean;
  id: string;
  overtitle?: string;
  params: {
    details: ParticipationProject;
    query: string;
    queryVariables: {
      id: string;
    };
    rootRouteName: string;
    title: string;
  };
  picture: {
    url?: string;
  };
  routeName: ScreenName;
  statusColor?: string;
  statusLabel?: string;
  statusPosition: ParticipationProjectStatusPosition;
  subtitle?: string;
  title: string;
};

export const normalizeParticipationProjectValue = (value?: unknown) => {
  if (value === undefined || value === null) return;

  const text = `${value}`.trim();

  if (!text || text === 'null' || text === 'undefined') return;

  return text;
};

const PARTICIPATION_PROJECT_STATUS_ALIASES: Record<string, string> = {
  abgeschlossen: PARTICIPATION_PROJECT_STATUS.COMPLETED,
  aktiv: PARTICIPATION_PROJECT_STATUS.ACTIVE,
  beendet: PARTICIPATION_PROJECT_STATUS.ENDED,
  finished: PARTICIPATION_PROJECT_STATUS.ENDED,
  'kürzlich abgeschlossen': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  'kürzlich beendet': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  'kuerzlich abgeschlossen': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  'kuerzlich beendet': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  'recently completed': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  'recently ended': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  'recently-completed': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  'recently-ended': PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  recently_completed: PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  recently_ended: PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
  recentlycompleted: PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED
};

export const normalizeParticipationProjectStatus = (value?: unknown) => {
  const status = normalizeParticipationProjectValue(value)?.toLowerCase();

  if (!status) return PARTICIPATION_PROJECT_STATUS.EMPTY;

  return PARTICIPATION_PROJECT_STATUS_ALIASES[status] || status;
};

const getParticipationProjectStatusRecord = (status: ParticipationProjectPayload['status']) =>
  status && typeof status === 'object' ? status : undefined;

const PARTICIPATION_PROJECT_STATUS_COLORS = ['gray', 'green', 'yellow'];

export const getParticipationProjectStatusValue = ({ payload }: ParticipationProject) => {
  const status = payload?.status;
  const statusRecord = getParticipationProjectStatusRecord(status);

  return normalizeParticipationProjectValue(
    statusRecord?.label ||
      statusRecord?.text ||
      statusRecord?.title ||
      statusRecord?.name ||
      statusRecord?.status ||
      statusRecord?.value ||
      status
  );
};

export const getParticipationProjectStatusColor = ({ payload }: ParticipationProject) => {
  const statusColor = normalizeParticipationProjectValue(payload?.statusColor)?.toLowerCase();

  return PARTICIPATION_PROJECT_STATUS_COLORS.includes(statusColor || '') ? statusColor : undefined;
};

export const getParticipationProjectStatus = (item: ParticipationProject) =>
  normalizeParticipationProjectStatus(getParticipationProjectStatusValue(item));

export const getParticipationProjectStatusLabel = (item: ParticipationProject) => {
  const status = getParticipationProjectStatus(item);
  const statusLabels = texts.participationProject.statuses as Record<string, string>;
  const configuredLabel = statusLabels?.[status];

  return configuredLabel || getParticipationProjectStatusValue(item);
};

export const normalizeParticipationProjectStatusPosition = (
  value?: unknown
): ParticipationProjectStatusPosition =>
  value === PARTICIPATION_PROJECT_STATUS_POSITION.REPLACE_TEASER
    ? PARTICIPATION_PROJECT_STATUS_POSITION.REPLACE_TEASER
    : PARTICIPATION_PROJECT_STATUS_POSITION.BELOW_TEASER;

export const isParticipationProjectStatus = (item: ParticipationProject, status?: unknown) =>
  getParticipationProjectStatus(item) === normalizeParticipationProjectStatus(status);

export const isParticipationProjectActive = (item: ParticipationProject) =>
  isParticipationProjectStatus(item, PARTICIPATION_PROJECT_STATUS.ACTIVE);

export const isParticipationProjectCurrent = (item: ParticipationProject) =>
  PARTICIPATION_PROJECT_DEFAULT_STATUSES.some((status) =>
    isParticipationProjectStatus(item, status)
  );

export const isParticipationProjectCompleted = (item: ParticipationProject) =>
  PARTICIPATION_PROJECT_COMPLETED_STATUSES.includes(getParticipationProjectStatus(item));

export const getParticipationProjectStatusCounts = (
  items: ParticipationProject[]
): ParticipationProjectStatusCount[] => {
  const statusCounts = new Map<string, ParticipationProjectStatusCount>();

  items.forEach((item) => {
    const status = getParticipationProjectStatus(item);
    const label = getParticipationProjectStatusLabel(item) || '';

    const statusCount = statusCounts.get(status);

    statusCounts.set(status, {
      count: (statusCount?.count || 0) + 1,
      label: statusCount?.label || label,
      status
    });
  });

  const statusOrder: string[] = [
    PARTICIPATION_PROJECT_STATUS.ACTIVE,
    PARTICIPATION_PROJECT_STATUS.ANNOUNCED,
    PARTICIPATION_PROJECT_STATUS.RECENTLY_ENDED,
    PARTICIPATION_PROJECT_STATUS.ENDED,
    PARTICIPATION_PROJECT_STATUS.COMPLETED,
    PARTICIPATION_PROJECT_STATUS.EMPTY
  ];

  return Array.from(statusCounts.values()).sort((first, second) => {
    const firstIndex = statusOrder.indexOf(first.status);
    const secondIndex = statusOrder.indexOf(second.status);
    const firstOrder = firstIndex === -1 ? statusOrder.length : firstIndex;
    const secondOrder = secondIndex === -1 ? statusOrder.length : secondIndex;

    return firstOrder - secondOrder || first.label.localeCompare(second.label);
  });
};

export const PARTICIPATION_PROJECT_OPEN_START_DATE_PREFIX = 'ab';

const getParticipationProjectCalendarDate = (value?: unknown) => {
  const date = normalizeParticipationProjectValue(value);

  return date?.match(/^\d{4}-\d{2}-\d{2}/)?.[0] || date;
};

const isParticipationProjectDateRange = (date?: SVA_Date) => {
  const dateStart = getParticipationProjectCalendarDate(date?.dateStart || date?.dateFrom);
  const dateEnd = getParticipationProjectCalendarDate(date?.dateEnd || date?.dateTo);

  return !!dateStart && !!dateEnd && dateStart !== dateEnd;
};

export const getParticipationProjectDatePrefix = (date?: SVA_Date) => {
  const timeDescription = normalizeParticipationProjectValue(date?.timeDescription)?.toLowerCase();

  return timeDescription === PARTICIPATION_PROJECT_OPEN_START_DATE_PREFIX
    ? PARTICIPATION_PROJECT_OPEN_START_DATE_PREFIX
    : undefined;
};

export const getParticipationProjectListDatePrefix = (date?: SVA_Date) =>
  getParticipationProjectDatePrefix(date) ||
  (isParticipationProjectDateRange(date)
    ? PARTICIPATION_PROJECT_OPEN_START_DATE_PREFIX
    : undefined);

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

export const isParticipationProjectMapEligible = (item: ParticipationProject) =>
  !!getParticipationProjectGeoLocation(item);

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

const normalizeParticipationProjectPreviewText = (text?: string) =>
  trimNewLines(removeHtml(text || ''))
    ?.replace(/\s+/g, ' ')
    .trim();

export const getParticipationProjectPreviewSubtitle = (item: ParticipationProject) =>
  normalizeParticipationProjectPreviewText(item.contentBlocks?.[0]?.body);

export const getParticipationProjectPreviewDate = (item: Pick<ParticipationProject, 'dates'>) => {
  const date = item.dates?.[0];
  const dateStart = date?.dateStart;

  if (!dateStart) return;

  return [getParticipationProjectListDatePrefix(date), momentFormatUtcToLocal(dateStart)]
    .filter(Boolean)
    .join(' ');
};

export const buildParticipationProjectPreviewItem = (
  item: ParticipationProject,
  {
    bottomDivider = false,
    rootRouteName = consts.ROOT_ROUTE_NAMES.PARTICIPATION_PROJECTS,
    statusPosition = PARTICIPATION_PROJECT_STATUS_POSITION.BELOW_TEASER,
    title = texts.participationProject.participationProject
  }: {
    bottomDivider?: boolean;
    rootRouteName?: string;
    statusPosition?: ParticipationProjectStatusPosition;
    title?: string;
  } = {}
): ParticipationProjectPreviewItem => {
  const type = getParticipationProjectType(item);
  const subtitle = getParticipationProjectPreviewSubtitle(item);
  const statusLabel = getParticipationProjectStatusLabel(item);
  const previewDate = getParticipationProjectPreviewDate(item);
  const overtitle = formatSubtitle(previewDate, type, '');
  const accessibilityLabel = [
    overtitle,
    statusLabel,
    item.title,
    statusPosition === PARTICIPATION_PROJECT_STATUS_POSITION.REPLACE_TEASER ? undefined : subtitle
  ]
    .filter(Boolean)
    .map((text) => `(${text})`)
    .join(' ');

  return {
    accessibilityLabel: `${accessibilityLabel} ${consts.a11yLabel.button}`.trim(),
    bottomDivider,
    id: item.id,
    overtitle,
    params: {
      title,
      query: QUERY_TYPES.GENERIC_ITEM,
      queryVariables: { id: `${item.id}` },
      rootRouteName,
      details: item
    },
    picture: {
      url: mainImageOfMediaContents(item.mediaContents)
    },
    routeName: ScreenName.Detail,
    subtitle,
    statusColor: getParticipationProjectStatusColor(item),
    statusLabel,
    statusPosition,
    title: item.title || texts.participationProject.participationProject
  };
};

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
