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
  if (pixelRatio === 2) {
    // iphone 5s and older Androids
    if (deviceWidth < 360) {
      return size * 0.84;
    }

    // iphone 5
    if (deviceHeight < 667) {
      return size * 0.84;

      // iphone 6-6s
    } else if (deviceHeight >= 667 && deviceHeight <= 735) {
      return size;
    }

    // older phablets
    return size * 1.12;
  }

  if (pixelRatio === 3) {
    // catch Android font scaling on small machines
    // where pixel ratio / font scale ratio => 3:3
    if (deviceWidth <= 360) {
      return size;
    }

    // catch other weird android width sizings
    if (deviceHeight < 667) {
      return size * 1.12;
    }

    // catch in-between size Androids and scale font up - a tad but not too much
    if (deviceHeight >= 667 && deviceHeight <= 735) {
      return size * 1.12;
    }

    // iPhone X
    if (deviceWidth == 375) {
      return size;
    }

    // catch larger devices
    // iphone 6s plus / 7 plus / mi note 等等
    return size * 1.12;
  }

  if (pixelRatio === 3.5) {
    // catch Android font scaling on small machines
    // where pixel ratio / font scale ratio => 3:3
    if (deviceWidth <= 360) {
      return size;
    }

    // catch other smaller android height sizings
    if (deviceHeight < 667) {
      return size * 1.18;
    }

    // catch in-between size Androids and scale font up - a tad but not too much
    if (deviceHeight >= 667 && deviceHeight <= 735) {
      return size * 1.18;
    }

    // catch larger phablet devices
    return size * 1.2;
  }

  // if older device ie pixelRatio !== 2 || 3 || 3.5
  return size * 0.84;
};
