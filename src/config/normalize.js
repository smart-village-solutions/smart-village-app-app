import { Dimensions, PixelRatio } from 'react-native';

// Default sizes are based on standard ~6.12" portrait screen mobile device (iPhone 15 Pro)
const GUIDELINE_BASE_WIDTH_PORTRAIT = 393;
const GUIDELINE_BASE_HEIGHT_PORTRAIT = 852;

/**
 * Normalize sizes based on the screen and orientation and
 * cache the results to avoid recalculations every time
 */
export const normalize = (() => {
  const cache = new Map();

  return (size, factor = 1) => {
    const { width, height } = Dimensions.get('window');
    const isLandscape = width > height;
    const cacheKey = `${size}-${factor}-${width}-${height}-${
      isLandscape ? 'landscape' : 'portrait'
    }`;

    if (cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }

    const widthScale =
      width / (isLandscape ? GUIDELINE_BASE_HEIGHT_PORTRAIT : GUIDELINE_BASE_WIDTH_PORTRAIT);
    const heightScale =
      height / (isLandscape ? GUIDELINE_BASE_WIDTH_PORTRAIT : GUIDELINE_BASE_HEIGHT_PORTRAIT);
    const scale = Math.min(widthScale, heightScale);
    const normalizedSize = PixelRatio.roundToNearestPixel(size * scale * factor);

    cache.set(cacheKey, normalizedSize);

    return normalizedSize;
  };
})();
