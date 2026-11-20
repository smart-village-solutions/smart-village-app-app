import { fetch } from 'expo/fetch';

import changers from '../../modules/expo-changers';

import { createOffersClient } from './createOffersClient';
import { isKlimaTalerEnabled } from './entry';
import type { OffersQuery } from './offersTypes';

const client = createOffersClient(fetch);

export const loadKlimaTalerOffers = async (query: OffersQuery) => {
  if (!isKlimaTalerEnabled()) throw new Error('E_DISABLED');
  const { environment } = await changers.getStatus();
  if (!isKlimaTalerEnabled()) throw new Error('E_DISABLED');
  return client.load(environment, query);
};
