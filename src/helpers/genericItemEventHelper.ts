import moment from 'moment';

import { QUERY_TYPES } from '../queries/types';
import {
  GenericItem,
  GenericItemEventListItem,
  GenericItemEventSource,
  GenericType,
  ScreenName,
  SVA_Date
} from '../types';

import { getGenericItemDetailTitle, getGenericItemRootRouteName } from './genericTypeHelper';
import { mainImageOfMediaContents } from './imageHelper';
import { subtitle } from './textHelper';

const STATUS_FIELDS = ['label', 'text', 'title', 'name', 'status', 'value'] as const;
const STATUS_ALIASES: Record<string, string> = {
  abgeschlossen: 'completed',
  aktiv: 'active',
  beendet: 'ended',
  finished: 'ended',
  'kürzlich abgeschlossen': 'recently_ended',
  'kürzlich beendet': 'recently_ended',
  'kuerzlich abgeschlossen': 'recently_ended',
  'kuerzlich beendet': 'recently_ended',
  'recently completed': 'recently_ended',
  'recently ended': 'recently_ended',
  'recently-completed': 'recently_ended',
  'recently-ended': 'recently_ended',
  recently_completed: 'recently_ended',
  recently_ended: 'recently_ended',
  recentlycompleted: 'recently_ended'
};

export const normalizeGenericItemEventValue = (value?: unknown) => {
  if (value === undefined || value === null) return;
  const normalized = `${value}`.trim().toLowerCase();
  return !normalized || normalized === 'null' || normalized === 'undefined'
    ? undefined
    : normalized;
};

export const normalizeGenericItemEventStatus = (value?: unknown) => {
  const normalized = normalizeGenericItemEventValue(value);
  return normalized ? STATUS_ALIASES[normalized] || normalized : undefined;
};

const getStatus = (payload: Record<string, unknown>) => {
  const status = payload.status;
  if (!status || typeof status !== 'object') return status;
  return STATUS_FIELDS.map((field) => (status as Record<string, unknown>)[field]).find(
    (value) => value !== undefined && value !== null
  );
};

const dateValue = (date?: SVA_Date) => {
  const value = date?.dateStart || date?.dateFrom;
  if (!value || !moment(value, moment.ISO_8601, true).isValid()) return;
  return moment(value).format('YYYY-MM-DD');
};

const isInRange = (date: string, dateRange?: string[]) => {
  if (!dateRange?.length) return !moment(date).isBefore(moment(), 'day');
  const from = dateRange[0];
  const to = dateRange[1] || from;
  return !moment(date).isBefore(from, 'day') && !moment(date).isAfter(to, 'day');
};

/* eslint-disable complexity */
export const parseGenericItemEvents = (
  records: unknown,
  source: GenericItemEventSource,
  dateRange?: string[]
): GenericItemEventListItem[] => {
  if (!Array.isArray(records) || !source || !normalizeGenericItemEventValue(source.genericType)) {
    return [];
  }

  const typeFilters = Array.isArray(source.filterTypes)
    ? source.filterTypes.map(normalizeGenericItemEventValue).filter(Boolean)
    : [];
  const statusFilters = Array.isArray(source.filterStatuses)
    ? source.filterStatuses.map(normalizeGenericItemEventStatus).filter(Boolean)
    : [];

  const occurrences = records.flatMap((rawItem) => {
    if (!rawItem || typeof rawItem !== 'object') return [];
    const item = rawItem as GenericItem<Record<string, unknown>>;
    const payload = item.payload && typeof item.payload === 'object' ? item.payload : {};
    const types = [
      payload.type,
      ...(Array.isArray(item.categories) ? item.categories.map((c) => c?.name) : [])
    ]
      .map(normalizeGenericItemEventValue)
      .filter(Boolean);
    const status = normalizeGenericItemEventStatus(getStatus(payload));
    if (typeFilters.length && !types.some((type) => typeFilters.includes(type))) return [];
    if (statusFilters.length && (!status || !statusFilters.includes(status))) return [];

    const statusRecord =
      payload.status && typeof payload.status === 'object'
        ? (payload.status as Record<string, unknown>)
        : undefined;
    const color = `${payload.color || statusRecord?.color || ''}`.trim() || undefined;

    return (Array.isArray(item.dates) ? item.dates : []).flatMap((date, index) => {
      const listDate = dateValue(date);
      if (!listDate || !isInRange(listDate, dateRange)) return [];
      const time = `${date.timeStart || date.timeFrom || ''}`.trim() || undefined;
      const occurrenceId = `${source.genericType}:${item.id}:${date.id || index}:${listDate}`;
      return [
        {
          addresses: item.addresses,
          color,
          id: occurrenceId,
          listDate,
          overtitle: subtitle(undefined, undefined, time),
          params: {
            title: getGenericItemDetailTitle(
              item.genericType as GenericType,
              {},
              item.categories?.[0]?.name || ''
            ),
            query: QUERY_TYPES.GENERIC_ITEM,
            queryVariables: { id: `${item.id}` },
            rootRouteName: getGenericItemRootRouteName(item.genericType as GenericType),
            details: item
          },
          picture: { url: mainImageOfMediaContents(item.mediaContents) },
          routeName: ScreenName.Detail,
          startTime: time,
          title: item.title || ''
        }
      ];
    });
  });

  return Array.from(new Map(occurrences.map((item) => [item.id, item])).values()).sort(
    (first, second) =>
      first.listDate.localeCompare(second.listDate) ||
      `${first.startTime || ''}`.localeCompare(`${second.startTime || ''}`) ||
      first.title.localeCompare(second.title)
  );
};
/* eslint-enable complexity */
