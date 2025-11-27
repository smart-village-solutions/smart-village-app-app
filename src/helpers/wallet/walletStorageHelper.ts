import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

import { texts } from '../../config';
import { TCard } from '../../types';

const WALLET_STORAGE_KEY = 'WALLET_STORAGE_KEY';

export const getSavedCards = async (): Promise<TCard[]> => {
  let stored = null;

  try {
    stored = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);

    if (!stored) {
      return [];
    }
  } catch (error) {
    console.error('JSON parse error:', error);
    return [];
  }

  return JSON.parse(stored);
};

export const saveCard = async (card: TCard): Promise<void> => {
  try {
    const existingCards = await getSavedCards();

    // Assume cardNumber uniqueness. Adjust if different uniqueness rule needed.
    const isDuplicate = existingCards.some((c) => c.cardNumber === card.cardNumber);

    if (isDuplicate) {
      throw new Error('Duplicate card');
    }

    const updatedCards = [...existingCards, card];

    await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(updatedCards));
  } catch (error) {
    console.error('Failed to save card:', error);
    throw error;
  }
};

export const deleteCardByNumber = async (cardNumber: string): Promise<void> => {
  try {
    const existingCards = await getSavedCards();
    const filteredCards = existingCards.filter((card) => card.cardNumber !== cardNumber);

    await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(filteredCards));
  } catch (error) {
    console.error(`Failed to delete card with number ${cardNumber}:`, error);
  }
};

export const deleteAllCards = async () => {
  try {
    await SecureStore.deleteItemAsync(WALLET_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to delete all cards:', error);
  }
};
