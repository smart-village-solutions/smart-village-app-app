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

    textDecorationLine: 'none'
  },
  h1: {
    color: colors.darkText,
    fontFamily: 'titillium-web-bold',
    fontSize: normalize(24),
    lineHeight: normalize(30),
    marginBottom: normalize(24)
  },
  h2: {
    color: colors.darkText,
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(20),
    fontWeight: '400',
    lineHeight: normalize(24),
    marginBottom: normalize(14)
  },
  h3: {
    color: colors.darkText,
    fontFamily: 'titillium-web-bold',
    fontSize: normalize(18)
  },
  h4: {
    color: colors.darkText,
    fontWeight: '400',
    fontSize: normalize(18)
  },
  h5: {
    color: colors.darkText,
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(16),
    fontWeight: '400'
  },
  h6: {
    color: colors.darkText,
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(14),
    fontWeight: '400'
  },
  b: {
    fontFamily: 'titillium-web-bold'
  },
  strong: {
    fontFamily: 'titillium-web-bold'
  },
  ul: {
    marginBottom: 0
  },
  ol: {
    marginBottom: 0
  },
  img: {
    alignSelf: 'center'
  }
};
