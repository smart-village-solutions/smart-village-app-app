import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

import { FloatingButton } from '../../src/components/FloatingButton';

const renderFloatingButton = (props) => {
  let testRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(<FloatingButton publicJsonFile="floatingButton" {...props} />);
  });

  return testRenderer;
};

const mockUseAccessibilityPreferences = jest.fn();
const mockUseStaticContent = jest.fn();
const mockUseHomeRefresh = jest.fn();
const mockGetCurrentRoute = jest.fn();
const mockIsReady = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../src/hooks', () => ({
  useAccessibilityPreferences: (...args) => mockUseAccessibilityPreferences(...args),
  useHomeRefresh: (...args) => mockUseHomeRefresh(...args),
  useStaticContent: (...args) => mockUseStaticContent(...args)
}));

jest.mock('../../src/navigation/navigationRef', () => ({
  navigationRef: {
    getCurrentRoute: (...args) => mockGetCurrentRoute(...args),
    isReady: (...args) => mockIsReady(...args),
    navigate: (...args) => mockNavigate(...args)
  }
}));

jest.mock('../../src/ReadAloudAvailabilityProvider', () => ({
  useReadAloudAvailability: () => ({
    getRouteItems: () => [],
    isRouteAvailable: () => false
  })
}));

jest.mock('../../src/components/FloatingReadAloudPlayer', () => ({
  FloatingReadAloudPlayer: () => null
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
          disableQuickToggle: 'Disable read aloud',
          enableQuickToggle: 'Enable read aloud'
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

    mockGetCurrentRoute.mockReturnValue({ name: 'Home' });
    mockIsReady.mockReturnValue(true);
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
});
