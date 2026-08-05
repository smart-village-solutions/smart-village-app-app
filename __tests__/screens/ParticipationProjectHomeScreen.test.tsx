/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

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
    TextListItem: ({ item }) => (
      <Text testID={`list-item-${item.id}`}>
        {[item.title, item.count, item.subtitle].filter((value) => value !== undefined).join('|')}
      </Text>
    ),
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
      completedCount: (count: number) => `${count} beendet`,
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
  PARTICIPATION_PROJECT_DEFAULT_STATUSES: ['active', 'announced'],
  PARTICIPATION_PROJECT_STATUS: {
    ACTIVE: 'active',
    ANNOUNCED: 'announced',
    COMPLETED: 'completed',
    ENDED: 'ended',
    RECENTLY_ENDED: 'recently_ended',
    EMPTY: 'empty'
  },
  PARTICIPATION_PROJECT_STATUS_FILTER: 'participationStatus',
  subtitle: jest.fn((...parts) => parts.filter(Boolean).join(' | ')),
  getParticipationProjectStatus: jest.fn(
    (item) =>
      ({
        beendet: 'ended',
        'kürzlich beendet': 'recently_ended'
      }[item.payload?.status?.trim().toLowerCase()] ||
      item.payload?.status?.trim().toLowerCase() ||
      'empty')
  ),
  getParticipationProjectPreviewDate: jest.fn(),
  isParticipationProjectCurrent: jest.fn(
    (item) =>
      item.payload?.status &&
      ['active', 'announced'].includes(item.payload.status.trim().toLowerCase())
  ),
  isParticipationProjectCompleted: jest.fn(
    (item) =>
      item.payload?.color === 'gray' ||
      ['completed', 'ended', 'recently_ended', 'beendet', 'kürzlich beendet'].includes(
        item.payload?.status?.trim().toLowerCase()
      )
  ),
  mainImageOfMediaContents: jest.fn(),
  matomoTrackingString: jest.fn((parts) => parts.join(' / ')),
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

  it('counts and features active and announced projects while reporting completed projects', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [
          {
            categories: [{ id: 'dialog', name: 'Dialog' }],
            contentBlocks: [],
            dates: [],
            id: 'active-project',
            mediaContents: [],
            payload: { itemIndex: 2, status: 'active', type: 'Dialog' },
            title: 'Aktives Projekt',
            webUrls: []
          },
          {
            categories: [{ id: 'dialog', name: 'Dialog' }],
            contentBlocks: [],
            dates: [],
            id: 'announced-project',
            mediaContents: [],
            payload: { itemIndex: 1, status: 'announced', type: 'Dialog' },
            title: 'Angekündigtes Projekt',
            webUrls: []
          },
          {
            categories: [{ id: 'dialog', name: 'Dialog' }],
            contentBlocks: [],
            dates: [],
            id: 'completed-project',
            mediaContents: [],
            payload: { itemIndex: 3, status: 'completed', type: 'Dialog' },
            title: 'Abgeschlossenes Projekt',
            webUrls: []
          },
          {
            categories: [{ id: 'dialog', name: 'Dialog' }],
            contentBlocks: [],
            dates: [],
            id: 'ended-project',
            mediaContents: [],
            payload: { color: 'gray', itemIndex: 4, status: 'Beendet', type: 'Dialog' },
            title: 'Beendetes Projekt',
            webUrls: []
          },
          {
            categories: [{ id: 'dialog', name: 'Dialog' }],
            contentBlocks: [],
            dates: [],
            id: 'recently-ended-project',
            mediaContents: [],
            payload: {
              color: 'gray',
              itemIndex: 5,
              status: 'Kürzlich beendet',
              type: 'Dialog'
            },
            title: 'Kürzlich beendetes Projekt',
            webUrls: []
          }
        ]
      },
      isLoading: false,
      refetch: jest.fn()
    });

    const navigation = { navigate: jest.fn() };
    const screen = render(<ParticipationProjectHomeScreen navigation={navigation as never} />);

    expect(screen.getByText('Dialog|2|3 beendet')).toBeTruthy();
    expect(screen.getByText('Aktives Projekt')).toBeTruthy();
    expect(screen.getByText('Angekündigtes Projekt')).toBeTruthy();
    expect(screen.queryByText('Abgeschlossenes Projekt')).toBeNull();
    expect(screen.queryByText('Beendetes Projekt')).toBeNull();
    expect(screen.queryByText('Kürzlich beendetes Projekt')).toBeNull();

    fireEvent.press(screen.getByText('Alle Beteiligungen ansehen'));

    expect(navigation.navigate).toHaveBeenCalledWith(
      'Index',
      expect.objectContaining({
        queryVariables: expect.objectContaining({
          participationStatus: ['active', 'announced']
        })
      })
    );
  });
});
