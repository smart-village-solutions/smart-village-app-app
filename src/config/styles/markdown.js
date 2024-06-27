import { colors } from '../colors';
import { normalize } from '../normalize';

export const markdown = {
  paragraph: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    lineHeight: normalize(22),
    marginBottom: normalize(20),
    marginTop: 0
  },
  link: {
    color: colors.primary,
    fontFamily: 'bold',
    textDecorationLine: 'none'
  },
  heading1: {
    color: colors.darkText,
    fontFamily: 'condbold',
    fontSize: normalize(24),
    lineHeight: normalize(30),
    marginBottom: normalize(24)
  },
  heading2: {
    color: colors.darkText,
    fontFamily: 'condbold',
    fontSize: normalize(20),
    lineHeight: normalize(26),
    marginBottom: normalize(14)
  },
  heading3: {
    color: colors.darkText,
    fontFamily: 'condbold',
    fontSize: normalize(18),
    lineHeight: normalize(24)
  },
  heading4: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(18),
    fontWeight: '400',
    lineHeight: normalize(24)
  },
  heading5: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(16),
    fontWeight: '400'
  },
  heading6: {
    color: colors.darkText,
    fontFamily: 'regular',
    fontSize: normalize(14),
    fontWeight: '400'
  },
  strong: {
    fontFamily: 'bold'
  },
  bullet_list: {
    marginBottom: 0
  },
  ordered_list: {
    marginBottom: 0
  },
  image: {
    alignSelf: 'center'
  },
  em: {
    fontFamily: 'italic'
  },
  table: {
    borderWidth: 0.25,
    borderColor: '#b5b5b5',
    fontSize: normalize(13),
    marginBottom: normalize(20)
  },
  th: {
    borderColor: '#3f5c7a',
    fontWeight: '400'
  },
  td: {
    borderColor: '#b5b5b5'
  },
  tr: {
    borderColor: '#b5b5b5'
  }
};
