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
    fontWeight: '600',
    textDecorationLine: 'none'
  },
  h1: {
    color: colors.darkText,
    fontWeight: '600',
    fontSize: normalize(24),
    lineHeight: normalize(22),
    marginBottom: normalize(24)
  },
  h2: {
    color: colors.darkText,
    fontWeight: '400',
    fontSize: normalize(20)
  },
  h3: {
    color: colors.darkText,
    fontWeight: '600',
    fontSize: normalize(18)
  },
  h4: {
    color: colors.darkText,
    fontWeight: '400',
    fontSize: normalize(18)
  },
  h5: {
    color: colors.darkText,
    fontWeight: '400',
    fontSize: normalize(16)
  },
  h6: {
    color: colors.darkText,
    fontWeight: '400',
    fontSize: normalize(14)
  },
  b: {
    fontWeight: '600'
  },
  strong: {
    fontWeight: '600'
  },
  ul: {
    marginBottom: 0
  },
  ol: {
    marginBottom: 0
  }
};
