import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

import { FloatingButton } from '../../src/components/FloatingButton';
import { lightColors } from '../../src/config/colors';
import { ThemeContext } from '../../src/ThemeContext';

const themeColors = {
  ...lightColors,
  darkText: '#111111',
  lightestText: '#ffffff',
  primary: '#000000',
  shadow: '#000000'
};

const renderFloatingButton = (props) => {
  let testRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(
      <ThemeContext.Provider value={{ colors: themeColors, isDark: false, mode: 'light' }}>
        <FloatingButton publicJsonFile="floatingButton" {...props} />
      </ThemeContext.Provider>
    );
  });

  return testRenderer;
};

const mockUseAccessibilityPreferences = jest.fn();
const mockUseStaticContent = jest.fn();
const mockUseHomeRefresh = jest.fn();
const mockGetCurrentRoute = jest.fn();
const mockIsReady = jest.fn();
const mockNavigate = jest.fn();
const mockAddListener = jest.fn();
const mockRemoveListener = jest.fn();
const mockGetRouteItems = jest.fn();
const mockIsRouteAvailable = jest.fn();

jest.mock('../../src/hooks', () => ({
  useAccessibilityPreferences: (...args) => mockUseAccessibilityPreferences(...args),
  useHomeRefresh: (...args) => mockUseHomeRefresh(...args),
  useStaticContent: (...args) => mockUseStaticContent(...args)
}));

jest.mock('../../src/navigation/navigationRef', () => ({
  navigationRef: {
    addListener: (...args) => mockAddListener(...args),
    getCurrentRoute: (...args) => mockGetCurrentRoute(...args),
    isReady: (...args) => mockIsReady(...args),
    navigate: (...args) => mockNavigate(...args)
  }
}));

jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudAvailability: () => ({
    getRouteItems: (...args) => mockGetRouteItems(...args),
    isRouteAvailable: (...args) => mockIsRouteAvailable(...args)
  })
}));

jest.mock('../../src/components/FloatingReadAloudPlayer', () => ({
  FloatingReadAloudPlayer: 'mock-read-aloud-player'
}));

jest.mock('@react-navigation/native', () => ({
  useNavigationState: (selector) => selector({})
}));

jest.mock('../../src/config', () => ({
  colors: {
    primary: '#000000',
    darkText: '#111111',
    lightestText: '#ffffff',
    shadow: '#000000'
  },
  normalize: (value) => value,
  texts: {
    settingsContents: {
      accessibility: {
        readAloud: {
          expandPlayer: 'Expand player'
        }
      }
    }
  },
  Icon: {
    NamedIcon: () => null
  }
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => null
}));

