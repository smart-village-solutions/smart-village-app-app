import { useEffect } from 'react';

type WasteStreetEditRequestParams = {
  editStreet?: boolean;
  onReset: () => void;
  onRequestHandled: () => void;
};

export const useWasteStreetEditRequest = ({
  editStreet,
  onReset,
  onRequestHandled
}: WasteStreetEditRequestParams) => {
  useEffect(() => {
    if (!editStreet) return;

    onReset();
    onRequestHandled();
  }, [editStreet, onRequestHandled, onReset]);
};
