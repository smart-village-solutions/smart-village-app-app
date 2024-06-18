import { Dimensions, PixelRatio } from 'react-native';

// Default guideline sizes are based on standard ~6.12" screen mobile device (iPhone 15 Pro)
const guidelineBaseWidth = 393;
const guidelineBaseHeight = 852;

export const normalize = (size, factor = 1) => {
  const { width, height } = Dimensions.get('window');
  const widthScale = width / guidelineBaseWidth;
  const heightScale = height / guidelineBaseHeight;
  const scale = Math.min(widthScale, heightScale);

  return PixelRatio.roundToNearestPixel(size * scale * factor);
};
