import { Dimensions } from 'react-native';

// Default guideline sizes are based on standard ~6.12" screen mobile device (iPhone 14 Pro)
const guidelineBaseWidth = 393;

export const normalize = (size, factor = 1) => {
  const { width, height } = Dimensions.get('window');
  const shortDimension = width < height ? width : height;
  const scale = (shortDimension / guidelineBaseWidth) * size;

  return size + (scale - size) * factor;
};
