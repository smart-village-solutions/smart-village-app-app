export const texts = {
  button: {
    back: 'Back',
    home: 'Home',
    share: 'Share'
  },

  // TODO: some texts like screenTitles from API later
  screenTitles: {
    events: 'Veranstaltungen',
    home: 'Bad Belzig',
    impress: 'Impressum',
    news: 'Nachrichten',
    policy: 'Datenschutz'
  }
};

import styled, { css } from 'styled-components/native';
import { colors } from './colors';

export const ScreenTitle = styled.Text`
  color: ${colors.darkText};
  font-weight: bold;
  text-align: center;
`;
