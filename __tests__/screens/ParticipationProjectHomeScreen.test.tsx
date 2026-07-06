/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { render } from '@testing-library/react-native';

import { ParticipationProjectHomeScreen } from '../../src/screens/ParticipationProject/ParticipationProjectHomeScreen';

jest.mock('react-query', () => ({
  useQuery: jest.fn()
}));

jest.mock('../../src/ReactQueryClient', () => ({
  ReactQueryClient: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEMS: 'genericItems'
  },
  getQuery: jest.fn()
}));

jest.mock('../../src/hooks', () => ({
  HOME_REFRESH_EVENT: 'HOME_REFRESH_EVENT',
  useMatomoTrackScreenView: jest.fn(),
  useStaticContent: jest.fn()
}));

jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudScrollContentContainerStyle: jest.fn((style) => style)
}));

jest.mock('../../src/components', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    Button: ({ onPress, title }) => <Text onPress={onPress}>{title}</Text>,
    ConnectedImagesCarousel: () => <View testID="carousel" />,
    EmptyMessage: ({ title }) => <Text>{title}</Text>,
    HtmlView: ({ html }) => <Text>{html}</Text>,
    LoadingSpinner: () => <Text>loading</Text>,
    ReadAloudContent: ({ contentId }) => <View testID={contentId} />,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    SectionHeader: ({ title }) => <Text>{title}</Text>,
    TextListItem: ({ item }) => <Text>{item.title}</Text>,
    WrapperVertical: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    refreshControl: '#000000'
  },
  consts: {
    ROOT_ROUTE_NAMES: {
      PARTICIPATION_PROJECTS: 'participation-projects'
    },
    MATOMO_TRACKING: {
      SCREEN_VIEW: {
        PARTICIPATION_PROJECTS: 'participation-projects'
      }
    },
    a11yLabel: {
      button: '(Taste)'
    }
  },
  normalize: (value: number) => value,
  texts: {
    participationProject: {
      categories: 'Beteiligungsarten',
      categoryCount: (count: number) => `${count} Projekte`,
      empty: 'Keine Beteiligungsprojekte gefunden.',
      featuredProjects: 'Empfohlen',
      participationProject: 'Beteiligungsprojekt',
      participationProjects: 'Beteiligungsprojekte',
      showAll: 'Alle Beteiligungen ansehen'
    },
    screenTitles: {
      participationProject: {
        home: 'Beteiligung',
        index: 'Beteiligungsprojekte'
      }
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  subtitle: jest.fn((...parts) => parts.filter(Boolean).join(' | ')),
  getParticipationProjectDatePrefix: jest.fn(),
  mainImageOfMediaContents: jest.fn(),
  matomoTrackingString: jest.fn((parts) => parts.join(' / ')),
  momentFormatUtcToLocal: jest.fn(),
  removeHtml: jest.fn((value) => value),
  trimNewLines: jest.fn((value) => value)
}));

const { useQuery } = jest.requireMock('react-query') as {
  useQuery: jest.Mock;
};
const { useStaticContent } = jest.requireMock('../../src/hooks') as {
  useStaticContent: jest.Mock;
};

describe('ParticipationProjectHomeScreen', () => {
  beforeEach(() => {
    useStaticContent.mockReset();
    useQuery.mockReset();

    useStaticContent
      .mockReturnValueOnce({
        data: {},
        loading: false,
        refetch: jest.fn()
      })
      .mockReturnValueOnce({
        data: '<p>Intro zum Beteiligungsportal</p>',
        loading: false,
        refetch: jest.fn()
      });

    useQuery.mockReturnValue({
      data: { genericItems: [] },
      isLoading: false,
      refetch: jest.fn()
    });
  });

  it('renders intro content without read aloud controls on the overview page', () => {
    const { getByText, queryByTestId } = render(
      <ParticipationProjectHomeScreen navigation={{ navigate: jest.fn() } as never} />
    );

    expect(getByText('<p>Intro zum Beteiligungsportal</p>')).toBeTruthy();
    expect(queryByTestId('participation-project-home-content')).toBeNull();
  });
});
