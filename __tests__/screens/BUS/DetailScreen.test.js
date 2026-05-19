import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockTextBlock = jest.fn();
const mockAuthority = jest.fn();
const mockPersons = jest.fn();
const mockUseBusService = jest.fn();
const mockUseMatomoTrackScreenView = jest.fn();
const mockUseOpenWebScreen = jest.fn(() => jest.fn());

jest.mock('../../../src/hooks', () => ({
  useBusService: (...args) => mockUseBusService(...args),
  useMatomoTrackScreenView: (...args) => mockUseMatomoTrackScreenView(...args),
  useOpenWebScreen: (...args) => mockUseOpenWebScreen(...args)
}));

jest.mock('../../../src/components', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const BackToTop = () => <RNView />;
  const Button = () => <RNView />;
  const SafeAreaViewFlex = ({ children }) => <RNView>{children}</RNView>;

  SafeAreaViewFlex.propTypes = {
    children: ActualPropTypes.node
  };

  return { BackToTop, Button, SafeAreaViewFlex };
});

jest.mock('../../../src/components/BUS/TextBlock', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const TextBlock = (props) => {
    mockTextBlock(props);

    return <RNView />;
  };

  TextBlock.propTypes = {
    bottomDivider: ActualPropTypes.bool,
    openWebScreen: ActualPropTypes.func,
    textBlock: ActualPropTypes.object
  };

  return { TextBlock };
});

jest.mock('../../../src/components/BUS/Authority', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const Authority = (props) => {
    mockAuthority(props);

    return <RNView />;
  };

  Authority.propTypes = {
    bottomDivider: ActualPropTypes.bool,
    data: ActualPropTypes.object,
    openWebScreen: ActualPropTypes.func
  };

  return { Authority };
});

jest.mock('../../../src/components/BUS/Persons', () => {
  const ActualPropTypes = jest.requireActual('prop-types');
  const { View: RNView } = jest.requireActual('react-native');

  const Persons = (props) => {
    mockPersons(props);

    return <RNView />;
  };

  Persons.propTypes = {
    data: ActualPropTypes.object,
    openWebScreen: ActualPropTypes.func
  };

  return { Persons };
});

jest.mock('../../../src/components/FeedbackFooter', () => ({
  FeedbackFooter: () => {
    const { View: RNView } = jest.requireActual('react-native');

    return <RNView />;
  }
}));

jest.mock('../../../src/components/LoadingSpinner', () => ({
  LoadingSpinner: () => {
    const { View: RNView } = jest.requireActual('react-native');

    return <RNView />;
  }
}));

jest.mock('../../../src/SettingsProvider', () => {
  const ReactActual = jest.requireActual('react');

  return {
    SettingsContext: ReactActual.createContext({
      globalSettings: {
        settings: {
          bus: {}
        }
      }
    })
  };
});

jest.mock('../../../src/config', () => ({
  colors: {
    refreshControl: '#00f'
  },
  consts: {
    MATOMO_TRACKING: {
      SCREEN_VIEW: {
        BUS: 'BUS'
      }
    }
  },
  device: {
    height: 1000
  },
  normalize: (value) => value
}));

jest.mock('../../../src/helpers', () => ({
  matomoTrackingString: () => 'BUS',
  openLink: jest.fn()
}));

describe('BUS DetailScreen', () => {
  const route = {
    params: {
      areaId: '09162000',
      data: {
        id: 'service-1'
      },
      rootRouteName: 'BUS',
      title: 'Meldebescheinigung'
    }
  };

  beforeEach(() => {
    mockTextBlock.mockClear();
    mockAuthority.mockClear();
    mockPersons.mockClear();
    mockUseMatomoTrackScreenView.mockClear();
    mockUseOpenWebScreen.mockClear();

    mockUseBusService.mockReturnValue({
      data: {
        id: 'service-1',
        organisationalUnits: [{ id: 'ou-1', name: 'Buergeramt' }],
        persons: [{ id: 'person-1' }],
        textBlocks: [
          {
            type: { id: 'tb-1', name: 'Kurztext' },
            text: 'Kurzbeschreibung'
          },
          {
            type: { id: 'tb-2', name: 'Volltext' },
            text: 'Ausfuehrlich'
          },
          {
            type: { id: 'tb-3', name: 'Formulare' },
            text: 'Formulare'
          }
        ]
      },
      isLoading: false,
      refetch: jest.fn()
    });
  });

  it('renders Kurztext and Volltext first without forcing a divider between accordion groups', () => {
    const { DetailScreen } = require('../../../src/screens/BUS/DetailScreen');

    act(() => {
      renderer.create(<DetailScreen route={route} />);
    });

    expect(mockTextBlock.mock.calls.map(([props]) => props.textBlock.type.name)).toEqual([
      'Kurztext',
      'Volltext',
      'Formulare'
    ]);

    expect(mockTextBlock.mock.calls[0][0].bottomDivider).toBe(false);
    expect(mockTextBlock.mock.calls[1][0].bottomDivider).toBe(false);
    expect(mockAuthority.mock.calls[0][0].bottomDivider).toBe(false);
  });
});
