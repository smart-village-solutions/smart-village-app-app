import * as DocumentPicker from 'expo-document-picker';
import { useCallback } from 'react';

export const DOCUMENT_TYPE_PDF = 'application/pdf';

export const useSelectDocument = () => {
  const selectDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: DOCUMENT_TYPE_PDF });

    if (result?.type !== 'cancel') {
      return result;
    }

    return {};
  }, []);

  return { selectDocument };
};
