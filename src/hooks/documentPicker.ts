import * as DocumentPicker from 'expo-document-picker';
import { useCallback } from 'react';

export const useSelectDocument = () => {
  const selectDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });

    return result;
  }, []);

  return { selectDocument };
};
