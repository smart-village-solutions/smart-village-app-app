/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, Text, View } from 'react-native';

import { ParticipationProjectDetail } from '../../src/components/screens/ParticipationProjectDetail';

jest.mock('../../src/config', () => ({
  colors: {
    accent: '#006600',
    darkText: '#111111',
    gray60: '#bbbbbb',
    placeholder: '#888888',
    primary: '#008000'
  },
  consts: {
    a11yLabel: {
      button: 'Taste'
    }
  },
  Icon: {
    NamedIcon: () => null
  },
  normalize: (value: number) => value,
  texts: {
    eventRecord: {
      appointments: 'Termine',
      description: 'Beschreibung'
    },
    participationProject: {
      calendarExport: 'Termin speichern',
      empty: 'Keine Inhalte',
      openProject: 'Beteiligung öffnen',
      overview: 'Übersicht',
      participationProject: 'Beteiligung',
      portalHint: 'Portalhinweis',
      status: 'Status'
    },
    pointOfInterest: {
      operatingCompany: 'Betreiber'
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  PARTICIPATION_PROJECT_STATUS: {
    ACTIVE: 'active',
    ANNOUNCED: 'announced',
    COMPLETED: 'completed',
    ENDED: 'ended',
    RECENTLY_ENDED: 'recently_ended',
    EMPTY: 'empty'
  },
  buildParticipationProjectCalendarValues: jest.fn(() => ({
    endDatetime: '2026-08-24T11:00:00',
    startDatetime: '2026-08-24T10:00:00'
  })),
  getGenericItemMatomoName: jest.fn(() => 'ParticipationProject'),
  getParticipationProjectBody: jest.fn(),
  getParticipationProjectLocationText: jest.fn(),
  getParticipationProjectPlainBody: jest.fn(),
  getParticipationProjectStatus: jest.fn(() => 'recently_ended'),
  getParticipationProjectStatusColor: jest.fn((item) => item.payload?.statusColor),
  getParticipationProjectStatusLabel: jest.fn((item) =>
    typeof item.payload?.status === 'string' ? item.payload.status : item.payload?.status?.label
  ),
  getParticipationProjectType: jest.fn(),
  hasParticipationProjectContent: jest.fn(() => true),
  matomoTrackingString: jest.fn(() => 'ParticipationProject'),
  normalizeParticipationProjectDates: jest.fn(() => []),
  normalizeParticipationProjectValue: jest.fn((value) => value)
}));

jest.mock('../../src/helpers/createCalendarEvent', () => ({
  createCalendarEvent: jest.fn()
}));

jest.mock('../../src/hooks', () => ({
  useMatomoTrackScreenView: jest.fn(),
  useOpenWebScreen: jest.fn(() => jest.fn())
}));

jest.mock('../../src/components/Button', () => ({ Button: () => null }));
jest.mock('../../src/components/DataProviderButton', () => ({ DataProviderButton: () => null }));
jest.mock('../../src/components/DataProviderNotice', () => ({ DataProviderNotice: () => null }));
jest.mock('../../src/components/ImageSection', () => ({ ImageSection: () => null }));
jest.mock('../../src/components/SectionHeader', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return { SectionHeader: ({ title }) => <Text>{title}</Text> };
});
jest.mock('../../src/components/StorySection', () => ({ StorySection: () => null }));
jest.mock('../../src/components/Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const MockText = ({ children, ...props }) => <Text {...props}>{children}</Text>;

  return { HeadlineText: MockText, RegularText: MockText };
});
jest.mock('../../src/components/Wrapper', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockWrapper = ({ children, ...props }) => <View {...props}>{children}</View>;

  return {
    Wrapper: MockWrapper,
    WrapperHorizontal: MockWrapper,
    WrapperRow: MockWrapper,
    WrapperVertical: MockWrapper
  };
});
jest.mock('../../src/components/infoCard', () => ({ InfoCard: () => null }));
jest.mock('../../src/components/screens/OpeningTimesCard', () => ({
  OpeningTimesCard: () => null
}));
jest.mock('../../src/components/screens/OperatingCompany', () => ({
  OperatingCompany: () => null
}));

describe('ParticipationProjectDetail status', () => {
  it('renders detail actions at the end of the overview section', () => {
    const screen = render(
      <ParticipationProjectDetail
        data={
          {
            categories: [],
            contacts: [{ firstName: 'Erika' }],
            contentBlocks: [],
            dates: [],
            id: 'participation-project-actions',
            mediaContents: [],
            payload: {},
            title: 'Beteiligung mit Aktionen',
            webUrls: []
          } as never
        }
        readAloudControls={<Text>Bookmark und Teilen</Text>}
        route={{ params: { title: 'Beteiligung' } }}
      />
    );
    const renderedTexts = screen.UNSAFE_getAllByType(Text).map((text) => text.props.children);

    expect(renderedTexts.indexOf('Übersicht')).toBeLessThan(
      renderedTexts.indexOf('Termin speichern')
    );
    expect(renderedTexts.indexOf('Termin speichern')).toBeLessThan(
      renderedTexts.indexOf('Bookmark und Teilen')
    );
  });

  it('renders status color and text with one screen-reader label', () => {
    const screen = render(
      <ParticipationProjectDetail
        data={
          {
            categories: [],
            contentBlocks: [],
            dates: [],
            id: 'participation-project-1',
            mediaContents: [],
            payload: {
              status: 'Kürzlich beendet',
              statusColor: 'gray'
            },
            title: 'Beteiligung zum Stadtpark',
            webUrls: []
          } as never
        }
        route={{ params: { title: 'Beteiligung' } }}
      />
    );

    expect(screen.getByText('Kürzlich beendet')).toBeTruthy();
    expect(screen.getByLabelText('Status: Kürzlich beendet')).toBeTruthy();
    const statusDotStyle = screen
      .UNSAFE_getAllByType(View)
      .map((view) => StyleSheet.flatten(view.props.style))
      .find((style) => style?.backgroundColor === 'gray');

    expect(statusDotStyle).toMatchObject({
      borderColor: '#111111',
      height: 12,
      width: 12
    });
  });

  it('does not derive a frontend color when the API omits the status color', () => {
    const screen = render(
      <ParticipationProjectDetail
        data={
          {
            categories: [],
            contentBlocks: [],
            dates: [],
            id: 'participation-project-2',
            mediaContents: [],
            payload: {
              status: 'Aktiv'
            },
            title: 'Beteiligung ohne API-Farbe',
            webUrls: []
          } as never
        }
        route={{ params: { title: 'Beteiligung' } }}
      />
    );

    expect(screen.getByLabelText('Status: Aktiv')).toBeTruthy();
    expect(
      screen
        .UNSAFE_getAllByType(View)
        .some((view) =>
          ['#008000', '#006600', '#888888'].includes(
            StyleSheet.flatten(view.props.style)?.backgroundColor
          )
        )
    ).toBe(false);
  });
});
