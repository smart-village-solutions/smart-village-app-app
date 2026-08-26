import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback, useRef } from 'react';

type WasteStreetRehydrationParams = {
  editStreet?: boolean;
  isReset: boolean;
  onRehydrate: () => void;
};

export const useWasteStreetRehydration = ({
  editStreet,
  isReset,
  onRehydrate
}: WasteStreetRehydrationParams) => {
  const isEditingRef = useRef(false);
  isEditingRef.current = !!editStreet || isReset;

  useFocusEffect(
    useCallback(() => {
      if (isEditingRef.current) return;

      onRehydrate();
    }, [onRehydrate])
  );
};
