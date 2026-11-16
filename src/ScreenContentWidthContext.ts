import { createContext } from 'react';

// Undefined keeps images outside a stack on their existing window-based sizing.
export const ScreenContentWidthContext = createContext<number | undefined>(undefined);
