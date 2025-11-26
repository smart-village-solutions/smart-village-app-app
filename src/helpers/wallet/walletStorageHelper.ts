import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

import { texts } from '../../config';

/**
 * SECURITY NOTICE - Encryption Recommendations
 *
 * For production use with sensitive data like PIN codes, the recommended encryption
 * algorithm is **AES-256-GCM** (Galois/Counter Mode), which provides:
 * - Authenticated encryption (confidentiality + integrity)
 * - Protection against tampering via authentication tags
 * - Industry standard for secure data encryption
 *
 * Implementation options for React Native/Expo:
 * 1. `react-native-aes-gcm-crypto` - Native AES-GCM implementation
 *    - Requires Expo bare workflow or prebuild
 *    - Provides proper key management and IV generation
 *
 * 2. Server-side encryption - Store sensitive data on a secure backend
 *    - PIN codes should ideally not be stored on-device
 *    - Use secure authentication flows instead
 *
 * Current implementation uses Expo SecureStore which provides:
 * - iOS: Keychain Services (hardware-backed on supported devices)
 * - Android: Shared Preferences with Android Keystore encryption
 *
 * For PCI DSS compliance, consider:
 * - Not storing PIN codes at all (use tokenization)
 * - Additional encryption layer for sensitive fields
 * - Regular security audits
 *
 * WARNING: This implementation is for development/demo purposes.
 * Production deployments should implement AES-256-GCM encryption
 * for sensitive fields or use tokenization services.
 */

export type TCard = {
  backgroundColor: string;
  cardName?: string;
  cardNumber: string;
  description?: string;
  iconColor: string;
  iconName: string;
  pinCode: string;
  type: string;
};

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

export const saveCard = async (card: TCard): Promise<{ saved: boolean; duplicate: boolean }> => {
  try {
    const existingCards = await getSavedCards();

    // Assume cardNumber uniqueness. Adjust if different uniqueness rule needed.
    const isDuplicate = existingCards.some((c) => c.cardNumber === card.cardNumber);

    if (isDuplicate) {
      // Warning (consider moving string to texts config for localization)
      Alert.alert(texts.wallet.alert.duplicateCardTitle, texts.wallet.alert.duplicateCardMessage);

      return { saved: false, duplicate: true };
    }

    const updatedCards = [...existingCards, card];

    await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(updatedCards));

    return { saved: true, duplicate: false };
  } catch (error) {
    console.error('Failed to save card:', error);

    return { saved: false, duplicate: false };
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
