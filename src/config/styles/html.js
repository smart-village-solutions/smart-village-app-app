import { useContext } from 'react';
import { Dimensions } from 'react-native';

import { AccessibilityContext } from '../../AccessibilityProvider';
import { imageHeight } from '../../helpers/imageHelper';
import { colors } from '../colors';
import { normalize } from '../normalize';

export const html = () => {
  const { isBoldTextEnabled } = useContext(AccessibilityContext);

  return {
    p: {
      color: colors.darkText,
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular',
      margin: 0,
      marginBottom: normalize(16)
    },
    a: {
      color: colors.primary,
      fontFamily: 'bold',
      margin: 0,
      textDecorationLine: 'none'
    },
    div: {
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular'
    },
    h1: {
      color: colors.darkText,
      fontFamily: 'bold',
      fontSize: normalize(24),
      lineHeight: normalize(30),
      margin: 0,
      marginBottom: normalize(24)
    },
    h2: {
      color: colors.darkText,
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular',
      fontSize: normalize(20),
      fontWeight: '400',
      lineHeight: normalize(26),
      margin: 0,
      marginBottom: normalize(14)
    },
    h3: {
      color: colors.darkText,
      fontFamily: 'bold',
      fontSize: normalize(18),
      lineHeight: normalize(24),
      margin: 0
    },
    h4: {
      color: colors.darkText,
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular',
      fontSize: normalize(18),
      fontWeight: '400',
      lineHeight: normalize(24),
      margin: 0
    },
    h5: {
      color: colors.darkText,
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular',
      fontSize: normalize(16),
      fontWeight: '400',
      margin: 0
    },
    h6: {
      color: colors.darkText,
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular',
      fontSize: normalize(14),
      fontWeight: '400',
      margin: 0
    },
    b: {
      fontFamily: 'bold',
      margin: 0
    },
    strong: {
      fontFamily: 'bold',
      margin: 0
    },
    ul: {
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular',
      margin: 0
    },
    ol: {
      fontFamily: isBoldTextEnabled ? 'bold' : 'regular',
      margin: 0
    },
    img: {
      alignSelf: 'center',
      margin: 0
    },
    iframe: {
      alignSelf: 'center',
      height: imageHeight(Dimensions.get('window').width),
      margin: 0
    },
    em: {
      fontFamily: isBoldTextEnabled ? 'bold-italic' : 'italic',
      margin: 0
    },
    figure: {
      margin: 0
    }
  };
};
