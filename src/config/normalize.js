// Thx to https://github.com/gitpoint/git-point
//
// Method to normalize size of fonts across devices
//
// Some code taken from https://jsfiddle.net/97ty7yjk/ &
// https://stackoverflow.com/questions/34837342/font-size-on-iphone-6s-plus
//
// author: @xiaoneng
// date: 14/10/2016
// version: 03
//

// https://facebook.github.io/react-native/docs/dimensions.html
// https://facebook.github.io/react-native/docs/pixelratio.html
import { PixelRatio } from 'react-native';

import { device } from './device';

const pixelRatio = PixelRatio.get();
const deviceHeight = device.height;
const deviceWidth = device.width;

// The Ultimate Guide To iPhone Resolutions
// https://www.paintcodeapp.com/news/ultimate-guide-to-iphone-resolutions

// -- Testing Only --
// const fontScale = PixelRatio.getFontScale();
// const layoutSize = PixelRatio.getPixelSizeForLayoutSize(14);
// console.log('normalizeText getPR ->', pixelRatio);
// console.log('normalizeText getFS ->', fontScale);
// console.log('normalizeText getDH ->', deviceHeight);
// console.log('normalizeText getDW ->', deviceWidth);
// console.log('normalizeText getPSFLS ->', layoutSize);

/* eslint-disable complexity */
/* this is an external package, we do not lint */
export const normalize = (size) => {
  // the base for our calculations are iPhone 14 Pro, iPhone 15, iPhone 15 Pro (393 x 852)
  // see https://www.ricsantos.net/2021/01/21/ios-device-resolution-guide
  const ratio = deviceWidth / 393;

  if (pixelRatio === 2) {
    return size * ratio * 0.84;
  }

  if (pixelRatio === 3) {
    // devices with pixel ratio like 2.6 will round up to 3 (i.e. Google Pixel),
    // see https://reactnative.dev/docs/next/pixelratio
    return size * ratio;
  }

  if (pixelRatio === 3.5) {
    return size * ratio * 1.18;
  }

  // if  pixelRatio !== 2 || 3 || 3.5
  return size * ratio * 0.84;
};
