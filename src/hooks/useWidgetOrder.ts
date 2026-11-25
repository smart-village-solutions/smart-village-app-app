import { useContext } from 'react';

import { WidgetOrderContext } from '../WidgetOrderProvider';

const disabledOrder = { order: [], loaded: true, save: async () => {} };

export const useWidgetOrder = (enabled: boolean) => {
  const context = useContext(WidgetOrderContext);
  if (!enabled) return disabledOrder;
  if (!context) throw new Error('useWidgetOrder requires WidgetOrderProvider');
  return context;
};
