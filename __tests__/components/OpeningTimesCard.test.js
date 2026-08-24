/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { render } from '@testing-library/react-native';

import { OpeningTimesCard } from '../../src/components/screens/OpeningTimesCard';

jest.mock('../../src/config', () => ({
  normalize: (value) => value,
  texts: {
    eventRecord: {
      appointmentsShowMoreButton: 'Weitere Termine'
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  momentFormat: (value) => {
    const [year, month, day] = `${value}`.slice(0, 10).split('-');

    return `${day}.${month}.${year}`;
  }
}));

jest.mock('../../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({ gray60: '#999999' })
}));

jest.mock('../../src/components/HtmlView', () => ({ HtmlView: () => null }));
jest.mock('../../src/components/Text', () => {
  const ReactInMock = require('react');
  const { Text: MockText } = require('react-native');
  const TextComponent = ({ children }) => ReactInMock.createElement(MockText, null, children);

  return { BoldText: TextComponent, RegularText: TextComponent };
});
jest.mock('../../src/components/Touchable', () => {
  const ReactInMock = require('react');
  const { View: MockView } = require('react-native');

  return {
    Touchable: ({ children }) => ReactInMock.createElement(MockView, null, children)
  };
});
jest.mock('../../src/components/Wrapper', () => {
  const ReactInMock = require('react');
  const { View: MockView } = require('react-native');
  const WrapperComponent = ({ children }) => ReactInMock.createElement(MockView, null, children);

  return {
    WrapperHorizontal: WrapperComponent,
    WrapperRow: WrapperComponent,
    WrapperVertical: WrapperComponent
  };
});

describe('OpeningTimesCard inline date and time', () => {
  it('renders the date before the start time with one clock suffix', () => {
    const screen = render(
      <OpeningTimesCard
        inlineDateTime
        openingHours={[
          {
            dateFrom: '2026-09-01',
            open: true,
            timeFrom: '18:30 Uhr',
            useYear: true
          }
        ]}
      />
    );

    expect(screen.getByText('01.09.2026 18:30 Uhr')).toBeTruthy();
  });

  it('keeps date ranges readable when no time is available', () => {
    const screen = render(
      <OpeningTimesCard
        inlineDateTime
        openingHours={[
          {
            dateFrom: '2026-08-14',
            dateTo: '2026-09-18',
            open: true,
            useYear: true
          }
        ]}
      />
    );

    expect(screen.getByText('14.08.2026 bis 18.09.2026')).toBeTruthy();
  });
});
