import { colors } from '../colors';
import { normalize } from '../normalize';

export const html = {
  p: {
    color: colors.darkText,
    lineHeight: normalize(22),
    marginBottom: normalize(16)
  },
  a: {
    color: colors.primary,
    fontFamily: 'titillium-web-bold',
    fontWeight: '600',
    textDecorationLine: 'none'
  },
  h1: {
    color: colors.darkText,
    fontFamily: 'titillium-web-bold',
    fontSize: normalize(24),
    fontWeight: '600',
    lineHeight: normalize(30),
    marginBottom: normalize(24)
  },
  h2: {
    color: colors.darkText,
    fontSize: normalize(20),
    fontWeight: '400'
  },
  h3: {
    color: colors.darkText,
    fontFamily: 'titillium-web-bold',
    fontSize: normalize(18),
    fontWeight: '600'
  },
  h4: {
    color: colors.darkText,
    fontWeight: '400',
    fontSize: normalize(18)
  },
  h5: {
    color: colors.darkText,
    fontSize: normalize(16),
    fontWeight: '400'
  },
  h6: {
    color: colors.darkText,
    fontSize: normalize(14),
    fontWeight: '400'
  },
  b: {
    fontFamily: 'titillium-web-bold',
    fontWeight: '600'
  },
  strong: {
    fontFamily: 'titillium-web-bold',
    fontWeight: '600'
  },
  ul: {
    marginBottom: 0
  },
  ol: {
    marginBottom: 0
  }
};
