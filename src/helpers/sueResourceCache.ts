import NetInfo from '@react-native-community/netinfo';

import { addToStore, readFromStore } from './storageHelper';

// Only SUE read data is cached here. Endpoints keep municipalities and test systems separate.
export const withSueResourceCache = async <T>(resource: string[], load: () => Promise<T>) => {
  const key = `sueResourceCacheV1:${JSON.stringify(resource)}`;
  let cached: { value: T } | null = null;
  try {
    cached = await readFromStore(key);
  } catch {
    console.error('Could not read cached SUE data');
  }
  const network = await NetInfo.fetch();
  if (network.isConnected === false || network.isInternetReachable === false) {
    if (cached) return cached.value;
    throw new Error('SUE data is not available offline yet');
  }

  let value: T;
  try {
    value = await load();
  } catch (error) {
    if (cached) return cached.value;
    throw error;
  }

  try {
    await addToStore(key, { value });
  } catch {
    // A cache write failure must not discard a successful read from the server.
    console.error('Could not cache SUE data for offline use');
  }
  return value;
};
