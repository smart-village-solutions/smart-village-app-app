/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { RefreshControl } from 'react-native';

import { darkColors } from '../../src/config/colors';
import { ParticipationProjectHomeScreen } from '../../src/screens/ParticipationProject/ParticipationProjectHomeScreen';
import { ThemeContext } from '../../src/ThemeContext';

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

jest.mock('../../src/components', () => {
  const React = require('react');
  const { Text, View } = require('react-native');

  return {
    Button: ({ onPress, title }) => <Text onPress={onPress}>{title}</Text>,
    ConnectedImagesCarousel: () => <View testID="carousel" />,
    EmptyMessage: ({ title }) => <Text>{title}</Text>,
    HtmlView: ({ html }) => <Text>{html}</Text>,
    LoadingSpinner: () => <Text>loading</Text>,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    SectionHeader: ({ title }) => <Text>{title}</Text>,
    TextListItem: ({ item, navigation }) => (
      <Text
        testID={`list-item-${item.id}`}
        onPress={() => navigation.navigate(item.routeName, item.params)}
      >
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

jest.mock('../../src/helpers/participationProjectHelper', () => ({
  PARTICIPATION_PROJECT_DEFAULT_STATUSES: ['active'],
  PARTICIPATION_PROJECT_STATUS: {
    ACTIVE: 'active',
    ANNOUNCED: 'announced',
    COMPLETED: 'completed',
    ENDED: 'ended',
    RECENTLY_ENDED: 'recently_ended',
    EMPTY: 'empty'
  },
  PARTICIPATION_PROJECT_STATUS_FILTER: 'participationStatus',
  PARTICIPATION_PROJECT_STATUS_POSITION: {
    BELOW_TEASER: 'belowTeaser',
    REPLACE_TEASER: 'replaceTeaser'
  },
  PARTICIPATION_PROJECT_STATUS_POSITION_PARAM: 'participationStatusPosition',
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
  getParticipationProjectStatusColor: jest.fn((item) => item.payload?.statusColor),
  getParticipationProjectStatusLabel: jest.fn((item) => item.payload?.status),
  isParticipationProjectActive: jest.fn(
    (item) => item.payload?.status?.trim().toLowerCase() === 'active'
  ),
  normalizeParticipationProjectStatusPosition: jest.fn((value) =>
    value === 'replaceTeaser' ? 'replaceTeaser' : 'belowTeaser'
  )
}));

jest.mock('../../src/helpers/htmlViewHelper', () => ({
  removeHtml: jest.fn((value) => value),
  shareMessage: jest.fn((item) => `Teilen: ${item.title}`),
  trimNewLines: jest.fn((value) => value)
}));

jest.mock('../../src/helpers/imageHelper', () => ({
  mainImageOfMediaContents: jest.fn()
}));

jest.mock('../../src/helpers/matomoHelper', () => ({
  matomoTrackingString: jest.fn((parts) => parts.join(' / '))
}));

jest.mock('../../src/helpers/textHelper', () => ({
  subtitle: jest.fn((...parts) => parts.filter(Boolean).join(' | '))
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

  it('uses the active theme color for pull to refresh', () => {
    const screen = render(
      <ThemeContext.Provider value={{ colors: darkColors, isDark: true, mode: 'dark' }}>
        <ParticipationProjectHomeScreen navigation={{ navigate: jest.fn() } as never} />
      </ThemeContext.Provider>
    );
    const refreshControl = screen.UNSAFE_getByType(RefreshControl);

    expect(refreshControl.props.colors).toEqual([darkColors.refreshControl]);
    expect(refreshControl.props.tintColor).toBe(darkColors.refreshControl);
  });

  it('shows only the active count and uses active projects as the default list selection', () => {
    useQuery.mockReturnValue({
      data: {
        genericItems: [
          {
            categories: [{ id: 'dialog', name: 'Dialog' }],
            contentBlocks: [{ body: 'Untertitel des aktiven Projekts', id: 'active-body' }],
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
            payload: { itemIndex: 4, status: 'Beendet', statusColor: 'gray', type: 'Dialog' },
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
              itemIndex: 5,
              status: 'Kürzlich beendet',
              statusColor: 'gray',
              type: 'Dialog'
            },
            title: 'Kürzlich beendetes Projekt',
            webUrls: []
          },
          {
            categories: [{ id: 'archive', name: 'Archiv' }],
            contentBlocks: [],
            dates: [],
            id: 'archived-project',
            mediaContents: [],
            payload: { itemIndex: 6, status: 'completed', type: 'Dialog' },
            title: 'Archiviertes Projekt',
            webUrls: []
          }
        ]
      },
      isLoading: false,
      refetch: jest.fn()
    });

    const navigation = { navigate: jest.fn() };
    const screen = render(<ParticipationProjectHomeScreen navigation={navigation as never} />);

    expect(screen.getByText('Dialog|1')).toBeTruthy();
    expect(screen.getByText('Aktives Projekt')).toBeTruthy();
    expect(screen.queryByText('Untertitel des aktiven Projekts')).toBeNull();
    expect(screen.queryByText('Angekündigtes Projekt')).toBeNull();
    expect(screen.queryByText('Abgeschlossenes Projekt')).toBeNull();
    expect(screen.queryByText('Beendetes Projekt')).toBeNull();
    expect(screen.queryByText('Kürzlich beendetes Projekt')).toBeNull();
    expect(screen.queryByText('Archiv|0')).toBeNull();

    fireEvent.press(screen.getByText('Aktives Projekt'));

    expect(navigation.navigate).toHaveBeenCalledWith(
      'Detail',
      expect.objectContaining({
        shareContent: { message: 'Teilen: Aktives Projekt' },
        suffix: 'ParticipationProject'
      })
    );

    fireEvent.press(screen.getByText('Alle Beteiligungen ansehen'));

    expect(navigation.navigate).toHaveBeenCalledWith(
      'Index',
      expect.objectContaining({
        queryVariables: expect.objectContaining({
          participationStatus: ['active'],
          participationStatusPosition: 'belowTeaser'
        })
      })
    );
  });

  it('forwards the teaser replacement design from static configuration', () => {
    useStaticContent.mockReset();
    useStaticContent
      .mockReturnValueOnce({
        data: { statusPosition: 'replaceTeaser' },
        loading: false,
        refetch: jest.fn()
      })
      .mockReturnValueOnce({
        data: undefined,
        loading: false,
        refetch: jest.fn()
      });

    const navigation = { navigate: jest.fn() };
    const screen = render(<ParticipationProjectHomeScreen navigation={navigation as never} />);

    fireEvent.press(screen.getByText('Alle Beteiligungen ansehen'));

    expect(navigation.navigate).toHaveBeenCalledWith(
      'Index',
      expect.objectContaining({
        queryVariables: expect.objectContaining({
          participationStatusPosition: 'replaceTeaser'
        })
      })
    );
  });
});
