import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';

// Apply recovered server configuration only where the user has not changed the bootstrap value.
export const mergeRecoveredSettings = (previous, current, incoming) => {
  if (isEqual(previous, incoming)) return current;
  if (isEqual(previous, current)) return incoming;
  if (!isPlainObject(current) || !isPlainObject(incoming)) return current;

  const merged = { ...current };
  for (const key of Object.keys(incoming)) {
    if (
      Object.prototype.hasOwnProperty.call(previous ?? {}, key) &&
      !Object.prototype.hasOwnProperty.call(current, key)
    ) {
      continue;
    }

    merged[key] = mergeRecoveredSettings(previous?.[key], current[key], incoming[key]);
  }
  return isEqual(merged, current) ? current : merged;
};
