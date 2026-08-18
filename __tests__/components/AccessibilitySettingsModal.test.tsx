import React from 'react';
import * as ReactNative from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

const mockResetPreferences = jest.fn();

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    bottom: 34,
    left: 0,
    right: 0,
    top: 59
  })
}));

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  return {
    Divider: (props: unknown) => ReactLocal.createElement('mock-divider', props),
    Overlay: ({ children, ...props }) => ReactLocal.createElement('mock-overlay', props, children)
  };
});

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  return {
    colors: {
      darkText: '#141414',
      surface: '#FFFFFF',
      transparent: 'transparent'
    },
    consts: {
      a11yLabel: {
        button: '(Taste)',
        closeIcon: 'Schließen (Taste)'
      }
    },
    Icon: {
      Close: (props: unknown) => ReactLocal.createElement('mock-close-icon', props)
    },
    normalize: (value: number) => value,
    texts: {
      accessibilityModal: {
        description: 'Passe die Barrierefreiheits-Optionen direkt im aktuellen Bildschirm an.',
        title: 'Barrierefreiheit'
      },
      settingsContents: {
        accessibility: {
          reset: 'Auf Standardwerte zurücksetzen'
        }
      }
    }
  };
});

jest.mock('../../src/hooks', () => ({
  useAccessibilityPreferences: () => ({
    resetPreferences: mockResetPreferences
  })
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({
      isReduceMotionEnabled: false
    })
  };
});

jest.mock('../../src/components/settings', () => ({
  AccessibilitySettings: (props: unknown) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-accessibility-settings', props);
  }
}));

jest.mock('../../src/components/AppWideGrayscaleFilter', () => ({
  AppWideGrayscaleFilter: ({ children, ...props }) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-grayscale-filter', props, children);
  }
}));

jest.mock('../../src/components/Text', () => ({
  HeadlineText: ({ children }) => children,
  RegularText: ({ children, ...props }) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-regular-text', props, children);
  }
}));

jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }) => children,
  WrapperHorizontal: ({ children }) => children
}));

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { AccessibilitySettingsModal } from '../../src/components/AccessibilitySettingsModal';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('AccessibilitySettingsModal', () => {
  beforeEach(() => {
    mockResetPreferences.mockClear();
    jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({
      fontScale: 1,
      height: 844,
      scale: 3,
      width: 390
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the overview filter close affordance and moves reset into a fixed footer link', () => {
    const tree = renderWithAct(
      <AccessibilityContext.Provider value={{ isReduceMotionEnabled: false } as never}>
        <AccessibilitySettingsModal isVisible onClose={jest.fn()} />
      </AccessibilityContext.Provider>
    );

    const closeButton = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Schließen (Taste)'
    );
    const closeIcon = tree.root.findByType('mock-close-icon');
    const overlay = tree.root.findByType('mock-overlay');
    const settings = tree.root.findByType('mock-accessibility-settings');
    const scrollView = tree.root.findByType(ScrollView);
    const descriptionInHeader = tree.root.findAll(
      (node) => node.type === 'mock-regular-text' && node.props.testID === 'accessibility-modal-description'
    )[0];
    const resetLink = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Auf Standardwerte zurücksetzen (Taste)'
    );
    const dividers = tree.root.findAllByType('mock-divider');

    expect(closeButton?.props.style).toEqual(
      expect.objectContaining({
        height: 32,
        width: 32
      })
    );
    expect(closeButton?.props.style.backgroundColor).toBeUndefined();
    expect(closeIcon.props.color).toBe('#141414');
    expect(closeIcon.props.size).toBe(20);
    expect(Object.assign({}, ...overlay.props.overlayStyle.filter(Boolean)).maxHeight).toEqual(
      expect.any(Number)
    );
    expect(closeButton?.props.style).toEqual(
      expect.objectContaining({
        height: 32,
        justifyContent: 'center',
        width: 32
      })
    );
    expect(settings.props.withResetButton).toBe(false);
    expect(descriptionInHeader).toBeDefined();
    expect(scrollView.findAllByProps({ testID: 'accessibility-modal-description' })).toHaveLength(0);
    expect(dividers).toHaveLength(2);
    expect(scrollView.findAll((node) => node.props.accessibilityLabel).map((node) => node.props.accessibilityLabel)).not.toContain(
      'Auf Standardwerte zurücksetzen (Taste)'
    );
    expect(resetLink).toBeDefined();
  });

  it('triggers preference reset from the footer link', () => {
    const tree = renderWithAct(
      <AccessibilityContext.Provider value={{ isReduceMotionEnabled: false } as never}>
        <AccessibilitySettingsModal isVisible onClose={jest.fn()} />
      </AccessibilityContext.Provider>
    );

    const resetLink = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Auf Standardwerte zurücksetzen (Taste)'
    );

    renderer.act(() => {
      resetLink?.props.onPress();
    });

    expect(mockResetPreferences).toHaveBeenCalledTimes(1);
  });

  it('applies modal accessibility styling for bold text, grayscale, contrast and transparency', () => {
    const tree = renderWithAct(
      <AccessibilityContext.Provider
        value={
          {
            isBoldTextEnabled: true,
            isGrayscaleEnabled: true,
            isHighContrastEnabled: true,
            isReduceMotionEnabled: false,
            isReduceTransparencyEnabled: true
          } as never
        }
      >
        <AccessibilitySettingsModal isVisible onClose={jest.fn()} />
      </AccessibilityContext.Provider>
    );

    const overlay = tree.root.findByType('mock-overlay');
    const grayscaleFilter = tree.root.findByType('mock-grayscale-filter');
    const headerTitle = tree.root.findAll(
      (node) => node.type === 'mock-regular-text' && node.props.center === true
    )[0];
    const flattenedOverlayStyle = Object.assign({}, ...overlay.props.overlayStyle.filter(Boolean));
    const flattenedHeaderTitleStyle = Object.assign({}, ...headerTitle.props.style.filter(Boolean));

    expect(overlay.props.backdropStyle).toEqual(expect.objectContaining({ backgroundColor: '#141414' }));
    expect(flattenedOverlayStyle).toEqual(
      expect.objectContaining({
        backgroundColor: '#FFFFFF',
        borderColor: '#141414',
        borderWidth: 1
      })
    );
    expect(grayscaleFilter.props.fillContainer).toBe(false);
    expect(grayscaleFilter.props.isGrayscaleEnabled).toBe(true);
    expect(grayscaleFilter.props.style).toEqual(expect.objectContaining({ backgroundColor: '#FFFFFF' }));
    expect(flattenedHeaderTitleStyle.fontFamily).toBe('bold');
  });
});
