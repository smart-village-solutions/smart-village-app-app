import { Dimensions } from 'react-native';

import { colors } from '../colors';
import { normalize } from '../normalize';
import { imageHeight } from '../../helpers/imageHelper';

export const html = {
  p: {
    color: colors.darkText,
    marginBottom: normalize(16)
  },
  a: {
    color: colors.primary,
    fontFamily: 'bold',
    textDecorationLine: 'none'
  },
  h1: {
    color: colors.darkText,
    fontFamily: 'bold',
    fontSize: normalize(24),
    lineHeight: normalize(30),
    marginBottom: normalize(24)
  },
  h2: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(20),
    fontWeight: '400',
    lineHeight: normalize(26),
    marginBottom: normalize(14)
  },
  h3: {
    color: colors.darkText,
    fontFamily: 'bold',
    fontSize: normalize(18),
    lineHeight: normalize(24)
  },
  h4: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(18),
    fontWeight: '400',
    lineHeight: normalize(24)
  },
  h5: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    fontWeight: '400'
  },
  h6: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(14),
    fontWeight: '400'
  },
  b: {
    fontFamily: 'bold'
  },
  strong: {
    fontFamily: 'bold'
  },
  ul: {
    marginBottom: 0
  },
  ol: {
    marginBottom: 0
  },
  img: {
    alignSelf: 'center'
  },
  iframe: {
    alignSelf: 'center',
    height: imageHeight(Dimensions.get('window').width)
  },
  em: {
    fontFamily: 'italic'
  }
};
