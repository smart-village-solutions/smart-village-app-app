import type { GenericItem } from '../types/GenericItem';

const DATE_FIELDS = ['publicationDate', 'createdAt', 'updatedAt'];

const getSortValue = (
  item: GenericItem | undefined,
  field: string
): number | string | undefined => {
  if (DATE_FIELDS.includes(field)) {
    const value = item?.[field as 'publicationDate' | 'createdAt' | 'updatedAt'];
    const timestamp = value ? Date.parse(value) : NaN;

    return Number.isFinite(timestamp) ? timestamp : undefined;
  }

  const payload = item?.payload as Record<string, unknown> | undefined;
  const value = payload?.[field];

  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string' || !value.trim()) return undefined;

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : value;
};

/** Bare fields sort ascending; _ASC / _DESC select direction. Missing values stay last. */
export const compareParticipationProjects = (
  first: GenericItem | undefined,
  second: GenericItem | undefined,
  order = 'itemIndex'
) => {
  const configuredOrder = typeof order === 'string' && order.trim() ? order.trim() : 'itemIndex';
  const field = configuredOrder.replace(/_(ASC|DESC)$/, '');
  const direction = configuredOrder.endsWith('_DESC') ? -1 : 1;
  const left = getSortValue(first, field);
  const right = getSortValue(second, field);

  if (left === right) return 0;
  if (left === undefined) return 1;
  if (right === undefined) return -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return direction * (left - right);
  }

  if (typeof left !== typeof right) return typeof left === 'number' ? -1 : 1;

  return direction * String(left).localeCompare(String(right), undefined, { sensitivity: 'base' });
};
