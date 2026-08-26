import { createContext } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

export type WidgetLayoutMode = 'grid' | 'list';

export const WidgetLayoutContext = createContext<{ mode: WidgetLayoutMode }>({ mode: 'grid' });

export const omitResponsiveDimensions = (style: StyleProp<ViewStyle>): StyleProp<ViewStyle> => {
  const flattenedStyle = StyleSheet.flatten(style);

  if (!flattenedStyle) return flattenedStyle;

  const sanitizedStyle = { ...flattenedStyle };

  delete sanitizedStyle.aspectRatio;
  delete sanitizedStyle.flexBasis;
  delete sanitizedStyle.height;
  delete sanitizedStyle.maxHeight;
  delete sanitizedStyle.maxWidth;
  delete sanitizedStyle.minHeight;
  delete sanitizedStyle.minWidth;
  delete sanitizedStyle.width;

  return sanitizedStyle;
};
