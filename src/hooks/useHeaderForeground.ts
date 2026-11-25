import { createContext, useContext } from 'react';

import { useTheme } from './useTheme';

export const HeaderForegroundContext = createContext<string | undefined>(undefined);

// Header controls share one color without changing the palette of dialogs or screen content.
export const useHeaderForeground = (fallback?: string) => {
  const foreground = useContext(HeaderForegroundContext);
  const { colors } = useTheme();

  return foreground ?? fallback ?? colors.text;
};