describe('FloatingButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseStaticContent.mockReturnValue({
      data: [],
      loading: false,
      refetch: jest.fn()
    });
    mockUseAccessibilityPreferences.mockReturnValue({
      features: { readAloud: false },
      preferences: { readAloudEnabled: false },
      setPreference: jest.fn()
    });

    mockGetRouteItems.mockReturnValue([]);
    mockIsRouteAvailable.mockReturnValue(false);
    mockGetCurrentRoute.mockReturnValue({ key: 'home-key', name: 'Home' });
    mockIsReady.mockReturnValue(true);
    mockAddListener.mockReturnValue(mockRemoveListener);
  });

  it('renders null while loading', () => {
    mockUseStaticContent.mockReturnValue({
      data: undefined,
      loading: true,
      refetch: jest.fn()
    });

    const tree = renderFloatingButton({ bottomOffset: 0 }).toJSON();

    expect(tree).toBeNull();
  });

  it('renders null when data is empty', () => {
    mockUseStaticContent.mockReturnValue({
      data: [],
      loading: false,
      refetch: jest.fn()
    });

    const tree = renderFloatingButton({ bottomOffset: 0 }).toJSON();

    expect(tree).toBeNull();
  });

  it('renders outside a navigator context and subscribes through navigationRef', () => {
    const testRenderer = renderFloatingButton({ bottomOffset: 0 });

    expect(testRenderer.toJSON()).toBeNull();
    expect(mockAddListener).toHaveBeenCalledWith('state', expect.any(Function));

    renderer.act(() => {
      testRenderer.unmount();
    });
    expect(mockRemoveListener).toHaveBeenCalled();
  });

  it('does not read the current route before navigation is ready', () => {
    mockIsReady.mockReturnValue(false);
    mockGetCurrentRoute.mockImplementation(() => {
      throw new Error('navigation is not ready');
    });
    mockUseStaticContent.mockReturnValue({
      data: [
        {
          accessibilityLabel: 'Visible everywhere',
          routeName: 'Search'
        }
      ],
      loading: false,
      refetch: jest.fn()
    });

    const tree = renderFloatingButton({ bottomOffset: 0 }).toJSON();

    expect(tree).not.toBeNull();
    expect(mockGetCurrentRoute).not.toHaveBeenCalled();
  });

  it('filters items by active route and keeps global items', () => {
    mockUseStaticContent.mockReturnValue({
      data: [
        {
          accessibilityLabel: 'Visible on Home',
          routeName: 'Home',
          visibleScreens: ['Home']
        },
        {
          accessibilityLabel: 'Hidden on Home',
          routeName: 'Web',
          visibleScreens: ['Index']
        },
        {
          accessibilityLabel: 'Visible everywhere',
          routeName: 'Search'
        }
      ],
      loading: false,
      refetch: jest.fn()
    });

    const testRenderer = renderFloatingButton({ bottomOffset: 0 });

    const buttons = testRenderer.root.findAllByType(TouchableOpacity);

    expect(buttons).toHaveLength(2);
    expect(buttons.map((button) => button.props.accessibilityLabel)).toEqual([
      'Visible on Home',
      'Visible everywhere'
    ]);
    expect(testRenderer.toJSON()).toMatchSnapshot();
  });

  it('updates visible items when navigationRef reports a route change', () => {
    mockUseStaticContent.mockReturnValue({
      data: [
        {
          accessibilityLabel: 'Visible on Index',
          routeName: 'Index',
          visibleScreens: ['Index']
        }
      ],
      loading: false,
      refetch: jest.fn()
    });

    const testRenderer = renderFloatingButton({ bottomOffset: 0 });
    expect(testRenderer.root.findAllByType(TouchableOpacity)).toHaveLength(0);

    mockGetCurrentRoute.mockReturnValue({ name: 'Index' });
    const stateListener = mockAddListener.mock.calls[0][1];
    renderer.act(() => {
      stateListener();
    });

    expect(testRenderer.root.findAllByType(TouchableOpacity)).toHaveLength(1);
  });

  it('navigates on press with configured route and params', () => {
    mockUseStaticContent.mockReturnValue({
      data: [
        {
          accessibilityLabel: 'Open Web',
          routeName: 'Web',
          params: { webUrl: 'https://example.com' }
        }
      ],
      loading: false,
      refetch: jest.fn()
    });

    const testRenderer = renderFloatingButton({ bottomOffset: 0 });

    const button = testRenderer.root.findByType(TouchableOpacity);
    renderer.act(() => {
      button.props.onPress();
    });

    expect(mockNavigate).toHaveBeenCalledWith('Web', { webUrl: 'https://example.com' });
  });

  it('keeps the always-active centered player visible when content is available', () => {
    mockIsRouteAvailable.mockReturnValue(true);
    mockUseAccessibilityPreferences.mockReturnValue({
      features: { readAloud: true }
    });

    const testRenderer = renderFloatingButton({ bottomOffset: 0 });
    const player = testRenderer.root.findByType('mock-read-aloud-player');

    expect(player.props.isEnabled).toBeUndefined();
    expect(player.props.onEnable).toBeUndefined();
    expect(player.props.onDisable).toBeUndefined();
  });

  it('shows the redesigned player while global read aloud is enabled', () => {
    mockIsRouteAvailable.mockReturnValue(true);
    mockUseAccessibilityPreferences.mockReturnValue({
      features: { readAloud: true }
    });

    const testRenderer = renderFloatingButton({ bottomOffset: 0 });

    expect(testRenderer.root.findAllByType(TouchableOpacity)).toHaveLength(0);
    expect(testRenderer.root.findByType('mock-read-aloud-player')).toBeTruthy();
  });
});
