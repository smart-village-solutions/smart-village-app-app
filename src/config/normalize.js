import { Dimensions, PixelRatio } from 'react-native';

const guidelineBaseWidth = 393;
const guidelineBaseHeight = 852;

export const normalize = (size, factor = 1) => {
   const { width, height } = Dimensions.get('window');
   const widthScale = width / guidelineBaseWidth;
   const heightScale = height / guidelineBaseHeight;
   const scale = Math.min(widthScale, heightScale); // Takes the smaller ratio to avoid excess.

   const newSize = size * scale;
   return PixelRatio.roundToNearestPixel(newSize * factor);
};