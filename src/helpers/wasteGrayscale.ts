import { resolveGrayscaleConfiguration, toGrayscaleColor } from './themeHelper';

export const resolveWasteDisplayColor = (color: string, isGrayscaleEnabled: boolean) => {
  if (!isGrayscaleEnabled) return color;

  const displayColor = toGrayscaleColor(color);

  return typeof displayColor === 'string' ? displayColor : color;
};

export const resolveWasteMarkedDatesForDisplay = <T>(
  markedDates: T,
  isGrayscaleEnabled: boolean
): T => (isGrayscaleEnabled ? resolveGrayscaleConfiguration(markedDates) : markedDates);
