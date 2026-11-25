import { useContext } from 'react';

import { WidgetOrderContext } from '../WidgetOrderProvider';

export const useWidgetOrder = (enabled: boolean) => {
  const context = useContext(WidgetOrderContext);
  if (!context) throw new Error('useWidgetOrder requires WidgetOrderProvider');
  const { order, loaded, save } = context;
  return { order: enabled ? order : [], loaded, save };
};
