import { installedApp } from '../config/contentVisibility';

export type AppRelease = { version: string | null; build: string | number | null };
type JsonObject = Record<string, unknown>;
const isObject = (value: unknown): value is JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const numericParts = (value: unknown): number[] | undefined => {
  if (typeof value !== 'string' && typeof value !== 'number') return;
  if (typeof value === 'number' && !Number.isSafeInteger(value)) return;
  if (!/^\d+(?:\.\d+)*$/.test(String(value))) return;
  const parts = String(value).split('.').map(Number);
  return parts.every(Number.isSafeInteger) ? parts : undefined;
};

const compareParts = (left: number[], right: number[]) => {
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
};

const versionParts = (value: unknown) => {
  if (typeof value !== 'string') return;
  const match =
    /^(\d+\.\d+\.\d+)(?:-([\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*))?(?:\+[\da-zA-Z-]+(?:\.[\da-zA-Z-]+)*)?$/.exec(
      value
    );
  if (!match) return;
  if (match[1].split('.').some((part) => /^0\d+$/.test(part))) return;
  if (match[2]?.split('.').some((part) => /^0\d+$/.test(part))) return;
  const core = numericParts(match[1]);
  if (!core) return;
  return { core, prerelease: match[2]?.split('.') };
};

const compareIdentifiers = (a: string, b: string) => {
  const numericA = /^\d+$/.test(a);
  const numericB = /^\d+$/.test(b);
  if (numericA && numericB && a.length !== b.length) return Math.sign(a.length - b.length);
  if (numericA !== numericB) return numericA ? -1 : 1;
  return a < b ? -1 : 1;
};

const comparePrerelease = (left?: string[], right?: string[]) => {
  if (!left) return right ? 1 : 0;
  if (!right) return -1;
  for (let index = 0; index < Math.max(left.length, right.length); index++) {
    const a = left[index];
    const b = right[index];
    if (a === b) continue;
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    return compareIdentifiers(a, b);
  }
  return 0;
};

export const meetsMinimumVersion = (version: unknown, minimum: unknown) => {
  const current = versionParts(version);
  const required = versionParts(minimum);
  if (!current || !required) return false;
  const core = compareParts(current.core, required.core);
  return (
    core > 0 || (core === 0 && comparePrerelease(current.prerelease, required.prerelease) >= 0)
  );
};

export const isContentAvailable = (payload: unknown, app: AppRelease) => {
  if (!isObject(payload)) return true;
  if (payload.minVersion != null && !meetsMinimumVersion(app.version, payload.minVersion))
    return false;
  if (payload.minBuild == null) return true;
  const current = numericParts(app.build);
  const required = numericParts(payload.minBuild);
  return !!current && !!required && compareParts(current, required) >= 0;
};

const hidden = Symbol('version-restricted-content');

// Filter presentation data, including offline reads; preserve raw cache and paging offsets.
export const filterContentByVersion = <T>(data: T, app: AppRelease): T => {
  const project = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const result = value.map(project);
      return result.every((item, index) => item === value[index])
        ? value
        : result.filter((item) => item !== hidden);
    }
    if (!isObject(value)) return value;
    if (!isContentAvailable(value.payload, app)) return hidden;
    let result = value;
    Object.entries(value).forEach(([key, item]) => {
      const projected = key === 'payload' ? item : project(item);
      if (projected !== item) {
        if (result === value) result = { ...value };
        result[key] = projected === hidden ? null : projected;
      }
    });
    return result;
  };
  const result = project(data);
  return (result === hidden ? null : result) as T;
};

export const visibleContent = <T>(data: T): T => filterContentByVersion(data, installedApp);
