import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => true
}));

jest.mock('react-apollo', () => ({
  Query: ({ children }) => children({ data: {}, loading: false })
}));

jest.mock('react-native-snap-carousel', () => {
  const ReactLocal = require('react');

  return ReactLocal.forwardRef((props, ref) => {
    ReactLocal.useImperativeHandle(ref, () => ({
      startAutoplay: jest.fn(),
      stopAutoplay: jest.fn()
    }));

    return ReactLocal.createElement('mock-carousel', props, props.children);
  });
});

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  const MockIcon = () => ReactLocal.createElement('mock-icon');

  return {
    colors: {
      refreshControl: '#107821',
      surface: '#ffffff'
    },
    consts: {
      a11yLabel: {
        button: '(Taste)'
      }
    },
    Icon: {
      Pause: MockIcon,
      Play: MockIcon
    },
    normalize: (value: number) => value,
    texts: {
      accessibilityLabels: {
        actions: {
          pausePlayback: 'Wiedergabe pausieren',
          startPlayback: 'Wiedergabe starten'
        }
      }
    }
  };
});

jest.mock('../../src/helpers', () => ({
  graphqlFetchPolicy: () => 'cache-first',
  imageWidth: () => 320,
  isActive: () => true,
  shareMessage: () => 'share'
}));

jest.mock('../../src/hooks', () => ({
  useRefreshTime: () => 0
}));

jest.mock('../../src/components/ImagesCarouselItem', () => ({
  ImagesCarouselItem: () => null
}));

jest.mock('../../src/components/Image', () => ({
  Image: () => null
}));

jest.mock('../../src/components/MediaSection', () => ({
  MediaItem: () => null
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperHorizontal: ({ children }) => children
}));

jest.mock('../../src/NetworkProvider', () => {
  const ReactLocal = require('react');

  return {
    NetworkContext: ReactLocal.createContext({
      isConnected: true,
      isMainserverUp: true
    })
  };
});

jest.mock('../../src/queries', () => ({
  getQuery: () => ({})
}));

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { NetworkContext } from '../../src/NetworkProvider';
import { OrientationContext } from '../../src/OrientationProvider';
import { SettingsContext } from '../../src/SettingsProvider';
import { ImagesCarousel } from '../../src/components/ImagesCarousel';
import { MediaCarousel } from '../../src/components/MediaCarousel';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

const wrapWithContexts = (element: React.ReactElement) => (
  <AccessibilityContext.Provider
    value={{
      defaults: {
        boldTextEnabled: false,
        isGrayscaleEnabled: false,
        highContrastEnabled: false,
        readAloudEnabled: false,
        reduceMotionEnabled: false,
        reduceTransparencyEnabled: false,
        textScaleLevel: 2
      },
      features: {
        boldText: true,
        headerEntry: true,
        highContrast: true,
        isGrayscaleEnabled: true,
        readAloud: true,
        reduceMotion: true,
        reduceTransparency: true,
        settingsEntry: true,
        textScaling: true
      },
      isBoldTextEnabled: false,
      isGrayscaleEnabled: false,
      isHighContrastEnabled: false,
      isInvertColorsEnabled: false,
      isReadAloudEnabled: false,
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: false,
      isScreenReaderEnabled: false,
      preferences: {
        boldTextEnabled: false,
        isGrayscaleEnabled: false,
        highContrastEnabled: false,
        readAloudEnabled: false,
        reduceMotionEnabled: false,
        reduceTransparencyEnabled: false,
        textScaleLevel: 2
      },
      resetPreferences: jest.fn(),
      setPreference: jest.fn(),
      setPreferences: jest.fn(),
      setTextScaleLevel: jest.fn(),
      system: {
        isBoldTextEnabled: false,
        isGrayscaleEnabled: false,
        isInvertColorsEnabled: false,
        isReduceMotionEnabled: false,
        isReduceTransparencyEnabled: false,
        isScreenReaderEnabled: false
      },
      textScaleMultiplier: 1
    }}
  >
    <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
      <OrientationContext.Provider
        value={{ dimensions: { height: 640, width: 360 }, orientation: 'portrait' }}
      >
        <SettingsContext.Provider
          value={{
            globalSettings: {
              settings: {
                sliderPauseButton: {
                  show: true
                }
              }
            }
          }}
        >
          {element}
        </SettingsContext.Provider>
      </OrientationContext.Provider>
    </NetworkContext.Provider>
  </AccessibilityContext.Provider>
);

describe('Carousel accessibility', () => {
  it('adds button semantics to the images carousel pause control', () => {
    const tree = renderWithAct(
      wrapWithContexts(
        <ImagesCarousel
          data={[{ picture: { url: 'https://example.com/1.jpg' } }, { picture: { url: 'x' } }]}
          navigation={{}}
        />
      )
    );

    const button = tree.root.findByType(TouchableOpacity);

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Wiedergabe pausieren (Taste)');
  });

  it('adds button semantics to the media carousel pause control', () => {
    const tree = renderWithAct(
      wrapWithContexts(
        <MediaCarousel
          mediaContents={[
            { contentType: 'image', id: '1', sourceUrl: { url: 'https://example.com/1.jpg' } },
            { contentType: 'image', id: '2', sourceUrl: { url: 'https://example.com/2.jpg' } }
          ]}
        />
      )
    );

    const button = tree.root.findByType(TouchableOpacity);

    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Wiedergabe pausieren (Taste)');
  });
});
